import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";

type Event = Database["public"]["Tables"]["events"]["Row"];

const CHECKLIST_MAP = [
  { key: "has_parking", icon: "local_parking", label: "주차 가능" },
  { key: "has_stroller_access", icon: "stroller", label: "유모차 가능" },
  { key: "has_nursing_room", icon: "child_care", label: "수유실 있음" },
  { key: "has_diaper_station", icon: "baby_changing_station", label: "기저귀 교환대" },
  { key: "is_free", icon: "payments", label: "무료 입장" },
] as const;

function formatDateStr(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "yyyy.MM.dd (eee)", { locale: ko });
  } catch {
    return "-";
  }
}

function formatAgeRanges(ranges: string[] | null): string {
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
}

async function getEvent(contentid: string): Promise<Event | null> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("contentid", contentid)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return { title: "행사를 찾을 수 없습니다 | 키즈로드" };
  }

  const description =
    event.description?.replace(/<[^>]*>/g, "").slice(0, 155) ||
    `${event.title} - ${event.addr1 || ""}`;

  return {
    title: `${event.title} | 키즈로드`,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.firstimage ? [{ url: event.firstimage }] : [],
      type: "article",
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const checklist = CHECKLIST_MAP.filter(
    (item) => event[item.key as keyof Event]
  );

  const ageText = formatAgeRanges(event.age_ranges);

  const naverMapUrl =
    event.mapx && event.mapy
      ? `https://map.naver.com/v5/search/${encodeURIComponent(event.title)}?c=${event.mapx},${event.mapy},15,0,0,0,dh`
      : `https://map.naver.com/v5/search/${encodeURIComponent(event.addr1 || event.title)}`;

  const CATEGORY_GRADIENTS: Record<string, string> = {
    "축제/행사": "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "문화시설": "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    "관광지": "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    "레포츠": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* 상단 네비게이션 */}
      <nav className="sticky top-14 md:top-16 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
            <span className="text-sm font-medium">뒤로</span>
          </Link>
          <BookmarkButton contentid={event.contentid} />
        </div>
      </nav>

      <article className="max-w-3xl mx-auto">
        {/* 히어로 이미지 */}
        <div className="relative w-full aspect-[16/10] bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {event.firstimage ? (
            <Image
              src={event.firstimage}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          ) : (
            <div className="w-full h-full" style={{ background: CATEGORY_GRADIENTS[event.category || ""] || CATEGORY_GRADIENTS.default }} />
          )}

          {/* 연령 뱃지 */}
          <div className="absolute top-4 left-4">
            <Badge variant="age">{ageText}</Badge>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="px-5 md:px-6 py-8">
          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            {event.title}
          </h1>

          {/* 핵심 정보 */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-gray-400 w-6 h-6 flex items-center justify-center flex-shrink-0">
                calendar_today
              </span>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                  일정
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {formatDateStr(event.eventstartdate)}
                  {event.eventenddate &&
                    event.eventstartdate !== event.eventenddate &&
                    ` ~ ${formatDateStr(event.eventenddate)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-gray-400 w-6 h-6 flex items-center justify-center flex-shrink-0">
                location_on
              </span>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                  위치
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {event.addr1 || "장소 미정"}
                </span>
                {event.addr2 && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {event.addr2}
                  </span>
                )}
              </div>
            </div>

            {event.usetimefestival && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-gray-400 w-6 h-6 flex items-center justify-center flex-shrink-0">
                  payments
                </span>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                    요금
                  </span>
                  <span
                    className="font-medium text-gray-900 dark:text-white text-sm"
                    dangerouslySetInnerHTML={{ __html: event.usetimefestival }}
                  />
                </div>
              </div>
            )}

            {event.tel && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-gray-400 w-6 h-6 flex items-center justify-center flex-shrink-0">
                  call
                </span>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                    문의
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {event.tel}
                  </span>
                </div>
              </div>
            )}

            {event.playtime && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-gray-400 w-6 h-6 flex items-center justify-center flex-shrink-0">
                  schedule
                </span>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                    이용 시간
                  </span>
                  <span
                    className="font-medium text-gray-900 dark:text-white text-sm"
                    dangerouslySetInnerHTML={{ __html: event.playtime }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 부모 체크리스트 */}
          {checklist.length > 0 && (
            <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                부모 체크리스트
              </h2>
              <div className="flex flex-wrap gap-2">
                {checklist.map((item) => (
                  <span
                    key={item.key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700"
                  >
                    <span className="material-symbols-outlined text-base text-primary">
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
            <div className="mb-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                상세 정보
              </h2>
              <div
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-6 pb-8 border-t border-gray-100 dark:border-gray-800">
            <a
              href={naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-button font-semibold text-sm text-center hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                directions
              </span>
              길찾기
            </a>
            <ShareButton title={event.title} contentid={event.contentid} />
          </div>
        </div>
      </article>
    </div>
  );
}
