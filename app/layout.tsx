import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Heart } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kidsroad | 우리 아이와 함께 걷는 가장 예쁜 길",
  description:
    '"내일은 어디 갈까?"라는 설렘이 걱정이 되지 않도록. 주차 정보부터 수유실 위치까지, 키즈로드가 부모님의 마음까지 챙겨 따뜻하고 편안한 외출을 완성해 드립니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* bg-slate-50: 전체 배경색을 아주 연한 회색으로 설정 (바깥 영역) */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {/* 
            수정된 반응형 컨테이너 
            - w-full: 기본적으로 가로 100% (모바일)
            - max-w-screen-xl: 너무 넓어지지 않게 최대 너비 제한 (약 1280px)
            - mx-auto: 중앙 정렬
        */}
        <main className="w-full max-w-screen-xl mx-auto min-h-screen bg-white shadow-sm">
          <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
            <h1 className="text-xl font-bold text-pink-500 flex items-center gap-2">
              <Heart size={24} fill="currentColor" />
              Kidsroad
            </h1>
            {/* 우측에 메뉴 등 추가 공간 확보 가능 */}
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
