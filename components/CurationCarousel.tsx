"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CurationItem {
  title: string;
  description: string;
  gradient: string;
  filterParams: string;
  count: number;
}

const curationData: CurationItem[] = [
  {
    title: "이번 주 무료 행사",
    description: "돈 안들이고 즐기기",
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FF9567 100%)",
    filterParams: "free=true",
    count: 12,
  },
  {
    title: "유모차 OK 실내 축제",
    description: "편하게 다녀오세요",
    gradient: "linear-gradient(135deg, #22B595 0%, #47CBAB 100%)",
    filterParams: "stroller=true&indoor=true",
    count: 8,
  },
  {
    title: "비 와도 걱정없는 실내 행사",
    description: "날씨 걱정 끝",
    gradient: "linear-gradient(135deg, #4A6FA5 0%, #6B8FC4 100%)",
    filterParams: "indoor=true",
    count: 15,
  },
  {
    title: "주차 편한 가족 나들이",
    description: "주차 스트레스 제로",
    gradient: "linear-gradient(135deg, #FF9567 0%, #FFB08D 100%)",
    filterParams: "parking=true",
    count: 10,
  },
  {
    title: "수유실 있는 곳만 모았어요",
    description: "엄마도 편하게",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #A87DFB 100%)",
    filterParams: "nursing=true",
    count: 6,
  },
];

export default function CurationCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement | undefined;
    if (card) {
      container.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
    }
  }, []);

  // 스크롤 위치 감지
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = (container.firstElementChild as HTMLElement)?.offsetWidth || 288;
      const index = Math.round(scrollLeft / (cardWidth + 16));
      setActiveIndex(Math.min(index, curationData.length - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCardClick = (filterParams: string) => {
    router.push(`/?${filterParams}`);
  };

  return (
    <section className="py-6" aria-label="큐레이션 추천">
      {/* 캐러셀 */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {curationData.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleCardClick(item.filterParams)}
            className="flex-none w-72 h-36 rounded-2xl p-6 flex flex-col justify-between text-left transition-transform active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary"
            style={{ background: item.gradient, scrollSnapAlign: "start" }}
            aria-label={`${item.title} - ${item.count}개 행사`}
          >
            <div>
              <h3 className="text-white text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-white/80 text-sm">{item.description}</p>
            </div>
            <div className="text-white/60 text-xs font-medium">
              {item.count}개 행사
            </div>
          </button>
        ))}
      </div>

      {/* Dot indicator */}
      <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="캐러셀 인디케이터">
        {curationData.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`${index + 1}번째 슬라이드`}
            onClick={() => {
              setActiveIndex(index);
              scrollToIndex(index);
            }}
            className="p-2 -m-1"
          >
            <span
              className={`block w-2 h-2 rounded-full transition-colors ${
                index === activeIndex
                  ? "bg-gray-900 dark:bg-white"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
