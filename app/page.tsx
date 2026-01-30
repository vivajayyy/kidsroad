import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import EventView from "@/components/EventView";

export const revalidate = 3600;

export default async function Home() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 모든 이벤트를 가져옴 (클라이언트에서 필터링)
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("eventstartdate", { ascending: true });

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
