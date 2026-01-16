/**
 * Event Data Collection with Intelligent Re-analysis
 * TourAPI에서 이벤트를 수집하고, 재분석 정책에 따라 선택적으로 enrichment 수행
 */

import { createClient } from '@supabase/supabase-js';
import type { Database, Tables, TablesInsert } from '../types/supabase';
import {
  fetchFestivalItems,
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

  console.log('--- Starting Intelligent Event Collection ---');

  // Step 1: TourAPI에서 이벤트 가져오기
  const today = new Date();
  const eventStartDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

  console.log(`Fetching festival items starting from ${eventStartDate}...`);
  const rawFestivalItems = await fetchFestivalItems({
    eventStartDate,
    numOfRows: 100,
    pageNo: 1,
  });

  if (rawFestivalItems.length === 0) {
    console.log('No new festival items found from TourAPI.');
    return {
      success: true,
      message: 'No new festival items found.',
      processedCount: 0,
      totalItems: 0,
    };
  }

  console.log(`Found ${rawFestivalItems.length} festival items.`);

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

          // DB 저장
          const { error } = await supabase
            .from('events')
            .upsert(finalEvent, { onConflict: 'contentid' });

          if (error) throw error;

          return { success: true, wasEnriched, title: festivalItem.title, decision_reason: decision.reason };
        } catch (e: any) {
          const errorMessage = `Error processing event ${festivalItem.title}: ${e.message}`;
          console.error(`  ⚠️ ${errorMessage}`);
          throw new Error(errorMessage);
        }
      })
    )
  );

  // 결과 집계
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      detailed_results.push(`처리: ${result.value.title} (${result.value.decision_reason})`);
      if (result.value.wasEnriched) {
        enrichedCount++;
      }
    } else {
      errors.push(result.reason.message);
      detailed_results.push(`오류: ${result.reason.message}`);
    }
  });

  const processedCount = results.filter((r) => r.status === 'fulfilled').length;

  const durationMs = Date.now() - startTime;
  const costSavingPercent = ((toSkip.length / rawFestivalItems.length) * 100).toFixed(1);

  console.log(`\n--- 완료 ---`);
  console.log(`📊 최종 통계:`);
  console.log(`  - 처리 완료: ${processedCount}/${toEnrich.length}`);
  console.log(`  - Enrichment 수행: ${enrichedCount}`);
  console.log(`  - 스킵: ${toSkip.length}`);
  console.log(`  - 오류: ${errors.length}`);
  console.log(
    `💰 비용 절감: ${costSavingPercent}% (${toSkip.length}/${rawFestivalItems.length} AI 호출 스킵)`
  );
  console.log(`⏱️ 실행 시간: ${(durationMs / 1000).toFixed(1)}초`);

  // Step 6: 실행 결과를 DB에 저장
  try {
    await supabase.from('cron_logs').insert({
      job_name: 'collect-events',
      executed_at: new Date().toISOString(),
      duration_ms: durationMs,
      success: errors.length === 0,
      message: `Processed ${processedCount}, Enriched ${enrichedCount}, Skipped ${toSkip.length}`,
      total_items: rawFestivalItems.length,
      processed_count: processedCount,
      enriched_count: enrichedCount,
      skipped_count: toSkip.length,
      error_count: errors.length,
      errors: errors.length > 0 ? errors : null,
      metadata: {
        new_events: newEvents.length,
        re_enriched: toReEnrich.length,
        cost_saving_percent: parseFloat(costSavingPercent),
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
      message: `Processed ${processedCount}, Enriched ${enrichedCount}, Skipped ${toSkip.length}`,
      totalItems: rawFestivalItems.length,
      processedCount,
      enrichedCount,
      skippedCount: toSkip.length,
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
    message: `Processed ${processedCount}, Enriched ${enrichedCount}, Skipped ${toSkip.length}`,
    processedCount,
    enrichedCount,
    skippedCount: toSkip.length,
    totalItems: rawFestivalItems.length,
    errors,
  };
}
