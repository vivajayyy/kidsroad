"use client";

import React, { useState, useCallback, useRef, useEffect, useOptimistic, startTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Tables } from "@/types/supabase";
import FilterBar from "./FilterBar";
import EventGrid from "./EventGrid";
import EventDetailSheet from "./EventDetailSheet";
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

export default function EventView({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<string>("list");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const { showToast } = useToast();

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const [showSearchHere, setShowSearchHere] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<{
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
    const visible = events.filter((event) => {
      if (!event.mapy || !event.mapx) return false;
      return (
        event.mapy >= currentBounds.south &&
        event.mapy <= currentBounds.north &&
        event.mapx >= currentBounds.west &&
        event.mapx <= currentBounds.east
      );
    });
    setFilteredEvents(visible);
    setShowSearchHere(false);
  };

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (target.closest("[role='dialog']") || target.closest(".event-card-trigger")) return;
      if (filterBarRef.current?.contains(target)) return;
      setSelectedEvent(null);
    }

    if (selectedEvent) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedEvent]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return (
    <>
      <main className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* 히어로 */}
        <section className="pt-8 pb-4 md:pt-12 md:pb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            이번 주말, 아이와 어디 갈까?
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
          currentQuery={searchParams.get("q") || ""}
          currentCategory={searchParams.get("category") || ""}
          currentRegion={searchParams.get("region") || ""}
          currentAge={searchParams.get("age") || ""}
          currentChecklist={{
            free: searchParams.get("free") === "true",
            indoor: searchParams.get("indoor") === "true",
            outdoor: searchParams.get("outdoor") === "true",
            parking: searchParams.get("parking") === "true",
            stroller: searchParams.get("stroller") === "true",
            nursing: searchParams.get("nursing") === "true",
          }}
          onFilterChange={handleFilterChange}
        />

        {/* 뷰 모드 토글 */}
        <div className="flex justify-end mb-6">
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
        <section className={`transition-all duration-500 ${selectedEvent ? "md:pr-[420px]" : ""}`}>
          {viewMode === "list" ? (
            <EventGrid
              events={filteredEvents}
              selectedEventId={selectedEvent?.contentid}
              onEventSelect={setSelectedEvent}
              bookmarkedIds={optimisticBookmarkedIds}
            />
          ) : (
            <div className="h-[600px] md:h-[calc(100vh-280px)] w-full relative rounded-card overflow-hidden">
              <NaverMap
                events={filteredEvents}
                onEventSelect={setSelectedEvent}
                onBoundsChanged={onBoundsChanged}
              />
            </div>
          )}
        </section>
      </main>

      {/* 디테일 시트 */}
      <EventDetailSheet
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isBookmarked={selectedEvent ? optimisticBookmarkedIds.has(selectedEvent.contentid) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </>
  );
}
