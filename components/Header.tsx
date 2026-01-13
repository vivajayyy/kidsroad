"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);

  // 컴포넌트가 마운트된 후에만 다크 모드 토글이 가능하도록 처리
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleDarkMode = () => {
    if (isMounted) {
      document.documentElement.classList.toggle("dark");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <h1 className="text-xl font-bold tracking-tighter text-primary dark:text-white uppercase">
            Kidsroad
          </h1>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a
              className="text-primary dark:text-white underline underline-offset-8 decoration-2"
              href="#"
            >
              Discover
            </a>
            <a
              className="hover:text-primary dark:hover:text-white transition-colors"
              href="#"
            >
              Calendar
            </a>
            <a
              className="hover:text-primary dark:hover:text-white transition-colors"
              href="#"
            >
              Community
            </a>
            <a
              className="hover:text-primary dark:hover:text-white transition-colors"
              href="#"
            >
              Map
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleDarkMode}
            disabled={!isMounted} // 마운트 되기 전까지 비활성화
          >
            <span className="material-symbols-outlined text-[20px]">
              dark_mode
            </span>
          </button>
          <div className="w-8 h-8 rounded-full bg-sage-200 dark:bg-sage-600 flex items-center justify-center text-xs font-bold">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
