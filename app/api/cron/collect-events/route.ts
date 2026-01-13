// app/api/cron/collect-events/route.ts
import { NextResponse } from "next/server";
import { collectAndSaveEvents } from "../../../../lib/data-collection";

export async function GET(request: Request) {
  // 1. 보안: Vercel Cron에서 보낸 요청인지 확인
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. 데이터 수집 함수 실행
  try {
    const result = await collectAndSaveEvents();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[CRON] Failed to collect and save events:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
