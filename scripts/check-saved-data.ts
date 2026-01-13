/**
 * Check saved data in Supabase
 * 저장된 데이터를 확인하는 스크립트
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

async function checkData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ Supabase credentials not found");
    return;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  console.log("=== Supabase Data Check ===\n");

  // Get total count
  const { count: totalCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true });

  console.log(`📊 Total events: ${totalCount}\n`);

  // Get recent events with enrichment info
  const { data: recentEvents, error } = await supabase
    .from("events")
    .select(
      "title, has_parking, has_stroller_access, has_nursing_room, tags, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("❌ Error fetching data:", error);
    return;
  }

  console.log("📋 Recent 10 events:\n");

  recentEvents?.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title}`);
    console.log(
      `   주차: ${event.has_parking === null ? "정보없음" : event.has_parking ? "O" : "X"}`
    );
    console.log(
      `   유모차: ${event.has_stroller_access === null ? "정보없음" : event.has_stroller_access ? "O" : "X"}`
    );
    console.log(
      `   수유실: ${event.has_nursing_room === null ? "정보없음" : event.has_nursing_room ? "O" : "X"}`
    );
    console.log(
      `   태그: ${event.tags?.length || 0}개 ${event.tags?.slice(0, 5).join(", ") || "없음"}`
    );
    console.log(
      `   생성: ${new Date(event.created_at || "").toLocaleString("ko-KR")}`
    );
    console.log("");
  });

  // Statistics
  const { data: stats } = await supabase
    .from("events")
    .select("has_parking, has_stroller_access, has_nursing_room, tags");

  if (stats) {
    const parkingCount = stats.filter((e) => e.has_parking === true).length;
    const strollerCount = stats.filter(
      (e) => e.has_stroller_access === true
    ).length;
    const nursingCount = stats.filter(
      (e) => e.has_nursing_room === true
    ).length;
    const withTags = stats.filter((e) => e.tags && e.tags.length > 0).length;

    console.log("📈 Statistics:");
    console.log(
      `   주차 가능: ${parkingCount}/${stats.length} (${((parkingCount / stats.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `   유모차 대여/접근 가능: ${strollerCount}/${stats.length} (${((strollerCount / stats.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `   수유실 있음: ${nursingCount}/${stats.length} (${((nursingCount / stats.length) * 100).toFixed(1)}%)`
    );
    console.log(
      `   태그 있음: ${withTags}/${stats.length} (${((withTags / stats.length) * 100).toFixed(1)}%)`
    );
  }

  console.log("\n=== Check Complete ===");
}

checkData().catch(console.error);
