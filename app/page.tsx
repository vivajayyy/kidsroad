import { createClient } from "@supabase/supabase-js";
import React from "react";
import Image from "next/image";
import type { Database } from "@/types/supabase";
import EventView from "@/components/EventView";

export const revalidate = 3600; // 1시간마다 데이터 재검증

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const resolvedSearchParams = await searchParams;

  const q = resolvedSearchParams["q"];
  const cat = resolvedSearchParams["category"];
  const reg = resolvedSearchParams["region"];

  const query = typeof q === "string" ? q : "";
  const category = typeof cat === "string" ? cat : "";
  const region = typeof reg === "string" ? reg : "";

  let supabaseQuery = supabase.from("events").select("*");

  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
  }
  if (category) {
    supabaseQuery = supabaseQuery.eq("category", category);
  }
  if (region) {
    supabaseQuery = supabaseQuery.like("addr1", `${region}%`);
  }

  const { data: events, error } = await supabaseQuery.order("eventstartdate", {
    ascending: true,
  });

  if (error) {
    console.error("Error fetching events:", error);
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return <EventView events={events || []} />;
}
