# 🗄️ Aroom Supabase Database

This directory contains the official Supabase database configuration, schema migrations, RLS policies, and seed data for the **Aroom Campus Accommodation Platform**.

---

## 📁 Directory Structure

```
supabase/
├── config.toml                 # Supabase CLI project configuration
├── seed.sql                    # Initial seed data (UNILAG pilot campus, verified agents, listings)
├── migrations/
│   ├── 20261009000001_initial_schema.sql    # Core tables, enums, indexes, foreign keys
│   ├── 20261009000002_seed_pilot_unilag.sql # Pilot campus & starter listings
│   └── 20261009000003_storage_and_rls.sql   # Storage buckets & Row Level Security policies
└── README.md                   # This sync guide
```

---

## 🚀 How to Sync with Supabase (3 Easy Methods)

### Method 1: Automatic Migration Runner (Recommended & Quickest)

You can run migrations directly from the backend project using the configured Node script.

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project and navigate to **Project Settings** (`⚙️`) -> **Database**.
3. Under **Connection string**, select **URI** (or **Session Pooler**) and copy the connection string:
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. Open `backend/.env` and paste it as `DATABASE_URL` (and `DIRECT_URL`):
   ```env
   DATABASE_URL=postgresql://postgres.jwuyjtiffqizhqfeyhtx:your_password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   DIRECT_URL=postgresql://postgres.jwuyjtiffqizhqfeyhtx:your_password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
5. Test connectivity:
   ```bash
   cd backend
   npm run db:test
   ```
6. Run the migrations:
   ```bash
   npm run db:migrate
   ```

---

### Method 2: Supabase Web Dashboard (SQL Editor)

If you prefer applying the migrations via the Supabase Web UI:

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)** -> Choose your project.
2. Click on **SQL Editor** (`>_`) in the left sidebar.
3. Click **New Query**.
4. Open and copy the SQL code from each file in order, then click **Run**:
   - `supabase/migrations/20261009000001_initial_schema.sql`
   - `supabase/migrations/20261009000002_seed_pilot_unilag.sql`
   - `supabase/migrations/20261009000003_storage_and_rls.sql`
5. Go to **Table Editor** to confirm all 11 tables and sample data appear!

---

### Method 3: Supabase CLI (For Full CLI Workflow)

If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed:

1. Log in to Supabase CLI:
   ```bash
   supabase login
   ```
2. Link your local project to your remote Supabase project:
   ```bash
   supabase link --project-ref jwuyjtiffqizhqfeyhtx
   ```
3. Push all migrations to your remote database:
   ```bash
   supabase db push
   ```

---

## 📊 Database Entities Created

| Table Name | Description |
|---|---|
| `campuses` | Campus master data, institutional email domains, geographical bounding box |
| `users` | Core user identity (students, non-students, agents, admins) with phone & email |
| `student_profiles` | Student KYC, university matric, verified institutional email |
| `agent_profiles` | Agent trust tier (`gold`, `silver`, `bronze`), trust scores, response rates |
| `listings` | Off-campus property listings with pricing in Kobo, room type, status |
| `listing_media` | Media URLs, live photo verification flags, sort order |
| `inquiries` | Booking & inspection requests from WhatsApp or Web |
| `availability_reports` | Crowdsourced availability checks (`available`, `held`, `taken`) |
| `inspection_reviews` | Post-inspection reviews, star ratings, agent show-up confirmation |
| `conversation_sessions`| WhatsApp bot conversation state machine sessions |
| `audit_logs` | Immutable audit trail for trust actions, moderation, and disputes |
