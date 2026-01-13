/**
 * Data Enrichment Orchestrator
 * 블로그 크롤링과 AI 분석을 조율하여 이벤트 데이터 보강
 */

import { TablesInsert } from "@/types/supabase";
import { searchNaverBlogs, crawlMultipleBlogs } from "./blog-crawler";
import { analyzeBlogs, isConfidentResult } from "./ai-analyzer";
import { EnrichmentMetadata } from "@/types/enrichment.types";

interface EnrichmentOptions {
  /**
   * 검색할 블로그 개수 (기본값: 10)
   */
  maxBlogSearch?: number;

  /**
   * 크롤링할 블로그 개수 (기본값: 5)
   * API 비용 절감을 위해 검색 결과보다 적게 설정
   */
  maxBlogCrawl?: number;

  /**
   * 최소 신뢰도 (기본값: 0.5)
   * 이 값보다 낮은 신뢰도의 결과는 무시
   */
  minConfidence?: number;

  /**
   * 블로그 검색/크롤링 비활성화 (테스트용)
   */
  skipEnrichment?: boolean;
}

/**
 * 이벤트 데이터를 블로그 분석으로 보강
 * @param event TourAPI에서 가져온 기본 이벤트 데이터
 * @param options 보강 옵션
 * @returns 보강된 이벤트 데이터와 메타데이터
 */
