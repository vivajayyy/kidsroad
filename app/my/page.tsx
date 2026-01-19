import { createClient } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import EventCard from "@/components/EventCard";
import { Event } from "@/lib/events";
import Link from "next/link";

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

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-2xl overflow-hidden">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.nickname || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sage-600 font-bold">
              {profile?.nickname?.[0] || user.email?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile?.nickname || user.email?.split("@")[0]}
          </h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Bookmarks Section */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            bookmark
          </span>
          관심 행사 ({events.length})
        </h2>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                initialIsBookmarked={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
              bookmark_border
            </span>
            <p className="text-gray-500">아직 저장한 행사가 없습니다.</p>
            <Link
              href="/"
              className="text-primary hover:underline mt-2 inline-block"
            >
              행사 둘러보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
