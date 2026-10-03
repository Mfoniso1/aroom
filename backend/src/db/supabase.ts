// ==============================================================================
// Aroom: Supabase Database & Client Configuration
// Supports direct PostgreSQL connection pooling + Supabase JS SDK
// ==============================================================================

import pg from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

const { Pool } = pg;

// 1. PostgreSQL Connection Pool (for direct SQL queries and migrations)
const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Execute raw SQL query against Supabase PostgreSQL
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('[Supabase SQL]', { text, duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
}

// 2. Supabase SDK Client (for Storage, Auth, Realtime)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string; timestamp?: string }> {
  if (!databaseUrl) {
    return {
      connected: false,
      message: 'DATABASE_URL is not set in environment or .env file.',
    };
  }

  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version();');
    return {
      connected: true,
      message: `Successfully connected to Supabase database "${res.rows[0].db_name}".`,
      timestamp: res.rows[0].current_time,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Connection failed: ${err.message}`,
    };
  }
}
