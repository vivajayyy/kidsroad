const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function executeSQLFile(client, filePath) {
  console.log(`\n🔄 Applying: ${path.basename(filePath)}...`);

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    await client.query(sql);
    console.log(`✅ ${path.basename(filePath)} applied successfully!`);
  } catch (error) {
    console.error(`❌ Error applying ${path.basename(filePath)}:`);
    console.error(error.message);
    throw error;
  }
}

async function main() {
  const connectionString = `postgresql://postgres.pajxzcnddwnknhbddbws:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');

    const migrations = [
      path.join(__dirname, '../supabase/migrations/20260121_fix_security_issues.sql'),
      path.join(__dirname, '../supabase/migrations/20260121_optimize_rls_performance.sql')
    ];

    for (const migration of migrations) {
      await executeSQLFile(client, migration);
    }

    console.log('\n🎉 All migrations applied successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from Supabase');
  }
}

main();
