import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import EventView from "@/components/EventView";

export const revalidate = 3600;

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
  const age = resolvedSearchParams["age"];
  const free = resolvedSearchParams["free"];
  const indoor = resolvedSearchParams["indoor"];
  const outdoor = resolvedSearchParams["outdoor"];
  const parking = resolvedSearchParams["parking"];
  const stroller = resolvedSearchParams["stroller"];
  const nursing = resolvedSearchParams["nursing"];

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

  // 연령 필터
  if (typeof age === "string" && age) {
    const ageValues = age.split(",").map((a) => a.trim());
    supabaseQuery = supabaseQuery.overlaps("age_ranges", ageValues);
  }

  // 체크리스트 필터
  if (free === "true") {
    supabaseQuery = supabaseQuery.eq("is_free", true);
  }
  if (indoor === "true") {
    supabaseQuery = supabaseQuery.eq("is_indoor", true);
  }
  if (outdoor === "true") {
    supabaseQuery = supabaseQuery.eq("is_indoor", false);
  }
  if (parking === "true") {
    supabaseQuery = supabaseQuery.eq("has_parking", true);
  }
  if (stroller === "true") {
    supabaseQuery = supabaseQuery.eq("has_stroller_access", true);
  }
  if (nursing === "true") {
    supabaseQuery = supabaseQuery.eq("has_nursing_room", true);
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
