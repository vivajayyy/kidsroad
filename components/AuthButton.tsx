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
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        disabled={isLoading}
        className="px-4 py-2 min-h-[44px] min-w-[44px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        aria-label="로그인"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <span className="hidden md:inline">
          {isLoading ? "로그인 중..." : "로그인"}
        </span>
        <span className="md:hidden material-symbols-outlined text-lg">
          person
        </span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-dropdown border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-scale-in origin-top-right">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              로그인
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              간편하게 시작하세요
            </p>
          </div>
          <button
            onClick={() => handleSignIn("kakao")}
            disabled={isLoading}
            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect width="20" height="20" rx="4" fill="#FEE500" />
              <path
                d="M10 5C6.68629 5 4 7.10167 4 9.70082C4 11.342 5.08604 12.7792 6.72727 13.5927L6.1066 15.7594C6.06381 15.9072 6.23405 16.0257 6.36233 15.9395L9.04124 14.2032C9.35577 14.2404 9.67537 14.2603 10 14.2603C13.3137 14.2603 16 12.1587 16 9.55929C16 7.10167 13.3137 5 10 5Z"
                fill="#391B1B"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              카카오로 시작하기
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
