"use server";

import { createClient } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

/**
 * Toggles the bookmark status for a specific event.
 * @param eventId The contentid of the event to toggle (not the internal numeric ID).
 * @returns The new bookmarked status (true if added, false if removed).
 */
export async function toggleBookmark(eventId: string) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Please sign in to bookmark events.");
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .single();

  if (existing) {
    // Remove bookmark
    const { error } = await supabase.from("bookmarks").delete().eq("id", existing.id);
    if (error) throw error;
    
    // Optional: Revalidate relevant paths if needed
    revalidatePath("/my");
    
    return { bookmarked: false };
  } else {
    // Add bookmark
    const { error } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      event_id: eventId
    });
    if (error) throw error;

    revalidatePath("/my");
    return { bookmarked: true };
  }
}

/**
 * Retrieves a list of event IDs bookmarked by the current user.
 * Useful for checking status of multiple events in a list view.
 * @returns Array of bookmarked event contentids.
 */
export async function getUserBookmarkedEventIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("event_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }

  return data.map(item => item.event_id);
}

/**
 * Checks if a specific event is bookmarked by the current user.
 * @param eventId The contentid of the event.
 */
export async function isEventBookmarked(eventId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { count, error } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }

  return (count || 0) > 0;
}