export async function enrichEventData(
  event: TablesInsert<"events">,
  options: EnrichmentOptions = {}
): Promise<{
  enrichedEvent: TablesInsert<"events">;
  metadata: EnrichmentMetadata | null;
}> {
  const {
    maxBlogSearch = 10,
    maxBlogCrawl = 5,
    minConfidence = 0.5,
    skipEnrichment = false,
  } = options;

  // Skip enrichment if disabled
  if (skipEnrichment) {
    return { enrichedEvent: event, metadata: null };
  }

  try {
    // Step 1: Search for relevant blogs
    const searchQuery = `${event.title} 후기 유모차 주차 수유실`;
    console.log(`[Enrichment] Searching blogs for: ${event.title}`);

    const blogResults = await searchNaverBlogs(searchQuery, maxBlogSearch);

    if (blogResults.length === 0) {
      console.log(`[Enrichment] No blogs found for: ${event.title}`);
      return { enrichedEvent: event, metadata: null };
    }

    console.log(
      `[Enrichment] Found ${blogResults.length} blogs for: ${event.title}`
    );

    // Step 2: Crawl blog contents (limit to maxBlogCrawl to control costs)
    const urlsToCrawl = blogResults
      .slice(0, maxBlogCrawl)
      .map((blog) => blog.link);

    const blogContents = await crawlMultipleBlogs(urlsToCrawl, 3);

    // Fallback: Use blog descriptions if crawling failed
    if (blogContents.length === 0) {
      console.log(
        `[Enrichment] Crawling failed, using blog descriptions for: ${event.title}`
      );

      // Convert blog search results to BlogContent format using descriptions
      const descriptionBasedContents = blogResults
        .slice(0, maxBlogCrawl)
        .map((blog) => ({
          url: blog.link,
          title: blog.title.replace(/<[^>]*>/g, ""), // Remove HTML tags
          content: blog.description.replace(/<[^>]*>/g, ""), // Remove HTML tags
          crawledAt: new Date().toISOString(),
        }));

      if (descriptionBasedContents.length === 0) {
        console.log(`[Enrichment] No blog data available for: ${event.title}`);
        return { enrichedEvent: event, metadata: null };
      }

      console.log(
        `[Enrichment] Using ${descriptionBasedContents.length} blog descriptions for: ${event.title}`
      );

      // Continue with description-based contents
      const aiResult = await analyzeBlogs(
        event.title,
        descriptionBasedContents
      );

      if (!aiResult) {
        console.log(`[Enrichment] AI analysis failed for: ${event.title}`);
        return { enrichedEvent: event, metadata: null };
      }

      // Step 4: Check confidence score
      if (!isConfidentResult(aiResult, minConfidence)) {
        console.log(
          `[Enrichment] Low confidence (${aiResult.confidence_score}) for: ${event.title}`
        );
      }

      // Step 5: Merge AI results with TourAPI data
      const enrichedEvent: TablesInsert<"events"> = {
        ...event,
        has_parking: aiResult.has_parking ?? event.has_parking,
        has_stroller_access:
          aiResult.has_stroller_access ?? event.has_stroller_access,
        has_nursing_room: aiResult.has_nursing_room ?? event.has_nursing_room,
        has_diaper_station:
          aiResult.has_diaper_station ?? event.has_diaper_station,
        age_ranges: Array.from(
          new Set([...(event.age_ranges || []), ...(aiResult.age_ranges || [])])
        ).sort(),
        is_indoor: aiResult.is_indoor ?? event.is_indoor,
        is_outdoor: aiResult.is_outdoor ?? event.is_outdoor,
      };

      const metadata: EnrichmentMetadata = {
        source: "blog_analysis",
        blog_count: aiResult.source_blog_count,
        agreement_score: aiResult.confidence_score,
        analyzed_at: aiResult.analyzed_at,
        model: "claude-3-haiku",
      };

      console.log(
        `[Enrichment] ✅ Successfully enriched: ${event.title} (confidence: ${aiResult.confidence_score})`
      );

      return { enrichedEvent, metadata };
    }

    console.log(
      `[Enrichment] Crawled ${blogContents.length} blogs for: ${event.title}`
    );

    // Step 3: AI Analysis
    const aiResult = await analyzeBlogs(event.title, blogContents);

    if (!aiResult) {
      console.log(`[Enrichment] AI analysis failed for: ${event.title}`);
      return { enrichedEvent: event, metadata: null };
    }

    // Step 4: Check confidence score
    if (!isConfidentResult(aiResult, minConfidence)) {
      console.log(
        `[Enrichment] Low confidence (${aiResult.confidence_score}) for: ${event.title}`
      );
      // Still use the result but log the low confidence
    }

    // Step 5: Merge AI results with TourAPI data
    // Prefer AI results over TourAPI inferences when AI result is non-null
    const enrichedEvent: TablesInsert<"events"> = {
      ...event,
      // Parent checklist fields - prefer AI results
      has_parking: aiResult.has_parking ?? event.has_parking,
      has_stroller_access:
        aiResult.has_stroller_access ?? event.has_stroller_access,
      has_nursing_room: aiResult.has_nursing_room ?? event.has_nursing_room,
      has_diaper_station:
        aiResult.has_diaper_station ?? event.has_diaper_station,

      // Enhance age ranges (combine TourAPI + AI, remove duplicates)
      age_ranges: Array.from(
        new Set([...(event.age_ranges || []), ...(aiResult.age_ranges || [])])
      ).sort(),

      // Indoor/outdoor - prefer AI detection
      is_indoor: aiResult.is_indoor ?? event.is_indoor,
      is_outdoor: aiResult.is_outdoor ?? event.is_outdoor,
    };

    const metadata: EnrichmentMetadata = {
      source: "blog_analysis",
      blog_count: aiResult.source_blog_count,
      agreement_score: aiResult.confidence_score,
      analyzed_at: aiResult.analyzed_at,
      model: "claude-haiku-3.5",
    };

    console.log(
      `[Enrichment] ✅ Successfully enriched: ${event.title} (confidence: ${aiResult.confidence_score})`
    );

    return { enrichedEvent, metadata };
  } catch (error) {
    console.error(`[Enrichment] ❌ Failed for ${event.title}:`, error);
    // Return original event unchanged on error
    return { enrichedEvent: event, metadata: null };
  }
}

/**
 * 여러 이벤트를 순차적으로 보강
 * @param events 이벤트 배열
 * @param options 보강 옵션
 * @returns 보강된 이벤트와 메타데이터 배열
 */
export async function enrichMultipleEvents(
  events: TablesInsert<"events">[],
  options: EnrichmentOptions = {}
): Promise<
  Array<{
    enrichedEvent: TablesInsert<"events">;
    metadata: EnrichmentMetadata | null;
  }>
> {
  const results = [];

  for (const event of events) {
    const result = await enrichEventData(event, options);
    results.push(result);

    // Add delay between events to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
  }

  return results;
}
