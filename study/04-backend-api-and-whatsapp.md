# 04 — The Backend API & WhatsApp Bot (`backend/`)

## 1. What is a REST API?

An **API** (Application Programming Interface) is like a menu at a restaurant. It is a list of exact endpoints that frontends (or WhatsApp bots) can call to ask for information or send new data.

### Standard HTTP Methods:
- **`GET`** — Retrieve data (e.g. `GET /api/v1/listings` -> "Give me the listings").
- **`POST`** — Create new data (e.g. `POST /api/v1/listings` -> "Add a new room").
- **`PATCH`** — Update a specific field (e.g. `PATCH /api/v1/listings/123/status` -> "Change status to held").
- **`DELETE`** — Remove data.

---

## 2. Directory Structure of `backend/`

```
backend/
├── scripts/
│   ├── migrate.ts        # Database migration runner script
│   └── test-db.ts        # Fast connection test to Supabase
├── src/
│   ├── server.ts         # Entry point: starts the web server on Port 5000
│   ├── app.ts            # Configures Express routes and middleware
│   ├── api/
│   │   ├── routes/       # Express URL endpoint handlers
│   │   ├── dtos/         # Zod data validation schemas
│   │   └── middleware/   # Error handling & authentication checks
│   ├── db/
│   │   ├── store.ts      # Fast in-memory database store (for local mock dev)
│   │   └── supabase.ts   # Real PostgreSQL connection pool & Supabase client
│   └── domain/
│       ├── entities/     # TypeScript interfaces and types
│       └── services/     # Core business rules (Listing, Inquiry, Trust, Identity)
└── test/
    └── api.test.ts       # 11-step automated integration test suite
```

---

## 3. Key Backend Files Explained

### File 1: `src/server.ts` & `src/app.ts` (The Front Door)
- **`server.ts`:** Reads the `PORT` from `.env` (defaults to 5000) and calls `app.listen(PORT)`. It prints the server startup banner.
- **`app.ts`:** Instantiates Express. It mounts:
  - `cors()`: Allows the frontend running on `http://localhost:5173` to safely communicate with this backend on `http://localhost:5000`.
  - `express.json()`: Automatically parses incoming JSON body payloads.
  - Mounts routes under `/api/v1/...`.

### File 2: `src/domain/services/` (Clean Architecture & Business Logic)
Instead of putting all your database code directly inside the route files, Aroom follows **Clean Architecture**. The logic lives inside dedicated services:

1. **`listing.service.ts`:** Handles multi-parameter filtering (budget range, room type, campus), creates new listings (tagging them as `unverified_new`), and handles single-tap status toggling (`available` ↔ `held` ↔ `taken`).
2. **`inquiry.service.ts`:** Shared between the website and the WhatsApp bot! When a student requests an inspection, this service creates the lead and automatically transitions the listing to `held` so nobody else double-books it.
3. **`trust.service.ts`:** Calculates agent reputation scores (0-100) based on response rate and successful deals. It also processes crowdsourced reports: if a student visits a property and reports it's taken, the system automatically marks the listing taken.
4. **`identity.service.ts`:** Validates student email domains (e.g. checks if email ends with `@live.unilag.edu.ng` for automatic student verification).

### File 3: `src/api/routes/webhook.routes.ts` (WhatsApp AI Triage)
Aroom includes a conversational triage bot designed for Meta's WhatsApp Cloud API:

```
[ Student WhatsApp ]  --->  [ Meta WhatsApp Cloud ]  --->  [ POST /api/v1/webhook ]
                                                                     │
                                                         Conversation State Machine:
                                                         1. START
                                                         2. AWAIT_CAMPUS
                                                         3. AWAIT_BUDGET
                                                         4. SHOW_LISTINGS
                                                         5. BOOK_INSPECTION
```

- **Webhook Verification (`GET /webhook`):** Meta sends a challenge query param (`hub.challenge`) and verify token to ensure this server belongs to Aroom.
- **Message Ingestion (`POST /webhook`):** When a student messages, the state machine reads their message, checks previous conversation state in `conversation_sessions`, extracts their budget and campus, queries `listingService.searchListings()`, and replies with 2-3 verified rooms!

### File 4: `test/api.test.ts` (Automated Quality Assurance)
How do we know the backend actually works without manually clicking 100 buttons?
- We have an automated test suite with **11 end-to-end integration tests**:
  - Tests health check, campus loading, room search, unverified listing creation, single-tap availability toggle, student email verification, lead creation in agent queue, post-inspection survey, and WhatsApp webhook.
- You can run it anytime with:
  ```bash
  cd backend
  npm test
  ```

---

### ⏭️ Next Step:
Proceed to **[05-frontend-aroom-web.md](./05-frontend-aroom-web.md)** to see how the React frontend renders these listings and our new Move-In Cost Calculator!
