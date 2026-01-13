// lib/data-collection.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";
import {
  fetchFestivalItems,
  fetchDetailCommon,
  fetchDetailIntroFestival,
  fetchDetailImages,
} from "./tour-api";
import { mapTourApiToEvent } from "../utils/mapper";
import { enrichEventData } from "./data-enrichment";
import { generateTags } from "./tag-generator";
import pLimit from "p-limit";

// This function can be called from a script or an API route.
export async function collectAndSaveEvents() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase credentials are not set in environment variables."
    );
  }

  // Initialize Supabase client within the function scope
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  console.log("--- Starting TourAPI Event Collection and Saving ---");

  const today = new Date();
  const eventStartDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;

  console.log(`Fetching festival items starting from ${eventStartDate}...`);
  const rawFestivalItems = await fetchFestivalItems({
    eventStartDate,
    numOfRows: 100, // Fetch up to 100 items for now
    pageNo: 1,
  });

  if (rawFestivalItems.length === 0) {
    console.log("No new festival items found from TourAPI.");
    return {
      success: true,
      message: "No new festival items found.",
      processedCount: 0,
      totalItems: 0,
    };
  }

  console.log(`Found ${rawFestivalItems.length} festival items. Processing...`);

  let processedCount = 0;
  let enrichedCount = 0;
  const errors: string[] = [];

  // Limit concurrency to avoid overwhelming APIs
  const limit = pLimit(3); // Process 3 events concurrently max

  const results = await Promise.allSettled(
    rawFestivalItems.map((festivalItem) =>
      limit(async () => {
        try {
          const contentId = festivalItem.contentid;

          // Fetch details from TourAPI
          const [commonDetail, introFestival, images] = await Promise.all([
            fetchDetailCommon(contentId),
            fetchDetailIntroFestival(contentId),
            fetchDetailImages(contentId),
          ]);

          // Map TourAPI data to event schema
          const mappedEvent = mapTourApiToEvent(
            festivalItem,
            commonDetail,
            introFestival,
            images
          );

          // Enrich with blog data (non-blocking, graceful degradation)
          let finalEvent = mappedEvent;
          let wasEnriched = false;

          try {
            console.log(`[Collection] Enriching: ${mappedEvent.title}`);
            const { enrichedEvent, metadata } = await enrichEventData(
              mappedEvent,
              {
                maxBlogSearch: 10,
                maxBlogCrawl: 5,
                minConfidence: 0.5,
              }
            );

            if (metadata) {
              finalEvent = enrichedEvent;
              wasEnriched = true;
              console.log(`[Collection] ✅ Enriched: ${mappedEvent.title}`);
            }
          } catch (enrichError) {
            console.warn(
              `[Collection] ⚠️ Enrichment failed for ${mappedEvent.title}, using TourAPI data only:`,
              enrichError
            );
            // Continue with un-enriched data
          }

          // Generate tags
          const tags = generateTags(
            finalEvent.category,
            finalEvent.title,
            finalEvent.description,
            finalEvent.age_ranges
          );

          finalEvent = {
            ...finalEvent,
            tags,
          };

          // Upsert to Supabase
          const { error } = await supabase
            .from("events")
            .upsert(finalEvent, { onConflict: "contentid" });

          if (error) {
            throw error;
          }

          return { success: true, wasEnriched, title: festivalItem.title };
        } catch (e: any) {
          const errorMessage = `Error processing event ${festivalItem.title} (contentId: ${festivalItem.contentid}): ${e.message}`;
          console.error(`⚠️ ${errorMessage}`);
          throw new Error(errorMessage);
        }
      })
    )
  );

  // Count successes and enrichments
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      processedCount++;
      if (result.value.wasEnriched) {
        enrichedCount++;
      }
    } else {
      errors.push(result.reason.message);
    }
  });

  const resultMessage = `Successfully processed ${processedCount} out of ${rawFestivalItems.length} events. Enriched: ${enrichedCount}`;
  console.log(`--- Finished: ${resultMessage} ---`);
  console.log(
    `📊 Stats: ${processedCount} processed, ${enrichedCount} enriched with blog data`
  );

  return {
    success: errors.length === 0,
    message: resultMessage,
    processedCount,
    enrichedCount,
    totalItems: rawFestivalItems.length,
    errors,
  };
}
