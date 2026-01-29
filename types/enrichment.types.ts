/**
 * 데이터 보강(Enrichment) 관련 타입 정의
 */

export interface EnrichmentResult {
  has_parking: boolean | null;
  has_stroller_access: boolean | null;
  has_nursing_room: boolean | null;
  has_diaper_station: boolean | null;
  age_ranges: string[]; // Enhanced from TourAPI
  is_indoor: boolean | null;
  is_outdoor: boolean | null;
  confidence_score: number; // 0-1
  is_kid_friendly: boolean | null; // AI가 판단한 아이 동반 적합 여부
  source_blog_count: number;
  analyzed_at: string;
}

export interface EnrichmentMetadata {
  source: "blog_analysis" | "rule_based";
  blog_count?: number;
  agreement_score?: number; // How many blogs agreed
  analyzed_at: string;
  model?: string; // e.g., "claude-haiku-3.5"
}
