// ==============================================================================
// Aroom: Supabase Database Migration Runner
// Applies 001_initial_schema.sql and 002_seed_pilot_unilag.sql to Supabase
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\n❌ ERROR: Neither DIRECT_URL nor DATABASE_URL is set in your .env file.');
  console.error('Please configure your Supabase connection string in backend/.env before running migrations.\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  const client = await pool.connect();
  console.log('\n🚀 Connected to Supabase PostgreSQL database...');

  try {
    const migrationsDir = path.resolve(__dirname, '../migrations');

    // 1. Initial Schema
    const schemaFile = path.join(migrationsDir, '001_initial_schema.sql');
    console.log(`📄 Executing migration: 001_initial_schema.sql...`);
    const schemaSql = fs.readFileSync(schemaFile, 'utf8');
    await client.query(schemaSql);
    console.log(`✔ Schema created successfully (Enums, Tables, Indexes).`);

    // 2. Pilot UNILAG Seed Data
    const seedFile = path.join(migrationsDir, '002_seed_pilot_unilag.sql');
    console.log(`🌱 Executing seed script: 002_seed_pilot_unilag.sql...`);
    const seedSql = fs.readFileSync(seedFile, 'utf8');
    await client.query(seedSql);
    console.log(`✔ UNILAG pilot data seeded successfully.`);

    // 3. Verify Table Counts
    console.log('\n📊 Verifying Supabase Tables:');
    const tableQueries = [
      { name: 'campuses', query: 'SELECT COUNT(*) FROM campuses;' },
      { name: 'users', query: 'SELECT COUNT(*) FROM users;' },
      { name: 'student_profiles', query: 'SELECT COUNT(*) FROM student_profiles;' },
      { name: 'agent_profiles', query: 'SELECT COUNT(*) FROM agent_profiles;' },
      { name: 'listings', query: 'SELECT COUNT(*) FROM listings;' },
      { name: 'listing_media', query: 'SELECT COUNT(*) FROM listing_media;' },
    ];

    for (const t of tableQueries) {
      const res = await client.query(t.query);
      console.log(`   - ${t.name.padEnd(20)}: ${res.rows[0].count} records`);
    }

    console.log('\n✨ Database migration and pilot seeding completed successfully!\n');
  } catch (err: any) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
