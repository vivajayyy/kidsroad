"use client";

import { useState } from "react";
import { createClient } from "@/lib/auth/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "./ui/Toast";
import Avatar from "./ui/Avatar";

interface AuthButtonProps {
  user: User | null;
}

export default function AuthButton({ user }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const { showToast } = useToast();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
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
      <div className="flex items-center gap-3">
        <Avatar
          src={user.user_metadata.avatar_url}
          name={user.user_metadata.nickname || user.email || "U"}
          size="sm"
        />
        <span className="hidden md:inline text-sm text-gray-700 dark:text-gray-300">
          {user.user_metadata.nickname || user.email}
        </span>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="hidden md:inline text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? "..." : "로그아웃"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
      aria-label="카카오 로그인"
    >
      <span className="hidden md:inline">
        {isLoading ? "로그인 중..." : "카카오 로그인"}
      </span>
      <span className="md:hidden material-symbols-outlined text-lg">
        person
      </span>
    </button>
  );
}
