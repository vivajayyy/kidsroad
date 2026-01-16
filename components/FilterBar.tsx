"use client";

import React, { useState, useEffect, forwardRef } from "react";

// 나중에 DB에서 동적으로 가져올 수 있지만, 우선은 상수로 정의합니다.
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

interface FilterBarProps {
  currentQuery: string;
  currentCategory: string;
  currentRegion: string;
  onFilterChange: (key: "q" | "category" | "region", value: string) => void;
}

const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  ({ currentQuery, currentCategory, currentRegion, onFilterChange }, ref) => {
    const [searchTerm, setSearchTerm] = useState(currentQuery);

    useEffect(() => {
      setSearchTerm(currentQuery);
    }, [currentQuery]);

    useEffect(() => {
      const handler = setTimeout(() => {
        if (searchTerm !== currentQuery) {
          onFilterChange("q", searchTerm);
        }
      }, 300); // 300ms delay

      return () => {
        clearTimeout(handler);
      };
    }, [searchTerm, currentQuery, onFilterChange]);

    return (
      <div className="mb-12" ref={ref}>
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="어떤 경험을 찾고 있나요?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
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
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === "전체" ? "" : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
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
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
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
