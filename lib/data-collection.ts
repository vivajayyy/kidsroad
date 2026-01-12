// lib/data-collection.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { fetchFestivalItems, fetchDetailCommon, fetchDetailIntroFestival, fetchDetailImages } from './tour-api';
import { mapTourApiToEvent } from '../utils/mapper';

// This function can be called from a script or an API route.
export async function collectAndSaveEvents() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase credentials are not set in environment variables.');
  }

  // Initialize Supabase client within the function scope
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  console.log('--- Starting TourAPI Event Collection and Saving ---');

  const today = new Date();
  const eventStartDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

  console.log(`Fetching festival items starting from ${eventStartDate}...`);
  const rawFestivalItems = await fetchFestivalItems({
    eventStartDate,
    numOfRows: 100, // Fetch up to 100 items for now
    pageNo: 1,
  });

  if (rawFestivalItems.length === 0) {
    console.log('No new festival items found from TourAPI.');
    return { success: true, message: 'No new festival items found.', processedCount: 0, totalItems: 0 };
  }

  console.log(`Found ${rawFestivalItems.length} festival items. Processing...`);

  let processedCount = 0;
  const errors: string[] = [];

  for (const festivalItem of rawFestivalItems) {
    try {
      const contentId = festivalItem.contentid;
      
      const [commonDetail, introFestival, images] = await Promise.all([
        fetchDetailCommon(contentId),
        fetchDetailIntroFestival(contentId),
        fetchDetailImages(contentId),
      ]);

      const mappedEvent = mapTourApiToEvent(
        festivalItem,
        commonDetail,
        introFestival,
        images
      );

      const { error } = await supabase
        .from('events')
        .upsert(mappedEvent, { onConflict: 'contentid' });

      if (error) {
        throw error;
      }
      processedCount++;
    } catch (e: any) {
      const errorMessage = `Error processing event ${festivalItem.title} (contentId: ${festivalItem.contentid}): ${e.message}`;
      console.error(`⚠️ ${errorMessage}`);
      errors.push(errorMessage);
    }
  }

  const resultMessage = `Successfully processed ${processedCount} out of ${rawFestivalItems.length} events.`;
  console.log(`--- Finished: ${resultMessage} ---`);
  
  return {
    success: errors.length === 0,
    message: resultMessage,
    processedCount,
    totalItems: rawFestivalItems.length,
    errors,
  };
}
