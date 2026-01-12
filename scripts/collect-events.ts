// MUST load dotenv BEFORE any imports that use env vars
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { fetchFestivalItems, fetchDetailCommon, fetchDetailIntroFestival, fetchDetailImages } from '../lib/tour-api';
import { mapTourApiToEvent } from '../utils/mapper';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Detailed check for environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set. Please check your .env.local file.');
}
if (!supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set. Please check your .env.local file.');
}
if (!supabaseUrl || !supabaseServiceRoleKey) {
  process.exit(1);
}

// Initialize Supabase client with service role key for full access
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // No session needed for server-side script
  },
});

async function collectAndSaveEvents() {
  console.log('--- Starting TourAPI Event Collection and Saving ---');

  // --- 1. Fetch Festival Items (e.g., for the next 6 months) ---
  const today = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(today.getMonth() + 6);

  const eventStartDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
  const eventEndDate = `${sixMonthsLater.getFullYear()}${(sixMonthsLater.getMonth() + 1).toString().padStart(2, '0')}${sixMonthsLater.getDate().toString().padStart(2, '0')}`;

  console.log(`Fetching festival items from ${eventStartDate} to ${eventEndDate}...`);
  // Fetch up to 100 items for demonstration, can be paginated in real usage
  const rawFestivalItems = await fetchFestivalItems({
    eventStartDate,
    eventEndDate,
    numOfRows: 100,
    pageNo: 1,
  });

  if (rawFestivalItems.length === 0) {
    console.log('No festival items found from TourAPI.');
    return;
  }

  console.log(`Found ${rawFestivalItems.length} festival items. Processing details and saving to Supabase...`);

  let processedCount = 0;
  for (const festivalItem of rawFestivalItems) {
    try {
      const contentId = festivalItem.contentid;
      const contentTypeId = festivalItem.contenttypeid;

      // --- 2. Fetch Detailed Information in parallel ---
      const [commonDetail, introFestival, images] = await Promise.all([
        fetchDetailCommon(contentId),
        fetchDetailIntroFestival(contentId),
        fetchDetailImages(contentId),
      ]);

      // --- 3. Map TourAPI Data to Supabase Event Schema ---
      const mappedEvent = mapTourApiToEvent(
        festivalItem,
        commonDetail,
        introFestival,
        images
      );

      // --- 4. Upsert (Insert or Update) into Supabase ---
      const { data, error } = await supabase
        .from('events')
        .upsert(mappedEvent, { onConflict: 'contentid' })
        .select(); // Select the upserted data to confirm

      if (error) {
        console.error(`❌ Failed to save event ${festivalItem.title} (contentId: ${contentId}):`, error);
      } else {
        processedCount++;
        console.log(`✅ Saved/Updated event: ${data[0].title} (contentId: ${data[0].contentid})`);
      }
    } catch (e) {
      console.error(`⚠️ Error processing event ${festivalItem.title} (contentId: ${festivalItem.contentid}):`, e);
    }
  }

  console.log(`--- Finished: Successfully processed ${processedCount} out of ${rawFestivalItems.length} events ---`);
}

collectAndSaveEvents().catch(console.error);
