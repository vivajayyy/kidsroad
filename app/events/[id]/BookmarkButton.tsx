"use client";

import { useState, useTransition } from "react";
import { toggleBookmark } from "@/lib/bookmarks";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  contentid: string;
}

export default function BookmarkButton({ contentid }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const handleToggle = () => {
    if (isPending) return;

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    startTransition(async () => {
      try {
        await toggleBookmark(contentid);
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

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
    >
      <span
        className={`material-symbols-outlined text-xl ${
          isBookmarked ? "text-primary" : "text-gray-600 dark:text-gray-400"
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
  );
}
