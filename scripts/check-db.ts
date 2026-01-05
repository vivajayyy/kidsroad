// Check database - SELECT only (works with anon key)
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('📊 Checking events table...\n');

  // 1. Count all events
  console.log('1. Total events count:');
  const { count, error: countError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Count failed:', countError);
  } else {
    console.log(`✅ Total events: ${count}\n`);
  }

  // 2. List all events
  console.log('2. All events:');
  const { data: allEvents, error: allError } = await supabase
    .from('events')
    .select('contentid, title, eventstartdate, eventenddate, age_ranges, category')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Query failed:', allError);
  } else {
    console.table(allEvents);
    console.log('');
  }

  // 3. Test age_ranges filter
  if (allEvents && allEvents.length > 0) {
    console.log('3. Testing age_ranges filter (3-5):');
    const { data: ageFiltered, error: ageError } = await supabase
      .from('events')
      .select('contentid, title, age_ranges')
      .contains('age_ranges', ['3-5']);

    if (ageError) {
      console.error('❌ Age filter failed:', ageError);
    } else {
      console.log(`✅ Found ${ageFiltered.length} events for age 3-5:`);
      console.table(ageFiltered);
      console.log('');
    }
  }

  // 4. Test checklist filters
  if (allEvents && allEvents.length > 0) {
    console.log('4. Testing checklist filters (free + parking):');
    const { data: checklistData, error: checklistError } = await supabase
      .from('events')
      .select('contentid, title, is_free, has_parking')
      .eq('is_free', true)
      .eq('has_parking', true);

    if (checklistError) {
      console.error('❌ Checklist filter failed:', checklistError);
    } else {
      console.log(`✅ Found ${checklistData.length} free events with parking:`);
      console.table(checklistData);
    }
  }

  console.log('\n🎉 Database check complete!');
}

checkDatabase().catch(console.error);
