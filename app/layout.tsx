import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
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
      <body
        className={`font-display antialiased bg-background-light text-gray-900 dark:bg-background-dark dark:text-gray-100 transition-colors duration-300`}
      >
        <ToastProvider>
          <Header user={user} />
          <main className="pt-16">{children}</main>
        </ToastProvider>
        <Script
          strategy="afterInteractive"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        />
      </body>
    </html>
  );
}
