/**
 * System Health Check Script
 * 데이터 무결성 및 주요 필드 누락 여부를 점검합니다.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

async function runHealthCheck() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ Supabase credentials not found in .env.local");
    console.log("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
    return;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

  console.log("🏥 Starting System Health Check...\n");

  // 1. Map Coordinates Check
  console.log("Checking Map Coordinates (mapx, mapy)...");
  const { count: missingCoordsCount, error: coordsError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .or("mapx.is.null,mapy.is.null");

  if (coordsError) console.error("Error checking coords:", coordsError.message);
  else {
    if (missingCoordsCount === 0) {
      console.log("✅ All events have valid coordinates.");
    } else {
      console.log(`⚠️  Warning: ${missingCoordsCount} events are missing map coordinates.`);
    }
  }

  // 2. Image Assets Check
  console.log("\nChecking Image Assets (firstimage)...");
  const { count: missingImageCount, error: imageError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .is("firstimage", null);

  if (imageError) console.error("Error checking images:", imageError.message);
  else {
    if (missingImageCount === 0) {
      console.log("✅ All events have a primary image.");
    } else {
      console.log(`⚠️  Warning: ${missingImageCount} events are missing images.`);
    }
  }

  // 3. AI Enrichment Check (Age Ranges)
  console.log("\nChecking AI Data (age_ranges)...");
  const { count: missingAgeCount, error: ageError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .is("age_ranges", null);

  if (ageError) console.error("Error checking age ranges:", ageError.message);
  else {
    if (missingAgeCount === 0) {
      console.log("✅ All events have age recommendations.");
    } else {
      console.log(`⚠️  Warning: ${missingAgeCount} events are missing age range data.`);
    }
  }

    // 4. AI Enrichment Check (Description)
  console.log("\nChecking AI Data (description)...");
  const { count: missingDescCount, error: descError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .is("description", null);

  if (descError) console.error("Error checking description:", descError.message);
  else {
    if (missingDescCount === 0) {
      console.log("✅ All events have descriptions.");
    } else {
      console.log(`⚠️  Warning: ${missingDescCount} events are missing AI descriptions.`);
    }
  }

  console.log("\n✅ Health Check Completed.");
}

runHealthCheck().catch(console.error);
