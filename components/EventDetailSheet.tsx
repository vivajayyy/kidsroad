"use client";

import Image from "next/image";
import type { Tables } from "@/types/supabase";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import BottomSheet from "./ui/BottomSheet";

type Event = Tables<"events">;

interface EventDetailSheetProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, eventId: string) => void;
}

const CHECKLIST_MAP = [
  { key: "has_parking", icon: "local_parking", label: "주차 가능" },
  { key: "has_stroller_access", icon: "stroller", label: "유모차 가능" },
  { key: "has_nursing_room", icon: "child_care", label: "수유실 있음" },
  { key: "has_diaper_station", icon: "baby_changing_station", label: "기저귀 교환대" },
] as const;

function formatDateStr(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "yyyy.MM.dd", { locale: ko });
  } catch {
    return "-";
  }
}

function DetailContent({
  event,
  isBookmarked,
  onToggleBookmark,
  onClose,
}: {
  event: Event;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, eventId: string) => void;
  onClose: () => void;
}) {
  const checklist = CHECKLIST_MAP.filter(
    (item) => event[item.key as keyof Event]
  );

  const naverMapUrl = event.mapx && event.mapy
    ? `https://map.naver.com/v5/search/${encodeURIComponent(event.title)}?c=${event.mapx},${event.mapy},15,0,0,0,dh`
    : `https://map.naver.com/v5/search/${encodeURIComponent(event.addr1 || event.title)}`;

  return (
    <>
      {/* 이미지 */}
      <div className="relative w-full h-[200px] md:h-[280px] bg-gray-200 dark:bg-gray-800 overflow-hidden">
        {event.firstimage ? (
          <Image
            src={event.firstimage}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400 text-5xl">
              image
            </span>
          </div>
        )}
        {/* 닫기 버튼 (데스크톱) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
          aria-label="닫기"
        >
          <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
            close
          </span>
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="p-6">
        {/* 제목 + 북마크 */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {event.title}
          </h2>
          <button
            onClick={(e) => onToggleBookmark(e, event.contentid)}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                isBookmarked ? "text-primary" : "text-gray-400"
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
        </div>

        {/* 핵심 정보 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-lg text-gray-400">
              calendar_today
            </span>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">일정</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDateStr(event.eventstartdate)}
                {event.eventenddate && event.eventstartdate !== event.eventenddate
                  ? ` ~ ${formatDateStr(event.eventenddate)}`
                  : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-lg text-gray-400">
              location_on
            </span>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">위치</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {event.addr1 || "장소 미정"}
              </span>
            </div>
          </div>

          {event.usetimefestival && (
            <div className="flex items-center gap-3 text-sm">
              <span className="material-symbols-outlined text-lg text-gray-400">
                payments
              </span>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">요금</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {event.usetimefestival}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 부모 체크리스트 */}
        {checklist.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
              부모 체크리스트
            </h3>
            <div className="flex flex-wrap gap-2">
              {checklist.map((item) => (
                <span
                  key={item.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  <span className="material-symbols-outlined text-base">
                    {item.icon}
                  </span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 설명 */}
        {event.description && (
          <div className="mb-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div
              className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        )}

        {/* CTA 버튼 */}
        <div className="flex gap-3 pt-4">
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-button font-semibold text-sm text-center hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              directions
            </span>
            길찾기
          </a>
          <button
            onClick={(e) => onToggleBookmark(e, event.contentid)}
            className="w-12 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-button hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="북마크"
          >
            <span
              className={`material-symbols-outlined ${
                isBookmarked ? "text-primary" : "text-gray-400"
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
        </div>
      </div>
    </>
  );
}

export default function EventDetailSheet({
  event,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: EventDetailSheetProps) {
  if (!event) return null;

  return (
    <>
      {/* 모바일: 바텀시트 */}
      <BottomSheet isOpen={isOpen} onClose={onClose} maxHeight="85vh">
        <DetailContent
          event={event}
          isBookmarked={isBookmarked}
          onToggleBookmark={onToggleBookmark}
          onClose={onClose}
        />
      </BottomSheet>

      {/* 데스크톱: 사이드패널 */}
      <aside
        className={`hidden md:block fixed right-0 top-0 h-screen w-[400px] bg-white dark:bg-[#161616] shadow-panel z-[60] border-l border-gray-100 dark:border-gray-800 overflow-y-auto custom-scrollbar transition-transform duration-350 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="이벤트 상세"
      >
        <DetailContent
          event={event}
          isBookmarked={isBookmarked}
          onToggleBookmark={onToggleBookmark}
          onClose={onClose}
        />
      </aside>
    </>
  );
}
