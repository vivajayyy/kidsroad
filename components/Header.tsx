"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthButton from "./AuthButton";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User | null;
}

const navLinks = [
  { href: "/", label: "탐색" },
  { href: "/?view=map", label: "지도" },
  { href: "/my", label: "저장" },
];

export default function Header({ user }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const toggleDarkMode = () => {
    if (isMounted) {
      document.documentElement.classList.toggle("dark");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* 로고 + 데스크톱 네비 */}
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="키즈로드 홈">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              키즈로드
            </h1>
          </Link>

          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="메인 내비게이션"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center gap-3">
          {/* 모바일: 검색 아이콘 */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="검색"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-700 dark:text-gray-300">
              search
            </span>
          </button>

          {/* 데스크톱: 다크모드 토글 */}
          <button
            className="hidden md:flex p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={toggleDarkMode}
            disabled={!isMounted}
            aria-label="다크모드 전환"
          >
            <span className="material-symbols-outlined text-[20px] text-gray-700 dark:text-gray-300">
              dark_mode
            </span>
          </button>

          {/* 로그인 버튼 */}
          <AuthButton user={user} />
        </div>
      </div>
    </header>
  );
}
