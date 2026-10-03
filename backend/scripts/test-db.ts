// ==============================================================================
// Aroom: Supabase Connectivity Test Utility
// ==============================================================================

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { testSupabaseConnection, pool } from '../src/db/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('\n🔍 Testing Supabase Database Connection...\n');
  const result = await testSupabaseConnection();

  if (result.connected) {
    console.log(`\x1b[32m✔ ${result.message}\x1b[0m`);
    console.log(`Server Timestamp: ${result.timestamp}`);

    // Query list of user tables in public schema
    try {
      const tablesRes = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      console.log(`\nExisting public tables (${tablesRes.rowCount}):`);
      tablesRes.rows.forEach((r) => console.log(` - ${r.table_name}`));
    } catch (e: any) {
      console.log('Could not fetch table list:', e.message);
    }
  } else {
    console.log(`\x1b[31m❌ Connection Test Failed:\x1b[0m ${result.message}`);
    console.log('\nTo fix this:');
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Go to Project Settings -> Database -> Connection String (URI)');
    console.log('3. Copy the URI and paste it as DATABASE_URL in backend/.env');
  }

  await pool.end();
  console.log('\n');
}

main();
