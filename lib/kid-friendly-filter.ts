/**
 * 아이 동반 부적합 행사 필터링 모듈
 * 제목/설명에서 제외 키워드를 검사하여 부적합 행사를 걸러냄
 */

/**
 * 아이와 함께하기 부적합한 행사를 식별하는 제외 키워드 목록
 * - 신체적 요구사항이 높은 활동 (마라톤, 철인, 등산 등)
 * - 성인 전용 콘텐츠 (성인, 19금 등)
 * - 주류 관련 행사 (와인, 맥주 등)
 */
export const EXCLUDE_KEYWORDS = [
  // 신체적 요구사항이 높은 활동
  '마라톤',
  '철인',
  '트라이애슬론',
  '레이스',
  '등산',
  '트레킹',
  '하이킹',
  '골프',
  '낚시',
  '사이클',
  '산악',

  // 성인 전용
  '성인',
  '성인전용',
  '19금',
  '19세',
  '18세이상',
  '성인용',

  // 주류 관련
  '와인',
  '맥주',
  '위스키',
  '소주',
  '막걸리',
  '주류',
  '술',
  '음주',

  // 기타 부적합
  '도박',
  '카지노',
] as const;

/**
 * 포함 키워드 - AI 분석 전 사전 필터링에서 우선순위 부여용
 * (현재는 참고용으로만 사용, 향후 확장 가능)
 */
export const INCLUDE_KEYWORDS = [
  '어린이',
  '키즈',
  '유아',
  '아이',
  '가족',
  '체험',
  '놀이',
  '동화',
  '인형극',
  '애니메이션',
  '만화',
  '동물원',
  '수족관',
  '놀이공원',
  '키즈카페',
] as const;

/**
 * 행사가 제외 대상인지 확인
 * @param title 행사 제목
 * @param description 행사 설명 (선택)
 * @returns 제외 대상이면 true, 아니면 false
 */
export function isExcludedEvent(
  title: string,
  description?: string | null
): boolean {
  // 제목과 설명을 합쳐서 검사 (소문자 변환 불필요 - 한글 키워드)
  const text = `${title} ${description || ''}`;

  // 제외 키워드 중 하나라도 포함되면 true
  return EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * 행사가 아이 관련 키워드를 포함하는지 확인
 * @param title 행사 제목
 * @param description 행사 설명 (선택)
 * @returns 포함 키워드가 있으면 true
 */
export function hasKidRelatedKeyword(
  title: string,
  description?: string | null
): boolean {
  const text = `${title} ${description || ''}`;
  return INCLUDE_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * 행사 필터링 결과 타입
 */
export interface FilterResult {
  shouldInclude: boolean;
  reason: string;
  matchedKeyword?: string;
}

/**
 * 행사 필터링 상세 결과 반환
 * @param title 행사 제목
 * @param description 행사 설명 (선택)
 * @returns 필터링 결과와 이유
 */
export function filterEvent(
  title: string,
  description?: string | null
): FilterResult {
  const text = `${title} ${description || ''}`;

  // 1. 제외 키워드 체크 (최우선)
  const excludeMatch = EXCLUDE_KEYWORDS.find(keyword => text.includes(keyword));
  if (excludeMatch) {
    return {
      shouldInclude: false,
      reason: `제외 키워드 포함: "${excludeMatch}"`,
      matchedKeyword: excludeMatch,
    };
  }

  // 2. 포함 키워드 체크
  const includeMatch = INCLUDE_KEYWORDS.find(keyword => text.includes(keyword));
  if (includeMatch) {
    return {
      shouldInclude: true,
      reason: `아이 관련 키워드 포함: "${includeMatch}"`,
      matchedKeyword: includeMatch,
    };
  }

  // 3. 키워드 없음 - AI 판단 필요
  return {
    shouldInclude: true, // 일단 포함, AI가 최종 판단
    reason: '키워드 매칭 없음 - AI 판단 필요',
  };
}
