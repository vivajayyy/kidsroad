"use client";

import React, { useState, useCallback, useRef, useEffect, useOptimistic, startTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "@/types/supabase";
import FilterBar from "./FilterBar";
import EventGrid from "./EventGrid";
import CurationCarousel from "./CurationCarousel";
import SegmentedControl from "./ui/SegmentedControl";
import { getUserBookmarkedEventIds, toggleBookmark } from "@/lib/bookmarks";
import NaverMap from "./NaverMap";
import { useToast } from "./ui/Toast";

type Event = Tables<"events">;

const VIEW_OPTIONS = [
  { value: "list", label: "목록", icon: "grid_view" },
  { value: "map", label: "지도", icon: "map" },
];

// 필터 상태 타입
interface FilterState {
  query: string;
  category: string;
  region: string;
  age: string;
  checklist: Record<string, boolean>;
}

const initialFilterState: FilterState = {
  query: "",
  category: "",
  region: "",
  age: "",
  checklist: {
    free: false,
    paid: false,
    indoor: false,
    outdoor: false,
    parking: false,
    stroller: false,
    nursing: false,
  },
};

export default function EventView({ events }: { events: Event[] }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<string>("list");
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const { showToast } = useToast();

  // 클라이언트 측 필터링 (useMemo로 성능 최적화)
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // 검색어 필터
      if (filters.query) {
        const searchLower = filters.query.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(searchLower);
        const addrMatch = event.addr1?.toLowerCase().includes(searchLower);
        if (!titleMatch && !addrMatch) return false;
      }

      // 카테고리 필터
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // 지역 필터
      if (filters.region && !event.addr1?.startsWith(filters.region)) {
        return false;
      }

      // 연령 필터
      if (filters.age) {
        const selectedAges = filters.age.split(",").map((a) => a.trim());
        const eventAges = event.age_ranges || [];
        const hasMatch = selectedAges.some((age) => eventAges.includes(age));
        if (!hasMatch) return false;
      }

      // 체크리스트 필터
      if (filters.checklist.free && !event.is_free) return false;
      if (filters.checklist.paid && event.is_free) return false;
      if (filters.checklist.indoor && !event.is_indoor) return false;
      if (filters.checklist.outdoor && event.is_indoor !== false) return false;
      if (filters.checklist.parking && !event.has_parking) return false;
      if (filters.checklist.stroller && !event.has_stroller_access) return false;
      if (filters.checklist.nursing && !event.has_nursing_room) return false;

      return true;
    });
  }, [events, filters]);

  const [showSearchHere, setShowSearchHere] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<{
    south: number;
    west: number;
    north: number;
    east: number;
  } | null>(null);
  const [mapBoundsFilter, setMapBoundsFilter] = useState<{
    south: number;
    west: number;
    north: number;
    east: number;
  } | null>(null);

  const onBoundsChanged = useCallback((bounds: { south: number; west: number; north: number; east: number }) => {
    setCurrentBounds(bounds);
    setShowSearchHere(true);
  }, []);

  const handleSearchInArea = () => {
    if (!currentBounds) return;
    setMapBoundsFilter(currentBounds);
    setShowSearchHere(false);
  };

  // 지도 bounds 필터 적용
  const displayEvents = useMemo(() => {
    if (!mapBoundsFilter) return filteredEvents;
    return filteredEvents.filter((event) => {
      if (!event.mapy || !event.mapx) return false;
      return (
        event.mapy >= mapBoundsFilter.south &&
        event.mapy <= mapBoundsFilter.north &&
        event.mapx >= mapBoundsFilter.west &&
        event.mapx <= mapBoundsFilter.east
      );
    });
  }, [filteredEvents, mapBoundsFilter]);

  const [optimisticBookmarkedIds, addOptimisticId] = useOptimistic(
    bookmarkedIds,
    (state: Set<string>, id: string) => {
      const next = new Set(state);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    }
  );

  const router = useRouter();
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const ids = await getUserBookmarkedEventIds();
        setBookmarkedIds(new Set(ids));
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      }
    }
    fetchBookmarks();
  }, []);

  const handleToggleBookmark = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();

    startTransition(() => {
      addOptimisticId(eventId);
    });

    try {
      const result = await toggleBookmark(eventId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (result.bookmarked) {
          next.add(eventId);
          showToast("관심 행사에 저장되었습니다.", "success");
        } else {
          next.delete(eventId);
          showToast("저장이 취소되었습니다.", "success");
        }
        return next;
      });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes("Unauthorized")) {
        showToast("로그인이 필요한 서비스입니다.", "error");
      } else {
        console.error("Bookmark toggle failed:", error);
        showToast("북마크 저장 중 오류가 발생했습니다.", "error");
      }
    }
  };

  const handleEventSelect = (event: Event) => {
    router.push(`/events/${event.contentid}`);
  };

  const handleFilterChange = useCallback((key: string, value: string) => {
    // 지도 bounds 필터 초기화 (필터 변경 시)
    setMapBoundsFilter(null);
    setShowSearchHere(false);

    setFilters((prev) => {
      // 체크리스트 필터인 경우
      if (["free", "paid", "indoor", "outdoor", "parking", "stroller", "nursing"].includes(key)) {
        return {
          ...prev,
          checklist: {
            ...prev.checklist,
            [key]: value === "true",
          },
        };
      }

      // 일반 필터인 경우
      return {
        ...prev,
        [key === "q" ? "query" : key]: value,
      };
    });
  }, []);

  return (
    <main className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 히어로 */}
      <section className="pt-6 pb-2 md:pt-10 md:pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          이번 주말, 아이와 <span className="text-primary">어디 갈까?</span>
        </h2>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
          우리 아이에게 딱 맞는 행사를 찾아보세요
        </p>
      </section>

      {/* 큐레이션 캐러셀 */}
      <CurationCarousel />

      {/* 필터 */}
      <FilterBar
        ref={filterBarRef}
        currentQuery={filters.query}
        currentCategory={filters.category}
        currentRegion={filters.region}
        currentAge={filters.age}
        currentChecklist={filters.checklist}
        onFilterChange={handleFilterChange}
      />

      {/* 뷰 모드 토글 */}
      <div className="flex justify-end mb-4">
        <SegmentedControl
          options={VIEW_OPTIONS}
          value={viewMode}
          onChange={setViewMode}
        />
      </div>

      {/* "이 지역에서 검색" 버튼 */}
      {viewMode === "map" && showSearchHere && (
        <div className="relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-[50]">
            <button
              onClick={handleSearchInArea}
              className="bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-card-hover font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              이 지역에서 검색
            </button>
          </div>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <section>
        {viewMode === "list" ? (
          <EventGrid
            events={displayEvents}
            onEventSelect={handleEventSelect}
            bookmarkedIds={optimisticBookmarkedIds}
          />
        ) : (
          <div className="h-[600px] md:h-[calc(100vh-280px)] w-full relative rounded-card overflow-hidden">
            <NaverMap
              events={displayEvents}
              onEventSelect={handleEventSelect}
              onBoundsChanged={onBoundsChanged}
            />
          </div>
        )}
      </section>
    </main>
  );
}
