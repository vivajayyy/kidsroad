"use client";

import React, { useState, useCallback, useRef, useEffect, useOptimistic, startTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Tables } from "@/types/supabase";
import FilterBar from "./FilterBar";
import { getUserBookmarkedEventIds, toggleBookmark } from "@/lib/bookmarks";
import NaverMap from "./NaverMap";

type Event = Tables<"events">;

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-5 border-b border-gray-100 dark:border-gray-800">
      <span className="text-[11px] text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[12px] font-medium text-right">{value}</span>
    </div>
  );
}

export default function EventView({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Optimistic UI state for bookmarks
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
  const panelRef = useRef<HTMLElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Fetch initial bookmarks on mount
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
    e.stopPropagation(); // Prevent card click
    
    startTransition(() => {
      addOptimisticId(eventId);
    });

    try {
      const result = await toggleBookmark(eventId);
      
      // Sync real state with server result
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (result.bookmarked) {
          next.add(eventId);
        } else {
          next.delete(eventId);
        }
        return next;
      });
    } catch (error: unknown) {
      const err = error as Error;
      // Revert optimistic update implicitly by not updating real state if error
      if (err.message.includes("Unauthorized")) {
        alert("로그인이 필요한 서비스입니다.");
      } else {
        console.error("Bookmark toggle failed:", error);
        alert("북마크 저장 중 오류가 발생했습니다.");
      }
    }
  };

  // Click outside to close side panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const targetElement = event.target as Element;

      // Do nothing if clicking inside the panel
      if (panelRef.current && panelRef.current.contains(targetElement)) {
        return;
      }

      // Do nothing if clicking inside the filter bar
      if (
        filterBarRef.current &&
        filterBarRef.current.contains(targetElement)
      ) {
        return;
      }

      // Do nothing if clicking on a card (which opens the panel)
      if (targetElement.closest(".event-card-trigger")) {
        return;
      }

      // Otherwise, close the panel
      setSelectedEvent(null);
    }

    if (selectedEvent) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const getChecklist = (event: Event) => {
    const checklist = [];
    if (event.has_parking)
      checklist.push({
        icon: "local_parking",
        label: "Parking",
        sub: "Available",
      });
    if (event.has_stroller_access)
      checklist.push({
        icon: "stroller",
        label: "Stroller Access",
        sub: "Barrier-free",
      });
    if (event.has_nursing_room)
      checklist.push({
        icon: "baby_changing_station",
        label: "Nursing Room",
        sub: "Available",
      });
    if (event.has_diaper_station)
      checklist.push({
        icon: "stroller",
        label: "Diaper Station",
        sub: "Available",
      });
    return checklist;
  };

  // Helper to format date strings
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr.length < 8) {
      return "-"; // Return dash if invalid date
    }
    try {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return new Date(`${year}-${month}-${day}`).toLocaleDateString("ko-KR");
    } catch (e) {
      return "-"; // Return dash if parsing fails
    }
  };

  return (
    <>
      <main className="pt-24 pb-12 px-8 max-w-[1440px] mx-auto flex gap-8">
        {/* --- Left Content: Event Grid or Map --- */}
        <section
          className={`transition-all duration-500 ease-in-out ${selectedEvent ? "w-full lg:w-3/5" : "w-full"}`}
        >
          <div className="mb-10">
            <h2 className="text-3xl font-light mb-2">
              Curated for your weekend.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Minimalist discovery of children&apos;s premium experiences.
            </p>
          </div>

          <FilterBar
            ref={filterBarRef}
            currentQuery={searchParams.get("q") || ""}
            currentCategory={searchParams.get("category") || ""}
            currentRegion={searchParams.get("region") || ""}
            onFilterChange={handleFilterChange}
          />
          
          <div className="flex justify-end mb-6 gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "map"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title="Map View"
            >
              <span className="material-symbols-outlined">map</span>
            </button>
          </div>

          {viewMode === "list" ? (
             events.length > 0 ? (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out ${selectedEvent ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
                >
                  {events.map((event) => {
                    const isBookmarked = optimisticBookmarkedIds.has(event.contentid);
                    return (
                      <div
                        key={event.contentid}
                        onClick={() => setSelectedEvent(event)}
                        className={`bg-white dark:bg-[#1E1E1E] p-8 rounded-xl card-hover cursor-pointer group shadow-sm border event-card-trigger ${selectedEvent?.contentid === event.contentid ? "border-primary dark:border-primary" : "border-gray-100 dark:border-gray-800"}`}
                      >
                        <div className="flex justify-between items-start mb-16">
                          <span className="text-[10px] uppercase tracking-widest text-sage-600 font-bold bg-sage-50 dark:bg-sage-600/20 px-2.5 py-1 rounded-md">
                            {(event.age_ranges && event.age_ranges[0]) || "All Ages"}
                          </span>
                          <button
                            onClick={(e) => handleToggleBookmark(e, event.contentid)}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                          >
                            <span
                              className={`material-symbols-outlined text-[20px] transition-colors ${
                                isBookmarked
                                  ? "text-primary dark:text-white fill-icon"
                                  : "text-gray-300 dark:text-gray-600 group-hover:text-gray-400"
                              }`}
                              style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                              bookmark
                            </span>
                          </button>
                        </div>
                        <h3 className="text-xl font-medium mb-1.5">{event.title}</h3>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            location_on
                          </span>
                          {event.addr1}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20 text-center text-gray-500">
                  <p>
                    검색 결과가 없습니다.
                    <br />
                    다른 키워드로 검색해 보세요.
                  </p>
                </div>
              )
          ) : (
             <div className="h-[600px] w-full relative">
               <NaverMap events={events} onEventSelect={setSelectedEvent} />
             </div>
          )}
        </section>

        {/* --- Right Content: Sliding Side Panel --- */}
        <aside
          ref={panelRef}
          className={`w-full lg:w-2/5 fixed right-0 top-0 h-screen bg-white dark:bg-[#161616] shadow-2xl z-[60] border-l border-gray-100 dark:border-gray-800 overflow-y-auto custom-scrollbar transition-transform duration-500 ease-in-out ${selectedEvent ? "translate-x-0" : "translate-x-full"}`}
        >
          {selectedEvent && (
            <>
              <div className="relative h-[45vh] w-full bg-gray-200 dark:bg-gray-800">
                {selectedEvent.firstimage ? (
                  <Image
                    src={selectedEvent.firstimage}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 40vw, 480px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400 text-6xl">
                      image
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur p-2 rounded-full shadow-lg"
                >
                  <span className="material-symbols-outlined text-primary dark:text-white">
                    close
                  </span>
                </button>
                <div className="absolute bottom-6 left-6 flex gap-2">
                  {selectedEvent.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/90 dark:bg-black/80 px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-10">
                <h2 className="text-3xl font-medium leading-tight mb-4">
                  {selectedEvent.title}
                </h2>
                {selectedEvent.description && (
                  <div
                    className="text-gray-500 text-sm leading-relaxed font-light mb-12"
                    dangerouslySetInnerHTML={{
                      __html: selectedEvent.description,
                    }}
                  />
                )}

                {getChecklist(selectedEvent).length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-8">
                      Parental Checklist
                    </h3>
                    <div className="grid grid-cols-2 gap-y-10 gap-x-4">
                      {getChecklist(selectedEvent).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="w-10 h-10 border border-gray-100 dark:border-gray-700 flex items-center justify-center rounded-lg text-sage-600">
                            <span className="material-symbols-outlined font-light">
                              {item.icon}
                            </span>
                          </div>
                          <div>
                            <p className="text-[12px] font-medium">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {item.sub}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mb-12 space-y-0">
                  <DetailRow label="Location" value={selectedEvent.addr1} />
                  {selectedEvent.eventstartdate &&
                    selectedEvent.eventenddate && (
                      <DetailRow
                        label="Schedule"
                        value={`${formatDate(selectedEvent.eventstartdate)} - ${formatDate(selectedEvent.eventenddate)}`}
                      />
                    )}
                  <DetailRow
                    label="Fee"
                    value={selectedEvent.usetimefestival}
                  />
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-primary text-white py-5 rounded font-medium tracking-widest uppercase text-xs hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-xl">
                    Apply for Session
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <button 
                    onClick={(e) => handleToggleBookmark(e, selectedEvent.contentid)}
                    className="w-16 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span 
                      className={`material-symbols-outlined ${optimisticBookmarkedIds.has(selectedEvent.contentid) ? "text-primary dark:text-white" : "text-gray-400"}`}
                      style={optimisticBookmarkedIds.has(selectedEvent.contentid) ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      bookmark
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </main>
    </>
  );
}