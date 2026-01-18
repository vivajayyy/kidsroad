"use client";

import { useState, useTransition } from "react";
import type { Event } from "../lib/events";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toggleBookmark } from "@/lib/bookmarks";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: Event;
  initialIsBookmarked?: boolean;
}

const formatAgeRanges = (ranges: string[] | null): string => {
  if (!ranges || ranges.length === 0) return "All Ages";
  const numbers = ranges
    .flatMap((r) => r.split("-"))
    .map(Number)
    .filter((n) => !isNaN(n));
  if (numbers.length === 0) return "All Ages";

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  if (min === max) return `Age ${min}+`;
  return `Age ${min}-${max}`;
};

export default function EventCard({
  event,
  initialIsBookmarked = false,
}: EventCardProps) {
  const ageRangesText = formatAgeRanges(event.age_ranges);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    startTransition(async () => {
      try {
        await toggleBookmark(event.contentid);
        router.refresh();
      } catch (error) {
        console.error(error);
        setIsBookmarked(!nextState);
        alert("오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 p-8 rounded-xl card-hover cursor-pointer group shadow-sm">
      <div className="flex justify-between items-start mb-12">
        <span className="text-[10px] uppercase tracking-widest text-sage-600 font-bold bg-sage-50 dark:bg-sage-600/10 px-2 py-1 rounded">
          {ageRangesText}
        </span>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors focus:outline-none"
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
      <h3 className="text-xl font-medium mb-1">{event.title}</h3>
      <p className="text-gray-400 text-sm mb-0 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">
          location_on
        </span>
        {event.addr1?.split(" ").slice(0, 2).join(" ") || "장소 미정"}
      </p>
      <p className="text-xs text-gray-400 mt-2">
        {format(new Date(event.eventstartdate), "yyyy.MM.dd", { locale: ko })}
        {event.eventenddate && event.eventstartdate !== event.eventenddate
          ? ` ~ ${format(new Date(event.eventenddate), "yyyy.MM.dd", { locale: ko })}`
          : ""}
      </p>
    </div>
  );
}