"use client";

import { useState } from "react";
import { createClient } from "@/lib/auth/client";
import type { User } from "@supabase/supabase-js";

interface AuthButtonProps {
  user: User | null;
}

export default function AuthButton({ user }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

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
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
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
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.user_metadata.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="프로필"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user.user_metadata.nickname || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50"
        >
          {isLoading ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="px-6 py-2.5 bg-[#FEE500] text-[#000000] font-medium rounded-lg hover:bg-[#FDD835] transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0C4.032 0 0 3.582 0 8c0 2.8 1.476 5.262 3.708 6.72-.156.66-.996 4.2-1.128 4.752-.156.66.252.648.528.468.204-.132 3.384-2.22 4.644-3.036.408.06.828.096 1.248.096 4.968 0 9-3.582 9-8s-4.032-8-9-8z"
          fill="#000000"
        />
      </svg>
      {isLoading ? "로그인 중..." : "카카오 로그인"}
    </button>
  );
}
