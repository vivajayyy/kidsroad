/**
 * Enrichment Policy Engine
 * 이벤트의 재분석 필요 여부를 판단하는 정책 엔진
 *
 * 재분석 정책:
 * - 신규: 무조건 전체 프로세스
 * - 시작 전: 주 1회 재분석
 * - 진행 중: 매일 재분석 (단, 모든 필드 완성 시 제외)
 * - 종료 후: 재분석 안 함
 */

import { Tables } from '@/types/supabase';

export enum EventStatus {
  NEW = 'NEW', // 신규 이벤트 (한 번도 enrichment 안 됨)
  BEFORE_START = 'BEFORE_START', // 시작 전
  ONGOING = 'ONGOING', // 진행 중
  ENDED = 'ENDED', // 종료
}

export interface EnrichmentDecision {
  shouldEnrich: boolean;
  reason: string;
  status: EventStatus;
  blogDateFilter?: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * 이벤트가 "완성된" 상태인지 확인
 * 모든 핵심 필드가 non-null이면 완성
 *
 * @param event 이벤트 데이터
 * @returns 완성 여부
 */
export function isEventComplete(event: Tables<'events'>): boolean {
  return (
    event.has_parking !== null &&
    event.has_stroller_access !== null &&
    event.has_nursing_room !== null &&
    event.has_diaper_station !== null &&
    event.is_indoor !== null &&
    event.is_outdoor !== null &&
    event.age_ranges !== null &&
    event.age_ranges.length > 0
  );
}

/**
 * 이벤트의 현재 상태 판단
 *
 * @param event 이벤트 데이터
 * @param currentDate 기준 날짜 (기본값: 현재 시각)
 * @returns 이벤트 상태
 */
export function getEventStatus(
  event: Tables<'events'>,
  currentDate: Date = new Date()
): EventStatus {
  // 신규 이벤트 (한 번도 enrichment 안 됨)
  if (!event.last_enriched_at) {
    return EventStatus.NEW;
  }

  const startDate = new Date(event.eventstartdate);
  const endDate = new Date(event.eventenddate);

  // 날짜 비교를 위해 시간 부분 제거
  const current = new Date(currentDate.setHours(0, 0, 0, 0));
  const start = new Date(startDate.setHours(0, 0, 0, 0));
  const end = new Date(endDate.setHours(0, 0, 0, 0));

  // 종료된 이벤트
  if (current > end) {
    return EventStatus.ENDED;
  }

  // 진행 중
  if (current >= start && current <= end) {
    return EventStatus.ONGOING;
  }

  // 시작 전
  return EventStatus.BEFORE_START;
}

/**
 * 마지막 enrichment 이후 경과 일수 계산
 *
 * @param lastEnrichedAt 마지막 enrichment 시각
 * @returns 경과 일수 (enrichment 안 됨: Infinity)
 */
function getDaysSinceLastEnrichment(lastEnrichedAt: string | null): number {
  if (!lastEnrichedAt) return Infinity;

  const last = new Date(lastEnrichedAt);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 블로그 날짜 필터 범위 계산
 * 이벤트 상태에 따라 다른 날짜 범위 적용
 *
 * @param event 이벤트 데이터
 * @param status 이벤트 상태
 * @returns 블로그 검색 날짜 범위
 */
function getBlogDateFilter(
  event: Tables<'events'>,
  status: EventStatus
): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date(event.eventstartdate);
  const endDate = new Date(event.eventenddate);

  switch (status) {
    case EventStatus.NEW:
    case EventStatus.BEFORE_START:
      // 시작 전: 최근 1년 블로그 허용 (작년 행사 후기 포함)
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return { startDate: oneYearAgo, endDate: now };

    case EventStatus.ONGOING:
      // 진행 중: 행사 시작일 이후 블로그만 (현재 회차)
      return { startDate, endDate: now };

    case EventStatus.ENDED:
      // 종료 후: 행사 기간 내 블로그만
      return { startDate, endDate };
  }
}

/**
 * 재분석 필요 여부 판단 (핵심 로직)
 *
 * @param event 이벤트 데이터
 * @param currentDate 기준 날짜 (기본값: 현재 시각)
 * @returns 재분석 결정 정보
 */
export function shouldReEnrich(
  event: Tables<'events'>,
  currentDate: Date = new Date()
): EnrichmentDecision {
  const status = getEventStatus(event, currentDate);

  // 1. 신규 이벤트: 무조건 분석
  if (status === EventStatus.NEW) {
    return {
      shouldEnrich: true,
      reason: '신규 이벤트',
      status,
      blogDateFilter: getBlogDateFilter(event, status),
    };
  }

  // 2. 종료된 이벤트: 재분석 불필요
  if (status === EventStatus.ENDED) {
    return {
      shouldEnrich: false,
      reason: '행사 종료',
      status,
    };
  }

  // 3. 진행 중 이벤트
  if (status === EventStatus.ONGOING) {
    // 완성된 이벤트는 스킵
    if (isEventComplete(event)) {
      return {
        shouldEnrich: false,
        reason: '행사 진행 중이지만 모든 정보 완성됨',
        status,
      };
    }

    // 미완성 이벤트는 매일 재분석
    const daysSince = getDaysSinceLastEnrichment(event.last_enriched_at);
    if (daysSince >= 1) {
      return {
        shouldEnrich: true,
        reason: '행사 진행 중 - 매일 재분석',
        status,
        blogDateFilter: getBlogDateFilter(event, status),
      };
    }

    return {
      shouldEnrich: false,
      reason: '오늘 이미 분석됨',
      status,
    };
  }

  // 4. 시작 전 이벤트: 일주일에 한 번
  if (status === EventStatus.BEFORE_START) {
    const daysSince = getDaysSinceLastEnrichment(event.last_enriched_at);
    if (daysSince >= 7) {
      return {
        shouldEnrich: true,
        reason: '행사 시작 전 - 주간 재분석',
        status,
        blogDateFilter: getBlogDateFilter(event, status),
      };
    }

    return {
      shouldEnrich: false,
      reason: `행사 시작 전 - 마지막 분석 ${daysSince}일 전`,
      status,
    };
  }

  // Fallback (도달하지 않아야 함)
  return {
    shouldEnrich: false,
    reason: '알 수 없는 상태',
    status,
  };
}
