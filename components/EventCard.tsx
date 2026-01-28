"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { Event } from "../lib/events";
import { format, differenceInCalendarDays } from "date-fns";
import { ko } from "date-fns/locale";
import { toggleBookmark } from "@/lib/bookmarks";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";
import Badge from "./ui/Badge";

interface EventCardProps {
  event: Event;
  initialIsBookmarked?: boolean;
  onClick?: () => void;
}

const formatAgeRanges = (ranges: string[] | null): string => {
  if (!ranges || ranges.length === 0) return "전체 연령";
  const numbers = ranges
    .flatMap((r) => r.split("-"))
    .map(Number)
    .filter((n) => !isNaN(n));
  if (numbers.length === 0) return "전체 연령";

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  if (min === max) return `${min}세+`;
  return `${min}~${max}세`;
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "축제/행사": "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "문화시설": "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "관광지": "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
  "레포츠": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const days = differenceInCalendarDays(new Date(dateStr), new Date());
  return days >= 0 && days <= 7 ? days : null;
}

export default function EventCard({
  event,
  initialIsBookmarked = false,
  onClick,
}: EventCardProps) {
  const ageText = formatAgeRanges(event.age_ranges);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const daysUntil = getDaysUntil(event.eventstartdate);
  const hasImage = !!event.firstimage;
  const gradient =
    CATEGORY_GRADIENTS[event.category || ""] || CATEGORY_GRADIENTS.default;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    startTransition(async () => {
      try {
        await toggleBookmark(event.contentid);
        showToast(
          nextState ? "관심 행사에 저장되었습니다." : "저장이 취소되었습니다.",
          "success"
        );
        router.refresh();
      } catch (error: unknown) {
        const err = error as Error;
        console.error(err);
        setIsBookmarked(!nextState);
        if (err.message.includes("Unauthorized")) {
          showToast("로그인이 필요한 서비스입니다.", "error");
        } else {
          showToast("오류가 발생했습니다.", "error");
        }
      }
    });
  };

  const checklistItems = [
    { key: "parking", icon: "local_parking", label: "주차 가능", active: event.has_parking },
    { key: "stroller", icon: "stroller", label: "유모차 가능", active: event.has_stroller_access },
    { key: "nursing", icon: "child_care", label: "수유실 있음", active: event.has_nursing_room },
    { key: "free", icon: "payments", label: "무료", active: event.is_free },
  ];

  const activeChecklist = checklistItems.filter((item) => item.active);

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer transition-all card-hover focus-visible:ring-2 focus-visible:ring-primary"
      tabIndex={0}
      role="button"
      aria-label={event.title}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {hasImage ? (
          <Image
            src={event.firstimage!}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full" style={{ background: gradient }} />
        )}

        {/* 좌상단: 연령 뱃지 */}
        <div className="absolute top-3 left-3">
          <Badge variant="age">{ageText}</Badge>
        </div>

        {/* 우상단: 북마크 버튼 */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="absolute top-3 right-3 p-2.5 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white dark:hover:bg-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
        >
          <span
            className={`material-symbols-outlined text-xl ${
              isBookmarked
                ? "text-primary"
                : "text-gray-700 dark:text-gray-300"
            }`}
            style={
              isBookmarked
                ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
                : undefined
            }
          >
            bookmark
          </span>
        </button>

        {/* 우하단: D-Day 뱃지 */}
        {daysUntil !== null && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="dday">
              {daysUntil === 0 ? "오늘" : `D-${daysUntil}`}
            </Badge>
          </div>
        )}
      </div>

      {/* 카드 콘텐츠 */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {event.title}
        </h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-lg leading-none">
              calendar_today
            </span>
            <span className="font-medium">
              {format(new Date(event.eventstartdate), "yyyy.MM.dd", {
                locale: ko,
              })}
              {event.eventenddate &&
                event.eventstartdate !== event.eventenddate &&
                ` ~ ${format(new Date(event.eventenddate), "yyyy.MM.dd", {
                  locale: ko,
                })}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="material-symbols-outlined text-lg leading-none">
              location_on
            </span>
            <span className="font-medium">
              {event.addr1?.split(" ").slice(0, 2).join(" ") || "장소 미정"}
            </span>
          </div>
        </div>

        {/* 체크리스트 아이콘 */}
        {activeChecklist.length > 0 && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {activeChecklist.map((item) => (
              <span
                key={item.key}
                className={`material-symbols-outlined text-lg ${
                  item.key === "free"
                    ? "text-primary"
                    : "text-gray-400 dark:text-gray-500"
                }`}
                title={item.label}
              >
                {item.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
