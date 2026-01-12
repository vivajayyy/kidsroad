// MUST load dotenv BEFORE any imports that use env vars
import { config } from 'dotenv';
config({ path: '.env.local' });

import { collectAndSaveEvents } from '../lib/data-collection';

// This script is for manually triggering the data collection process.
async function run() {
  console.log('Manually starting data collection process...');
  await collectAndSaveEvents();
  console.log('Manual run finished.');
}

run();

