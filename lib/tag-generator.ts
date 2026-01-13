/**
 * Tag Generator
 * 이벤트의 카테고리와 내용을 분석하여 자동으로 태그 생성
 */

import {
  CATEGORY_TAG_MAP,
  KEYWORD_TAG_MAP,
  MAX_TAGS_PER_EVENT,
} from '@/types/tag.types';

/**
 * 이벤트 정보를 기반으로 태그 생성
 * @param category 이벤트 카테고리
 * @param title 이벤트 제목
 * @param description 이벤트 설명
 * @param ageRanges 연령대 배열
 * @returns 생성된 태그 배열 (영문)
 */
export function generateTags(
  category: string | null | undefined,
  title: string,
  description: string | null | undefined,
  ageRanges?: string[] | null
): string[] {
  const tags = new Set<string>();

  // 1. Category-based tags
  if (category && CATEGORY_TAG_MAP[category]) {
    CATEGORY_TAG_MAP[category].forEach((tag) => tags.add(tag));
  }

  // 2. Keyword-based tags from title + description
  const text = `${title} ${description || ''}`.toLowerCase();

  Object.entries(KEYWORD_TAG_MAP).forEach(([keyword, tag]) => {
    if (text.includes(keyword)) {
      tags.add(tag);
    }
  });

  // 3. Age-based tags
  if (ageRanges && ageRanges.length > 0) {
    // If includes babies/toddlers (0-2)
    if (ageRanges.includes('0-2')) {
      tags.add('baby-friendly');
    }
    // If includes all age ranges, it's family-friendly
    if (ageRanges.length >= 3) {
      tags.add('family');
    }
  }

  // 4. Special tags based on patterns
  // Free events
  if (text.includes('무료') || text.includes('free')) {
    tags.add('free');
  }

  // Night events
  if (
    text.includes('야간') ||
    text.includes('밤') ||
    text.includes('night') ||
    text.includes('저녁')
  ) {
    tags.add('night');
  }

  // Weekend events
  if (text.includes('주말') || text.includes('weekend')) {
    tags.add('weekend');
  }

  // Seasonal tags
  if (text.includes('봄') || text.includes('spring') || text.includes('벚꽃')) {
    tags.add('spring');
  }
  if (
    text.includes('여름') ||
    text.includes('summer') ||
    text.includes('물놀이')
  ) {
    tags.add('summer');
  }
  if (text.includes('가을') || text.includes('autumn') || text.includes('단풍')) {
    tags.add('autumn');
  }
  if (text.includes('겨울') || text.includes('winter') || text.includes('눈')) {
    tags.add('winter');
  }

  // Holiday tags
  if (
    text.includes('크리스마스') ||
    text.includes('christmas') ||
    text.includes('성탄')
  ) {
    tags.add('christmas');
  }
  if (text.includes('할로윈') || text.includes('halloween')) {
    tags.add('halloween');
  }

  // Convert Set to Array and limit to MAX_TAGS_PER_EVENT
  return Array.from(tags).slice(0, MAX_TAGS_PER_EVENT);
}

/**
 * 기존 태그와 새 태그를 병합
 * @param existingTags 기존 태그 배열
 * @param newTags 새로 생성된 태그 배열
 * @returns 병합 및 중복 제거된 태그 배열
 */
export function mergeTags(
  existingTags: string[] | null,
  newTags: string[]
): string[] {
  const allTags = new Set([...(existingTags || []), ...newTags]);
  return Array.from(allTags).slice(0, MAX_TAGS_PER_EVENT);
}

/**
 * 태그의 유효성 검증
 * @param tags 검증할 태그 배열
 * @returns 유효한 태그만 포함된 배열
 */
export function validateTags(tags: string[]): string[] {
  return tags.filter((tag) => {
    // Empty check
    if (!tag || tag.trim().length === 0) return false;

    // Length check (too short or too long)
    if (tag.length < 2 || tag.length > 30) return false;

    // Format check (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(tag)) return false;

    return true;
  });
}
