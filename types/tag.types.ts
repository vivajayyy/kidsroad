/**
 * 태그 생성 관련 타입 정의
 */

export interface TagMapping {
  category: string;
  tags: string[];
}

/**
 * 카테고리별 태그 매핑
 * 카테고리 → 영문 태그로 변환
 */
export const CATEGORY_TAG_MAP: Record<string, string[]> = {
  "축제/행사": ["festival", "event", "outdoor"],
  문화시설: ["culture", "museum", "indoor", "educational"],
  관광지: ["tourism", "sightseeing"],
  여행코스: ["travel", "course", "family"],
  레포츠: ["sports", "activity", "outdoor"],
};

/**
 * 키워드 기반 태그 매핑
 * 한글 키워드 → 영문 태그
 */
export const KEYWORD_TAG_MAP: Record<string, string> = {
  체험: "hands-on",
  교육: "educational",
  무료: "free",
  공원: "park",
  박물관: "museum",
  미술관: "art-gallery",
  전시: "exhibition",
  공연: "performance",
  놀이: "play",
  가족: "family",
  어린이: "kids",
  야외: "outdoor",
  실내: "indoor",
  체육: "sports",
  음악: "music",
  미술: "art",
  과학: "science",
  역사: "history",
  자연: "nature",
};

/**
 * 태그 최대 개수
 */
export const MAX_TAGS_PER_EVENT = 8;
