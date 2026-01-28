import { createClient } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import EventCard from "@/components/EventCard";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { Event } from "@/lib/events";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch bookmarked events
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("event_id")
    .eq("user_id", user.id);

  const eventIds = bookmarks?.map((b) => b.event_id) || [];
  let events: Event[] = [];

  if (eventIds.length > 0) {
    const { data } = await supabase
      .from("events")
      .select("*")
      .in("contentid", eventIds)
      .order("eventstartdate", { ascending: true });

    events = data || [];
  }

  const displayName = profile?.nickname || user.email?.split("@")[0] || "사용자";

  return (
    <div className="space-y-8">
      {/* 프로필 섹션 */}
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <Avatar
          src={profile?.avatar_url}
          name={displayName}
          size="lg"
        />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {displayName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* 관심 행사 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            bookmark
          </span>
          관심 행사 ({events.length})
        </h2>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                initialIsBookmarked={true}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bookmark_border"
            title="아직 저장한 행사가 없어요"
            description="마음에 드는 행사를 북마크하면 여기서 모아볼 수 있어요"
            action={{ label: "행사 둘러보기", href: "/" }}
          />
        )}
      </div>
    </div>
  );
}
