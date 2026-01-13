import { supabase } from "./supabase"; // Import the instance instead of the function
import { Tables } from "../types/supabase";

export type Event = Tables<"events">;

/**
 * Fetches a list of events from Supabase.
 * @param {object} params - Parameters for filtering, sorting, and pagination.
 * @param {number} [params.page=1] - The page number to fetch.
 * @param {number} [params.pageSize=10] - The number of items per page.
 * @param {string} [params.sortBy='eventstartdate'] - The column to sort by.
 * @param {boolean} [params.ascending=true] - Whether to sort in ascending order.
 * @returns {Promise<Event[]>} A promise that resolves to an array of events.
 */
export async function getEvents(params?: {
  page?: number;
  pageSize?: number;
  sortBy?: keyof Event;
  ascending?: boolean;
}): Promise<Event[]> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const sortBy = params?.sortBy || "eventstartdate";
  const ascending = params?.ascending === undefined ? true : params.ascending;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error } = await supabase // Use the imported instance directly
      .from("events")
      .select("*")
      .order(sortBy, { ascending })
      .range(from, to);

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error("Unexpected error fetching events:", e);
    return [];
  }
}
