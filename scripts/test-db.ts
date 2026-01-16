// MUST load dotenv BEFORE any imports that use env vars
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Supabase URL:", supabaseUrl);
console.log("Key exists:", !!supabaseKey);

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log("🧪 Testing events table...\n");

  // 1. Insert test data
  console.log("1. Inserting test event...");
  const { data: insertData, error: insertError } = await supabase
    .from("events")
    .insert({
      contentid: "TEST001",
      title: "서울 키즈 페스티벌",
      eventstartdate: "2026-02-01",
      eventenddate: "2026-02-03",
      age_ranges: ["3-5", "6-9"],
      is_free: true,
      has_parking: true,
      has_stroller_access: true,
      is_indoor: false,
      category: "축제",
      description:
        "아이들과 함께하는 즐거운 야외 축제입니다. 다양한 체험 부스와 공연이 준비되어 있습니다.",
      addr1: "서울특별시 강남구 테헤란로 123",
    })
    .select();

  if (insertError) {
    console.error("❌ Insert failed:", insertError);
    return;
  }
  console.log("✅ Insert successful:", insertData);
  console.log("");

  // 2. Query by contentid
  console.log("2. Querying by contentid...");
  const { data: queryData, error: queryError } = await supabase
    .from("events")
    .select("*")
    .eq("contentid", "TEST001")
    .single();

  if (queryError) {
    console.error("❌ Query failed:", queryError);
    return;
  }
  console.log("✅ Query successful:", queryData);
  console.log("");

  // 3. Test age_ranges filter
  console.log("3. Testing age_ranges filter...");
  const { data: ageData, error: ageError } = await supabase
    .from("events")
    .select("contentid, title, age_ranges")
    .contains("age_ranges", ["3-5"]);

  if (ageError) {
    console.error("❌ Age filter failed:", ageError);
    return;
  }
  console.log("✅ Age filter successful:", ageData);
  console.log("");

  // 4. Test checklist filters
  console.log("4. Testing checklist filters...");
  const { data: checklistData, error: checklistError } = await supabase
    .from("events")
    .select("contentid, title, is_free, has_parking")
    .eq("is_free", true)
    .eq("has_parking", true);

  if (checklistError) {
    console.error("❌ Checklist filter failed:", checklistError);
    return;
  }
  console.log("✅ Checklist filter successful:", checklistData);
  console.log("");

  // 5. Cleanup - delete test data
  console.log("5. Cleaning up test data...");
  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("contentid", "TEST001");

  if (deleteError) {
    console.error("❌ Delete failed:", deleteError);
    return;
  }
  console.log("✅ Cleanup successful");
  console.log("");

  console.log("🎉 All tests passed!");
}

testDatabase().catch(console.error);
