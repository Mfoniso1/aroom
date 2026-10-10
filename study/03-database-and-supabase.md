# 03 — The Database & Supabase Layer (`supabase/`)

## 1. Database Basics for Beginners

A **database** is an organized, persistent filing cabinet for your application. Unlike variables in code which disappear as soon as you turn off your server, a database saves data permanently to a hard drive in the cloud.

### Core Database Terms:
- **Table:** Like a spreadsheet tab (e.g. `listings`, `users`).
- **Column / Field:** The attributes of that spreadsheet (e.g. `title`, `price_annual_kobo`, `phone_number`).
- **Row / Record:** One specific item in the table (e.g. a specific room in Akoka).
- **Primary Key (`id`):** A unique identifier so no two items get mixed up.
- **Foreign Key (`REFERENCES ...`):** A link connecting one table to another. For example, every row in `listings` has an `agent_id` that points directly to a row in `agent_profiles`.

---

## 2. Why Do We Use UUIDs Instead of Simple Numbers (1, 2, 3)?

In small tutorial apps, people often use IDs like `1, 2, 3`. But in a real marketplace:
1. **Security / Guessing:** If listing URL is `/listings/42`, a hacker can easily write a script to scrape `/listings/43`, `/listings/44`.
2. **Distributed generation:** With a **UUID** (Universally Unique Identifier), computers can generate random, unique IDs independently without checking a central counter first.

### ⚠️ The Hexadecimal Rule (A Real Lesson We Encountered!)
A UUID is a **128-bit hexadecimal number**, written as 32 hex digits separated by hyphens (e.g. `c1111111-1111-1111-1111-111111111111`).
- Hexadecimal only allows characters: `0-9` and `a-f`.
- Letters like `g`, `s`, `u`, `z` are **not valid hex**. Trying to use `u1111111...` causes PostgreSQL to throw:
  `ERROR: 22P02: invalid input syntax for type uuid`.
- That's why in our seed scripts we use valid hex letters:
  - `c...` for campuses (`c` is hex 12)
  - `a...` for agent profiles (`a` is hex 10)
  - `d...` for users (`d` is hex 13)
  - `b...` for student profiles (`b` is hex 11)
  - `f...` for listings (`f` is hex 15)

---

## 3. Why Prices Are Stored in Kobo (`BIGINT price_annual_kobo`)

You will notice this column in `listings`:
```sql
price_annual_kobo BIGINT NOT NULL
```
- In Nigeria, 1 Naira = 100 Kobo.
- For a room that costs **₦350,000/year**, we store **`35000000`** kobo in the database!
- **Why?** In computer science, decimal numbers (like `350000.50` or floats) suffer from binary rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). By storing money as whole integers in the smallest currency unit (Kobo or cents), you never lose a single fraction of a Naira in calculations.

---

## 4. Breakdown of Files in `supabase/`

### File A: `supabase/config.toml`
- **What is it?** The configuration settings for the local Supabase environment.
- **Key Settings:** Defines local ports (API on `54321`, Database on `54322`, Studio UI on `54323`), authentication settings, and max storage limits (50 MB).

### File B: `supabase/migrations/20261009000001_initial_schema.sql`
- **What is it?** The blueprint that creates our database structure from scratch.
- **What are Migrations?** Like version control (Git) for database structures. Instead of manually clicking buttons in a dashboard, migrations are written in SQL files with timestamp names so every developer and production server runs the exact same tables in order.
- **What does it create?**
  1. **Custom ENUMs:** Strict dropdown lists for status values (e.g. `availability_status_enum` can only be `'available'`, `'held'`, or `'taken'`).
  2. **11 Core Tables:**
     - `campuses`: Campus name, boundary coordinates, official email domains (e.g. `@unilag.edu.ng`).
     - `users`: Core login, phone number, user type (`student`, `agent`, `admin`).
     - `student_profiles`: Student matric number, verification status.
     - `agent_profiles`: Agency name, trust tier (`gold`, `silver`, `bronze`), trust score (0-100), response rates.
     - `listings`: Title, description, room type, price in Kobo, landmark, status.
     - `listing_media`: Photos of the property, including an `is_live_upload` flag.
     - `inquiries`: Inspection booking requests sent by students to agents.
     - `availability_reports`: Reports from students visiting rooms to flag if they are already taken.
     - `inspection_reviews`: Star ratings (1 to 5), was the property as described, did the agent show up?
     - `conversation_sessions`: State machine session memory for the WhatsApp bot.
     - `audit_logs`: An immutable log of important actions for security and fraud prevention.
  3. **Indexes:** Fast search shortcuts (like an index at the back of a textbook) so students can search thousands of rooms in milliseconds.

### File C: `supabase/migrations/20261009000002_seed_pilot_unilag.sql` & `supabase/seed.sql`
- **What is it?** Initial sample data ("seed" data).
- **Why do we need it?** When you first set up the app, an empty database makes it look broken. This file inserts:
  - University of Lagos (UNILAG) campus info.
  - 2 verified agents: *Femi Ogundipe* (Gold Tier, 98% response) and *Chinedu Eze* (Silver Tier).
  - 1 verified student: *C. Okeke* (`@live.unilag.edu.ng`).
  - 3 initial listings (1 verified in Akoka, 1 new unverified in Abule Oja, 1 held flat in Onike).

### File D: `supabase/migrations/20261009000003_storage_and_rls.sql`
- **What is it?** Cloud file storage and security rules.
- **1. Storage Buckets:** Creates folders in Supabase Cloud Storage to store binary image files:
  - `listing-images`: Public bucket so anyone can see property photos.
  - `agent-id-cards` & `student-ids`: Private buckets for KYC identity documents.
- **2. Row Level Security (RLS):**
  - In traditional databases, if someone can connect, they can see everything.
  - With RLS enabled, PostgreSQL enforces rules per row:
    - *Anyone* can read available listings and campuses.
    - An agent can only edit *their own* listings (`WHERE user_id = auth.uid()`).
    - A student can only see *their own* inspection inquiry records.

---

### ⏭️ Next Step:
Proceed to **[04-backend-api-and-whatsapp.md](./04-backend-api-and-whatsapp.md)** to see how the backend server processes data and connects to WhatsApp!
