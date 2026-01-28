import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { createClient } from "@/lib/auth/server";
import Script from "next/script";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Kidsroad | 우리 아이와 함께 걷는 가장 예쁜 길",
  description:
    '"내일은 어디 갈까?"라는 설렘이 걱정이 되지 않도록. 주차 정보부터 수유실 위치까지, 키즈로드가 부모님의 마음까지 챙겨 따뜻하고 편안한 외출을 완성해 드립니다.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`font-sans antialiased bg-background-light text-gray-900 dark:bg-background-dark dark:text-gray-100 transition-colors duration-300`}
      >
        <ToastProvider>
          <Header user={user} />
          <main className="pt-14 pb-20 md:pb-0">{children}</main>
          <BottomNav />
        </ToastProvider>
        <Script
          strategy="afterInteractive"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        />
      </body>
    </html>
  );
}
