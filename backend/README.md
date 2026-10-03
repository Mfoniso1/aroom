# Aroom Backend API & Database Service

Production-ready backend API service and database design for **Aroom (Campus Accommodation Platform with WhatsApp AI Triage)**, built according to [`Aroombrief.md`](../Aroombrief.md) and [`Aroom_Technical_Implementation_Plan.md`](../Aroom_Technical_Implementation_Plan.md).

---

## 1. Architectural Highlights & Invariants

1. **Decoupled Visibility vs. Verification**:
   - When an agent creates a listing via `POST /api/v1/listings`, it immediately goes live as `unverified_new`.
   - The agent faces zero listing friction, while students are presented with clear trust badges (`Verified` vs `Unverified - New` with anti-fraud tooltips).
2. **Unified Shared Domain Service**:
   - The WhatsApp AI Bot and the Web Dashboard execute the **exact same domain classes**:
     - `ListingService`: Multi-factor search, availability transitions, live badge upgrades.
     - `InquiryService`: Lead creation, inspection booking, agent lead qualification.
     - `TrustService`: Crowdsourced reports, dispute queues, agent trust scoring.
     - `IdentityService`: Student institutional email matching (`@live.unilag.edu.ng`) and agent OTP.
3. **Agent Protection Against Time-Wasters**:
   - Every inquiry submitted through Web or WhatsApp must originate from a verified student (or verified user). Agents receive qualified leads marked with institutional verification badges.
4. **24-Hour Availability Sentinel**:
   - Post-inspection feedback directly audits property availability. If a student reports a room is taken or paid for, the listing status is automatically updated to `taken` or `held`, protecting other students from paying inspection fees on unavailable rooms.

---

## 2. Directory Structure

```
backend/
├── migrations/
│   ├── 001_initial_schema.sql         # PostgreSQL schema DDL (Tables, Enums, Indexes)
│   └── 002_seed_pilot_unilag.sql      # UNILAG pilot campus, agents, students & listings
├── src/
│   ├── api/
│   │   ├── dtos/schemas.ts            # Type-safe Zod request validation schemas
│   │   ├── middleware/                # Error handling & authentication middleware
│   │   └── routes/
│   │       ├── auth.routes.ts         # Agent OTP & Student university domain signup
│   │       ├── campus.routes.ts       # Pilot campuses & landmark boundaries
│   │       ├── listing.routes.ts      # Search, detail, create, and status toggle
│   │       ├── inquiry.routes.ts      # Inspection booking & agent lead queue
│   │       ├── report.routes.ts       # Crowdsourced availability reports & disputes
│   │       └── webhook.routes.ts      # Meta WhatsApp Cloud API webhook receiver
│   ├── db/
│   │   └── store.ts                   # In-memory relational store with seed data
│   ├── domain/
│   │   ├── entities/types.ts          # Core domain models and entity interfaces
│   │   └── services/
│   │       ├── identity.service.ts    # User & student verification logic
│   │       ├── inquiry.service.ts     # Inspection & inquiry domain logic
│   │       ├── listing.service.ts     # Search & availability state machine
│   │       └── trust.service.ts       # Trust scoring & crowdsourced audits
│   ├── app.ts                         # Express application factory
│   └── server.ts                      # Server entrypoint
├── test/
│   └── api.test.ts                    # 11-step end-to-end integration test suite
├── package.json
└── tsconfig.json
```

---

## 3. Connecting to Supabase

The backend connects directly to Supabase PostgreSQL using connection pooling and the Supabase JavaScript SDK.

### Step 1: Add Credentials to `backend/.env`
Get your database connection string and API keys from your [Supabase Dashboard](https://supabase.com/dashboard):
* **Database URI**: `Project Settings -> Database -> Connection String -> URI`
* **API Keys**: `Project Settings -> API`

Edit [`backend/.env`](file:///c:/Users/RV/Desktop/Aroom/backend/.env):
```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Step 2: Test the Connection
Run the connection diagnostic:
```bash
npm run db:test
```

### Step 3: Run Database Migrations on Supabase
Automatically create all tables, enums, composite indexes, and seed UNILAG pilot listings:
```bash
npm run db:migrate
```

---

## 4. Getting Started

### Prerequisites
- Node.js v20+ (tested with v24.21.0)
- npm v10+

### Running the Tests
To execute the comprehensive 11-step end-to-end test suite:
```bash
npm test
```

### Running the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### Production Build
```bash
npm run build
npm start
```

---

## 4. REST API Documentation

### Base URL: `http://localhost:5000/api/v1`

#### Campuses
* **`GET /campuses`**: List supported institutions (UNILAG), landmarks (Akoka Gate, Abule Oja, Onike), and institutional email domains.

#### Listings
* **`GET /listings/search`**: Search listings.
  - Query parameters:
    - `campus_code` (e.g. `UNILAG`)
    - `max_budget` (e.g. `350000`)
    - `min_budget` (e.g. `150000`)
    - `room_type` (`self_contain`, `single_room`, `flat_shared`, `flat_entire`)
    - `only_verified` (`true` / `false`)
    - `status` (`available`, `held`, `taken`)
* **`GET /listings/:id`**: Single listing detail with photos and agent trust factor.
* **`POST /listings`**: Agent creates listing. Default status is `unverified_new`.
* **`PATCH /listings/:id/status`**: Fast toggle between `available`, `held`, and `taken`.
* **`POST /listings/:id/request-verification`**: Request physical spot-check badge upgrade.

#### Inquiries & Inspections
* **`POST /inquiries`**: Create an inspection booking lead (called by Web and WhatsApp bot).
* **`GET /inquiries/agent-queue`**: Agent view of qualified incoming student leads.
* **`PATCH /inquiries/:id/status`**: Accept, schedule, complete, or report no-show.
* **`POST /inquiries/feedback`**: Post-inspection survey. Captures star rating and crowdsources whether the room is still available.

#### Onboarding & Trust
* **`POST /auth/agent/signup`**: Agent registers with phone number and ID photo.
* **`POST /auth/agent/verify-otp`**: Verifies agent phone via OTP.
* **`POST /auth/student/signup`**: Auto-verifies student if email matches institutional domain (e.g. `@live.unilag.edu.ng`).
* **`POST /reports/availability`**: Report a listing as taken or occupied.
* **`GET /reports/queue`**: Moderator dispute queue.

#### WhatsApp Integration
* **`GET /webhooks/whatsapp`**: Meta webhook challenge verification (`hub.challenge`).
* **`POST /webhooks/whatsapp`**: Inbound webhook receiver with deduplication and state machine dispatch.
