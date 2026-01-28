"use client";

import type { Event } from "@/lib/events";
import EventCard from "./EventCard";
import EmptyState from "./ui/EmptyState";
import { useRouter } from "next/navigation";

interface EventGridProps {
  events: Event[];
  selectedEventId?: string | null;
  onEventSelect?: (event: Event) => void;
  bookmarkedIds?: Set<string>;
}

export default function EventGrid({
  events,
  onEventSelect,
  bookmarkedIds = new Set(),
}: EventGridProps) {
  const router = useRouter();

  if (events.length === 0) {
    return (
      <EmptyState
        icon="search_off"
        title="검색 결과가 없어요"
        description="필터를 변경하거나 다른 키워드로 검색해 보세요"
        action={{
          label: "전체 행사 보기",
          onClick: () => router.push("/"),
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <div
          key={event.contentid}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
        >
          <EventCard
            event={event}
            initialIsBookmarked={bookmarkedIds.has(event.contentid)}
            onClick={() => onEventSelect?.(event)}
          />
        </div>
      ))}
    </div>
  );
}
