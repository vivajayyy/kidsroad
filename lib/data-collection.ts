/**
 * Event Data Collection with Intelligent Re-analysis
 * TourAPI에서 이벤트를 수집하고, 재분석 정책에 따라 선택적으로 enrichment 수행
 */

import { createClient } from '@supabase/supabase-js';
import type { Database, Tables, TablesInsert } from '../types/supabase';
import {
  fetchKidFriendlyEvents,
  fetchDetailCommon,
  fetchDetailIntroFestival,
  fetchDetailImages,
} from './tour-api';
import { mapTourApiToEvent } from '../utils/mapper';
import { enrichEventData } from './data-enrichment';
import { generateTags } from './tag-generator';
import { shouldReEnrich, EventStatus } from './enrichment-policy';
import { sendTelegramNotification } from './telegram-notifier';
import pLimit from 'p-limit';

/**
 * 지능형 이벤트 수집 및 저장
 * 재분석 정책에 따라 신규/재분석/스킵 분류하여 비용 최적화
 */
export async function collectAndSaveEvents() {
  const startTime = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase credentials are not set in environment variables.'
    );
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  console.log('--- Starting Intelligent Event Collection (Kid-Friendly Mode) ---');

  // Step 1: TourAPI에서 아이 관련 키워드로 이벤트 검색
  const today = new Date();

  console.log(`🔍 아이 친화적 행사 키워드 검색 시작...`);
  const keywordSearchResults = await fetchKidFriendlyEvents({
    numOfRows: 50,
  });

  if (keywordSearchResults.length === 0) {
    console.log('No kid-friendly events found from TourAPI keyword search.');
    return {
      success: true,
      message: 'No kid-friendly events found.',
      processedCount: 0,
      totalItems: 0,
    };
  }

  console.log(`📋 키워드 검색 결과: ${keywordSearchResults.length}개`);
  console.log(`💡 AI가 is_kid_friendly 판단 예정 (제외 키워드 필터 없음)`);

  // 키워드 검색 결과를 그대로 사용 (AI가 is_kid_friendly 판단)
  const rawFestivalItems = keywordSearchResults;

  // Step 2: DB에서 기존 이벤트 조회 (enrichment 상태 포함)
  const contentIds = rawFestivalItems.map((item) => item.contentid);
  const { data: existingEvents } = await supabase
    .from('events')
    .select(
      'contentid, last_enriched_at, enrichment_confidence, eventstartdate, eventenddate, has_parking, has_stroller_access, has_nursing_room, has_diaper_station, is_indoor, is_outdoor, age_ranges'
    )
    .in('contentid', contentIds);

  const existingEventsMap = new Map(
    (existingEvents || []).map((e) => [e.contentid, e])
  );

  // Step 3: 이벤트 분류 (신규/재분석/스킵)
  const eventsToProcess = rawFestivalItems.map((festivalItem) => {
    const existing = existingEventsMap.get(festivalItem.contentid);
    const decision = existing
      ? shouldReEnrich(existing as Tables<'events'>, today)
      : {
          shouldEnrich: true,
          reason: '신규 이벤트',
          status: EventStatus.NEW,
        };

    return {
      festivalItem,
      existing,
      decision,
    };
  });

  const newEvents = eventsToProcess.filter((e) => !e.existing);
  const toReEnrich = eventsToProcess.filter(
    (e) => e.existing && e.decision.shouldEnrich
  );
  const toSkip = eventsToProcess.filter(
    (e) => e.existing && !e.decision.shouldEnrich
  );

  const detailed_results: string[] = [];
  
  console.log(`📊 Classification:`);
  console.log(`  - 신규: ${newEvents.length}`);
  console.log(`  - 재분석 필요: ${toReEnrich.length}`);
  console.log(`  - 스킵: ${toSkip.length}`);

  // Step 4: 스킵 대상 이벤트 - TourAPI 데이터만 업데이트
  console.log(`\n[Processing] 스킵 대상 처리 중...`);
  for (const { festivalItem, existing, decision } of toSkip) {
    try {
      const [commonDetail, introFestival, images] = await Promise.all([
        fetchDetailCommon(festivalItem.contentid),
        fetchDetailIntroFestival(festivalItem.contentid),
        fetchDetailImages(festivalItem.contentid),
      ]);

      const mappedEvent = mapTourApiToEvent(
        festivalItem,
        commonDetail,
        introFestival,
        images
      );

      // Generate tags
      const tags = generateTags(
        mappedEvent.category,
        mappedEvent.title,
        mappedEvent.description,
        mappedEvent.age_ranges
      );

      // 기존 enrichment 데이터 유지하면서 TourAPI 데이터만 업데이트
      await supabase.from('events').upsert(
        {
          ...mappedEvent,
          tags,
          last_enriched_at: existing!.last_enriched_at,
          enrichment_confidence: existing!.enrichment_confidence,
        } as TablesInsert<'events'>,
        { onConflict: 'contentid' }
      );

      console.log(`  ✅ 스킵: ${festivalItem.title} (${decision.reason})`);
    } catch (error) {
      console.error(`  ⚠️ 스킵 처리 실패: ${festivalItem.title}`, error);
    }
  }

  // Step 5: 신규 + 재분석 대상 이벤트 - 전체 프로세스 수행
  const toEnrich = [...newEvents, ...toReEnrich];
  let enrichedCount = 0;
  let skippedNotKidFriendly = 0;
  const errors: string[] = [];

  console.log(`\n[Processing] 신규/재분석 대상 처리 중...`);

  const limit = pLimit(3); // 동시 처리 3개

  const results = await Promise.allSettled(
    toEnrich.map(({ festivalItem, decision }) =>
      limit(async () => {
        try {
          const contentId = festivalItem.contentid;

          // TourAPI 상세 정보 가져오기
          const [commonDetail, introFestival, images] = await Promise.all([
            fetchDetailCommon(contentId),
            fetchDetailIntroFestival(contentId),
            fetchDetailImages(contentId),
          ]);

          const mappedEvent = mapTourApiToEvent(
            festivalItem,
            commonDetail,
            introFestival,
            images
          );

          // 날짜가 없는 이벤트는 스킵 (DB에서 not-null 제약)
          if (!mappedEvent.eventstartdate || !mappedEvent.eventenddate) {
            console.log(
              `  ⏭️ 날짜 정보 없음 스킵: ${festivalItem.title}`
            );
            return {
              success: true,
              wasEnriched: false,
              wasSkippedNotKidFriendly: false,
              wasSkippedNoDate: true,
              title: festivalItem.title,
              decision_reason: '날짜 정보 없음'
            };
          }

          // 종료일이 오늘 이전인 행사는 스킵 (지난 행사 제외)
          const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          if (mappedEvent.eventenddate < todayStr) {
            console.log(
              `  ⏭️ 지난 행사 스킵: ${festivalItem.title} (종료: ${mappedEvent.eventenddate})`
            );
            return {
              success: true,
              wasEnriched: false,
              wasSkippedNotKidFriendly: false,
              wasSkippedNoDate: false,
              wasSkippedPastEvent: true,
              title: festivalItem.title,
              decision_reason: '지난 행사'
            };
          }

          // Enrichment 수행 (블로그 날짜 필터 적용)
          let finalEvent: TablesInsert<'events'> = mappedEvent;
          let wasEnriched = false;

          try {
            console.log(
              `  [Enrichment] ${mappedEvent.title} (${decision.reason})`
            );

            const { enrichedEvent, metadata } = await enrichEventData(
              mappedEvent,
              {
                maxBlogSearch: 10,
                maxBlogCrawl: 5,
                minConfidence: 0.5,
                blogDateFilter: decision.blogDateFilter, // 날짜 필터 전달
              }
            );

            if (metadata) {
              // AI 분석 결과에서 is_kid_friendly 확인 (TablesInsert 타입에 추가 필드 가능)
              const enrichedWithAiResult = enrichedEvent as TablesInsert<'events'> & { is_kid_friendly?: boolean | null };
              if (enrichedWithAiResult.is_kid_friendly === false) {
                console.log(
                  `  ⏭️ 아이 부적합 행사 스킵: ${mappedEvent.title} (AI 판단: is_kid_friendly=false)`
                );
                return {
                  success: true,
                  wasEnriched: false,
                  wasSkippedNotKidFriendly: true,
                  title: festivalItem.title,
                  decision_reason: 'AI 판단: 아이 부적합'
                };
              }

              finalEvent = {
                ...enrichedEvent,
                last_enriched_at: new Date().toISOString(),
                enrichment_confidence: metadata.agreement_score || null,
              };
              wasEnriched = true;
              console.log(
                `  ✅ Enriched: ${mappedEvent.title} (confidence: ${metadata.agreement_score})`
              );
            } else {
              // enrichment 실패 시에도 last_enriched_at 업데이트
              finalEvent = {
                ...mappedEvent,
                last_enriched_at: new Date().toISOString(),
                enrichment_confidence: null,
              };
              console.log(
                `  ⚠️ Enrichment 실패: ${mappedEvent.title} (TourAPI 데이터만 사용)`
              );
            }
          } catch (enrichError) {
            console.warn(
              `  ⚠️ Enrichment 오류: ${mappedEvent.title}`,
              enrichError
            );
            // enrichment 실패 시에도 TourAPI 데이터는 저장
            finalEvent = {
              ...mappedEvent,
              last_enriched_at: new Date().toISOString(),
              enrichment_confidence: null,
            };
          }

          // Generate tags
          const tags = generateTags(
            finalEvent.category,
            finalEvent.title,
            finalEvent.description,
            finalEvent.age_ranges
          );

          finalEvent = { ...finalEvent, tags };

          // DB 저장 전 is_kid_friendly 필드 제거 (DB 스키마에 없음)
          const { is_kid_friendly: _, ...eventToSave } = finalEvent as TablesInsert<'events'> & { is_kid_friendly?: boolean | null };

          // DB 저장
          const { error } = await supabase
            .from('events')
            .upsert(eventToSave, { onConflict: 'contentid' });

          if (error) {
            throw new Error(`DB 저장 실패: ${error.message || JSON.stringify(error)}`);
          }

          return {
            success: true,
            wasEnriched,
            wasSkippedNotKidFriendly: false,
            title: festivalItem.title,
            decision_reason: decision.reason
          };
        } catch (e) {
          const errorMessage = `Error processing event ${festivalItem.title}: ${e instanceof Error ? e.message : String(e)}`;
          console.error(`  ⚠️ ${errorMessage}`);
          throw new Error(errorMessage);
        }
      })
    )
  );

  // 결과 집계
  let skippedNoDate = 0;
  let skippedPastEvent = 0;
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const value = result.value as {
        wasSkippedNotKidFriendly?: boolean;
        wasSkippedNoDate?: boolean;
        wasSkippedPastEvent?: boolean;
        wasEnriched?: boolean;
        title?: string;
        decision_reason?: string;
      };
      if (value.wasSkippedNotKidFriendly) {
        skippedNotKidFriendly++;
        detailed_results.push(`스킵(부적합): ${value.title}`);
      } else if (value.wasSkippedNoDate) {
        skippedNoDate++;
        detailed_results.push(`스킵(날짜없음): ${value.title}`);
      } else if (value.wasSkippedPastEvent) {
        skippedPastEvent++;
        detailed_results.push(`스킵(지난행사): ${value.title}`);
      } else {
        detailed_results.push(`처리: ${value.title} (${value.decision_reason})`);
        if (value.wasEnriched) {
          enrichedCount++;
        }
      }
    } else {
      errors.push(result.reason.message);
      detailed_results.push(`오류: ${result.reason.message}`);
    }
  });

  const processedCount = results.filter(
    (r) => r.status === 'fulfilled' &&
      !(r.value as any).wasSkippedNotKidFriendly &&
      !(r.value as any).wasSkippedNoDate &&
      !(r.value as any).wasSkippedPastEvent
  ).length;

  const durationMs = Date.now() - startTime;
  const aiFilterPercent = ((skippedNotKidFriendly / toEnrich.length) * 100).toFixed(1);

  console.log(`\n--- 완료 ---`);
  console.log(`📊 최종 통계:`);
  console.log(`  - 키워드 검색 결과: ${keywordSearchResults.length}개`);
  console.log(`  - 지난 행사 스킵: ${skippedPastEvent}개`);
  console.log(`  - AI 판단 부적합: ${skippedNotKidFriendly}개`);
  console.log(`  - 날짜 정보 없음: ${skippedNoDate}개`);
  console.log(`  - 처리 완료 (DB 저장): ${processedCount}개`);
  console.log(`  - Enrichment 수행: ${enrichedCount}개`);
  console.log(`  - 기존 이벤트 스킵: ${toSkip.length}개`);
  console.log(`  - 오류: ${errors.length}개`);
  if (toEnrich.length > 0) {
    console.log(
      `🤖 AI 필터링: ${aiFilterPercent}% 부적합 판정 (${skippedNotKidFriendly}/${toEnrich.length})`
    );
  }
  console.log(`⏱️ 실행 시간: ${(durationMs / 1000).toFixed(1)}초`);

  // Step 6: 실행 결과를 DB에 저장
  try {
    await supabase.from('cron_logs').insert({
      job_name: 'collect-events',
      executed_at: new Date().toISOString(),
      duration_ms: durationMs,
      success: errors.length === 0,
      message: `Saved ${processedCount}, AI filtered ${skippedNotKidFriendly}`,
      total_items: keywordSearchResults.length,
      processed_count: processedCount,
      enriched_count: enrichedCount,
      skipped_count: toSkip.length,
      error_count: errors.length,
      errors: errors.length > 0 ? errors : null,
      metadata: {
        keyword_search_results: keywordSearchResults.length,
        excluded_by_ai: skippedNotKidFriendly,
        new_events: newEvents.length,
        re_enriched: toReEnrich.length,
        ai_filter_percent: toEnrich.length > 0 ? parseFloat(aiFilterPercent) : 0,
      },
    });
    console.log('✅ 실행 로그 저장 완료');
  } catch (logError) {
    console.error('⚠️ 로그 저장 실패:', logError);
    // 로그 저장 실패해도 메인 프로세스는 성공으로 처리
  }

  // Step 7: 텔레그램 알림 (선택사항)
  try {
    await sendTelegramNotification({
      success: errors.length === 0,
      message: `Saved ${processedCount}, AI filtered ${skippedNotKidFriendly}`,
      totalItems: keywordSearchResults.length,
      processedCount,
      enrichedCount,
      skippedCount: toSkip.length + skippedNotKidFriendly,
      errors,
      durationMs,
      detailed_results,
    });
  } catch (telegramError) {
    console.error('⚠️ 텔레그램 알림 실패:', telegramError);
    // 텔레그램 알림 실패해도 메인 프로세스는 성공으로 처리
  }

  return {
    success: errors.length === 0,
    message: `Saved ${processedCount}, AI filtered ${skippedNotKidFriendly}`,
    processedCount,
    enrichedCount,
    skippedCount: toSkip.length,
    skippedNotKidFriendly,
    totalItems: keywordSearchResults.length,
    errors,
  };
}
