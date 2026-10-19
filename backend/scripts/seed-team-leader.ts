// ==============================================================================
// Aroom: Set the Team Leader's password on Supabase (run once after migrating)
//   TEAM_LEADER_PASSWORD='a-strong-password' TEAM_LEADER_PHONE='+234...' npm run seed:team-leader
// ==============================================================================

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const password = process.env.TEAM_LEADER_PASSWORD;
const phone = process.env.TEAM_LEADER_PHONE;

if (!connectionString) {
  console.error('DIRECT_URL / DATABASE_URL is not set in backend/.env');
  process.exit(1);
}
if (!password || password.length < 10) {
  console.error('Set TEAM_LEADER_PASSWORD (at least 10 characters) before running this script.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  const hash = await bcrypt.hash(password, 10);
  const res = await pool.query(
    `UPDATE users
        SET password_hash = $1,
            phone_number = COALESCE($2, phone_number),
            updated_at = NOW()
      WHERE id = 'e0000000-0000-0000-0000-000000000001' AND user_type = 'admin'
      RETURNING phone_number`,
    [hash, phone || null]
  );
  if (res.rowCount === 0) {
    console.error('Team Leader row not found. Run `npm run db:migrate` first.');
    process.exit(1);
  }
  console.log(`Team Leader password set. Log in with phone ${res.rows[0].phone_number}.`);
} finally {
  await pool.end();
}

