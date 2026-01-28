"use client";

import React, { useState, useEffect, forwardRef } from "react";
import FilterChips from "@/components/filter/FilterChips";

const CATEGORIES = ["전체", "축제/행사", "문화시설", "관광지", "레포츠"];
const REGIONS = [
  "전체",
  "서울",
  "경기",
  "인천",
  "강원",
  "대전",
  "세종",
  "충남",
  "충북",
  "부산",
  "대구",
  "울산",
  "경남",
  "경북",
  "광주",
  "전남",
  "전북",
  "제주",
];

const CHECKLIST_KEYS = [
  "free",
  "indoor",
  "outdoor",
  "parking",
  "stroller",
  "nursing",
];

interface FilterBarProps {
  currentQuery: string;
  currentCategory: string;
  currentRegion: string;
  currentAge?: string;
  currentChecklist?: Record<string, boolean>;
  onFilterChange: (key: string, value: string) => void;
}

const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  (
    {
      currentQuery,
      currentCategory,
      currentRegion,
      currentAge = "",
      currentChecklist = {},
      onFilterChange,
    },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = useState(currentQuery);

    useEffect(() => {
      setSearchTerm(currentQuery);
    }, [currentQuery]);

    useEffect(() => {
      const handler = setTimeout(() => {
        if (searchTerm !== currentQuery) {
          onFilterChange("q", searchTerm);
        }
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    }, [searchTerm, currentQuery, onFilterChange]);

    // currentChecklist에 기본값 채우기
    const checklist: Record<string, boolean> = {};
    for (const key of CHECKLIST_KEYS) {
      checklist[key] = currentChecklist[key] || false;
    }

    return (
      <div className="mb-8 space-y-6" ref={ref}>
        {/* 검색 Input (pill 스타일) */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="어떤 경험을 찾고 있나요?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-gray-100 dark:bg-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-sm text-gray-900 dark:text-white placeholder-gray-500 transition-all"
            aria-label="행사 검색"
          />
        </div>

        {/* 연령 + 체크리스트 필터 칩 */}
        <FilterChips
          currentAge={currentAge}
          currentChecklist={checklist}
          onFilterChange={onFilterChange}
        />

        {/* 카테고리/지역 드롭다운 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="category-select"
              className="text-xs text-gray-500 mb-2 block"
            >
              카테고리
            </label>
            <select
              id="category-select"
              value={currentCategory}
              onChange={(e) => onFilterChange("category", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-button bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === "전체" ? "" : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="region-select"
              className="text-xs text-gray-500 mb-2 block"
            >
              지역
            </label>
            <select
              id="region-select"
              value={currentRegion}
              onChange={(e) => onFilterChange("region", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-button bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
            >
              {REGIONS.map((reg) => (
                <option key={reg} value={reg === "전체" ? "" : reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
);

FilterBar.displayName = "FilterBar";

export default FilterBar;
