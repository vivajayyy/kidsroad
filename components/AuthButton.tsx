"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/auth/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "./ui/Toast";
import Avatar from "./ui/Avatar";
import Link from "next/link";

interface AuthButtonProps {
  user: User | null;
}

export default function AuthButton({ user }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const handleSignIn = async (provider: "kakao") => {
    setIsLoading(true);
    setIsMenuOpen(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("로그인 오류:", error);
        showToast("로그인에 실패했습니다. 다시 시도해주세요.", "error");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      showToast("로그인에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setIsMenuOpen(false);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("로그아웃 오류:", error);
        showToast("로그아웃에 실패했습니다. 다시 시도해주세요.", "error");
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      showToast("로그아웃에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="사용자 메뉴"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <Avatar
            src={user.user_metadata.avatar_url}
            name={user.user_metadata.nickname || user.email || "U"}
            size="sm"
          />
          <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.user_metadata.nickname || user.email}
          </span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-dropdown border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-scale-in origin-top-right">
            <Link
              href="/my"
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              마이페이지
            </Link>
            <div className="border-t border-gray-100 dark:border-gray-800" />
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => handleSignIn("kakao")}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 h-[45px] px-4 bg-[#FEE500] hover:bg-[#F6DD00] text-[#000000] rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
      aria-label="카카오 로그인"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0.5C4.30558 0.5 0.5 3.43852 0.5 7.07143C0.5 9.32458 2.01292 11.2957 4.31818 12.4686L3.36364 16.3C3.30909 16.5143 3.55455 16.6857 3.74545 16.5571L8.17273 13.5286C8.43636 13.5571 8.71364 13.5714 9 13.5714C13.6944 13.5714 17.5 10.6329 17.5 7C17.5 3.43852 13.6944 0.5 9 0.5Z"
          fill="#000000"
        />
      </svg>
      <span className="hidden md:inline">
        {isLoading ? "로그인 중..." : "카카오 로그인"}
      </span>
    </button>
  );
}
