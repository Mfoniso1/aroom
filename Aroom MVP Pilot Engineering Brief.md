# Aroom MVP Pilot: Engineering Brief

Technical direction for the development team. Based on the Aroom Frontend UI Pages Guide (16 screens). Prepared 29 October 2026.

## 1. Objective

We are launching a closed pilot at UNIPORT with 15-20 known agents and landlords. Real students will find rooms by messaging a WhatsApp number (via Twilio) or by using the web app. Every property is mapped once, receives a permanent ID, and from then on only its vacancy and condition change. Nothing reaches students until the Team Leader has approved it.

There are five workstreams:

- **A. MVP scope cut:** remove or defer everything the pilot does not need.
- **B. Inspection fee removal:** the fee disappears from product, copy and data.
- **C. Property / Unit / Vacancy model:** permanent IDs and duplicate prevention.
- **D. Invite-only onboarding and Team Leader approval:** the closed cohort.
- **E. Twilio WhatsApp concierge and tenant move-out declaration.**

## 2. Ground rules

1. **The server is the source of truth for money.** Fee totals and the 15% agency cap are computed and enforced in the backend. The UI only displays them.
2. **Hidden until approved.** A property or partner that the Team Leader has not approved never appears in web search, in WhatsApp results or in any public API.
3. **The LLM never writes listing facts.** The language model may only parse student intent (area, budget, room type, language). Every price, address, ID and availability shown to a student is rendered from database rows.
4. **Every state change is audit-logged:** who, what, when, previous value, new value.
5. **Ship behind feature flags** so each workstream can be enabled for the pilot independently.
6. **Performance budget:** the key student journey (search, listing, request viewing) must be usable on a slow 2G campus connection. Keep payloads small and compress images.

## 3. Workstream A: MVP scope cut

| Screen / component | Action | Notes |
| :-- | :-- | :-- |
| SplashScreen.tsx (4,200 ms) | Cut to under 1 second or remove | Slow on 2G. Keep only if needed to restore session. |
| DashboardTicker.tsx | Remove everywhere | Re-introduce only when events are real and frequent. |
| Demo Credentials Drawer on LoginPage | Delete; remove seeded demo accounts from production | Security risk. |
| /whatsapp-ai simulated chat (WhatsAppConciergePage.tsx) | Replace with a click-to-chat button | Link to the real number with a prefilled first message. |
| /signup role picker, /signup/agent, /signup/landlord | Remove public routes | Replace with a /join waitlist form that creates no account. |
| Student registration (matric/JAMB, password strength meter) | Defer | Students are identified by their WhatsApp identity. |
| Student dashboard: Room-Taken banner, bookmarks | Defer |  |
| Uploader card ratings and response rate | Hide behind a flag | Show only when there is real data. |
| Agent and Landlord dashboards, and both New Listing pages | Merge into one partner portal with a role flag | Commission is 15% for agents and 0% for landlords. |
| Automated video thumbnail extractor | Put behind a flag | Fall back to a cover photo if unreliable. |
| Admin Tab 5 (profile settings) and student sub-table | Remove | Contact details move to configuration. |
| Investor and proposal HTML files in /public | Move out of the app bundle |  |

**Keep:** HomePage, SearchPage, ListingDetailPage, MoveInCostCalculator (without inspection line), LoginPage (without demo drawer), partner portal, ApprovalStatusPage (for suspended or inactive partners), and Team Leader console Tabs 1 to 4.

## 4. Workstream B: Remove the inspection fee

The business reason is that a property is mapped and verified once and then stays listed permanently, so there is no per-student inspection to charge for or advertise.

**Tasks**

1. Remove the inspection line from MoveInCostCalculator.tsx and from the server-side total. The True Total Move-In Cost becomes Base Rent + Refundable Caution + Legal and Agreement + Utility/Compound + Agency Commission (15% agents, 0% landlords).
2. Remove every 'Inspection Fee' pill and string: SplashScreen, HomePage hero trust pill, SignUpPage role cards, ListingDetailPage, SearchPage cards, the modal heading and copy.
3. Rename InspectionScheduleModal to a viewing-request flow ('Request a viewing'). It keeps the date and time-slot selector, shows the assigned partner and sends the request. It contains no fee language.
4. Rename the CTA 'Book Free Physical Inspection' to 'Request a viewing'.
5. Replace the badge 'Team-Leader Verified' with 'Mapped and verified on \[date\]', plus 'Condition updated \[date\]' on the listing detail page.
6. Database: drop the inspection fee column and field from the fee DTOs once the web client no longer reads it. Pitch decks and proposal files are updated separately by the business team.

**Acceptance:** a text search of the repo for 'inspection fee' and the Naira-zero inspection pill returns no user-facing results. Calculator totals match the backend total for a test set of 10 listings.

## 5. Workstream C: Property / Unit / Vacancy model

Separate what is permanent from what changes. The current guide treats a listing as one object; this replaces it.

| Layer | Meaning | Change frequency |
| :-- | :-- | :-- |
| Property | The building or lodge: ID, GPS pin, landmark, owner, managers, video, condition record | Rarely |
| Unit | A room or flat inside a property, with its own ID | Rarely |
| Vacancy | A unit being open from a date at a price | Every academic cycle |

The student-facing 'listing' is a vacancy on a unit of a property. Verification belongs to the property and is inherited by every later vacancy.

**Public IDs.** Human-readable and short enough to type on WhatsApp. Property: `ARM-CHB-0142` (area code plus a per-area counter). Unit: `ARM-CHB-0142-U4`. Generate the counter inside a transaction with a row lock on a per-area counter table. Never reuse an ID. A merged property keeps its ID and redirects.

**Suggested schema (Postgres, assuming Supabase, with PostGIS and pg\_trgm extensions enabled)**

```sql
create table properties (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  area_code text not null,
  name text not null,
  landmark text,
  location geography(Point, 4326) not null,
  owner_phone text,
  verification_status text not null default 'draft',
    -- draft | pending_mapping | verified | needs_reaudit | archived
  verified_at timestamptz,
  verified_by uuid references partners(id),
  condition_status text default 'good',   -- good | minor_issues | under_repair
  condition_updated_at timestamptz,
  merged_into uuid references properties(id),
  created_by uuid references partners(id),
  created_at timestamptz default now()
);
create index on properties using gist (location);
create index on properties using gin (name gin_trgm_ops);

create table property_managers (
  property_id uuid references properties(id),
  partner_id uuid references partners(id),
  role text not null,          -- owner | manager | co_manager
  status text not null default 'active',
  primary key (property_id, partner_id)
);

create table units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  public_id text unique not null,
  unit_label text not null,    -- Room 4, Flat B
  room_type text not null      -- self_contain | single_room | shared_flat
);

create table vacancies (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id),
  status text not null,        -- upcoming | open | held | taken | closed
  available_from date not null,
  annual_rent numeric not null,
  caution_fee numeric default 0,
  legal_fee numeric default 0,
  utility_fee numeric default 0,
  agency_fee_pct numeric not null default 0 check (agency_fee_pct between 0 and 15),
  source text not null,        -- partner | tenant_declaration
  created_by uuid references partners(id),
  created_at timestamptz default now()
);
-- allow only one active (upcoming/open/held) vacancy per unit
create unique index one_active_vacancy on vacancies(unit_id)
  where status in ('upcoming','open','held');

create table condition_updates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  reported_by text not null,   -- partner | student | team_leader
  condition_status text not null,
  note text,
  media_url text,
  created_at timestamptz default now()
);
```

Also required: `audit_log`, `bookings`, `tenant_declarations` (section 9) and the WhatsApp tables (section 8). The agency cap is enforced by the database check constraint as well as by the API.

## 6. Duplicate prevention

Nigerian addresses are vague, so use layered checks rather than one rule.

**Endpoint:** `POST /properties/check-duplicates` with latitude, longitude, name and owner phone. It returns candidates when any of these match:

1. Another property within 50 metres (`ST_DWithin`).
2. Name trigram similarity above 0.4 within 300 metres.
3. The same owner phone number on a property within 300 metres.

**Create flow (partner portal, replaces Screen 12 and Screen 15 step 1)**

1. Capture GPS first. If the device pin is poor (accuracy over about 30 m), let the partner adjust it on a map.
2. Call check-duplicates. If there are candidates, show cards with photo, name and landmark: 'Already mapped near here. Is yours one of these?'
3. If the partner picks one, go to 'open a vacancy' on that property or 'request to co-manage'. If not, the partner must confirm 'new property' and the request records `reviewed_candidate_ids`.
4. The `POST /properties` endpoint rejects creation when candidates exist and the request lacks that confirmation. This must be enforced server-side.
5. The property is saved as `pending_mapping` and appears in the Team Leader queue with the candidate list attached.

**Team Leader merge tool.** A 'Merge properties' action sets `merged_into` on the duplicate, moves its units, vacancies and managers to the surviving property and writes an audit entry. Requests for a merged public ID resolve to the survivor.

**Ownership conflicts.** The first registered owner or manager keeps control. Another agent can send a co-manage request that only the owner or Team Leader can approve.

## 7. Workstream D: Invite-only onboarding and Team Leader approval

**Partner state machine:** `invited` to `active` to `suspended` (and back to `active`). There is no public self-registration. Remove `pending` and `rejected` as normal states, because the Team Leader already knows these people. The `/join` waitlist stores interest only and creates no account.

**Invite flow (Team Leader console, Tab 3, 'Register Pre-Approved Partner' as the primary action)**

1. Team Leader enters name, phone, role (agent or landlord), brand name and coverage areas. ID upload is optional for known partners.
2. The backend creates the partner as `invited`, sends a WhatsApp template with a single-use set-password link, and the partner becomes `active` on first login.
3. MVP login stays phone/email plus password. A WhatsApp one-time-code login is a later spike; do not block the pilot on it.

**Property approval (Tab 2, Verification Queue)**

- New properties and new units wait here as `pending_mapping`. The partner portal shows them as 'Awaiting Team Leader mapping', and they are excluded from search and WhatsApp results.
- The review panel shows the duplicate candidates, a map with the pin, the video and a checklist: running water, electricity, security, roof, condition note.
- 'Approve' records `verified_at`, `verified_by` and the checklist, and sets the property live.

**Suspension cascade.** Suspending a partner immediately hides every vacancy they manage and stops WhatsApp routing to them. Reinstating restores them. Both actions are audit-logged.

**Other console changes**

- Tab 3 shows per-partner quota progress (15-20 listings per month) and last activity.
- Tab 4 (WhatsApp Radar) shows unconfirmed bookings with a timer. If a partner does not confirm within the configured window, flag it and offer 'Reassign'.
- Tab 1 health indicator reads real Twilio webhook status and recent error rate.
- A new Properties tab (or section in Tab 3): search by public ID, duplicate review queue, merge action, condition-report queue.

## 8. Workstream E: Twilio WhatsApp concierge

**Setup (start immediately, it has external lead time)**

1. Create the Twilio account and a Meta Business account. Begin WhatsApp Sender registration through Twilio Self Sign-up for production.
2. Submit Content Templates for approval early (list below).
3. Use the Twilio sandbox for development in the meantime.

**Rules the code must respect**

- A student's message opens a 24-hour customer service window in which free-form replies are allowed. Outside that window only approved templates can be sent.
- Reminders, partner lead alerts and any business-initiated message are therefore templates.
- Do not assume a phone number always identifies a WhatsApp user. Twilio webhooks include a business-scoped user ID, so key the identity table on that ID and store the phone number as an optional field.

**Endpoints**

- `POST /api/twilio/whatsapp/inbound`: validate `X-Twilio-Signature`, insert the message keyed by `MessageSid` (unique, for idempotency), respond 200 immediately and process asynchronously (queue or background job).
- `POST /api/twilio/whatsapp/status`: update delivery status and error codes for each outbound message.

**Tables**

- `wa_identities` (id, wa\_user\_id, phone\_e164 nullable, role, created\_at)
- `wa_conversations` (id, identity\_id, state, context jsonb, last\_inbound\_at)
- `wa_messages` (id, twilio\_sid unique, conversation\_id, direction, body, media, status, error\_code, created\_at)

Store every inbound and outbound message. The Radar tab and debugging both depend on it.

**Conversation states**

`IDLE` to `COLLECT` (area, budget, room type) to `RESULTS` (up to 3 vacancies) to `VIEWING_REQUEST` (slot) to `CONFIRMED`. A separate branch handles `TENANT_DECLARE` (section 9). Global keywords: 'menu', 'agent' or 'human' (alerts the Team Leader), 'stop'.

**Intent parsing.** Send the message to an LLM with a strict JSON schema (area, max budget, room type, language, intent) and a deterministic fallback numbered menu if parsing fails or confidence is low. Supports English and Nigerian Pidgin. The LLM output is never shown to the student as listing content.

**Result messages** are rendered from the database: public ID, area and landmark, room type, True Total Move-In Cost, 'Mapped and verified on \[date\]', a link to the web detail page, and the partner's name.

**Booking.** 'Request viewing' creates a `bookings` row with a code such as `#ARM-4821`, the vacancy, the student identity and the slot. The assigned partner gets a template with Confirm and Decline quick-reply buttons. Handle button payloads in the inbound webhook. On confirm, the student gets a confirmation. On decline or timeout, notify the student with alternatives and flag it on the Radar tab.

**Templates to submit**

| Template | Recipient | Purpose |
| :-- | :-- | :-- |
| partner\_invite\_login | Partner | Invite with set-password link |
| partner\_new\_viewing\_request | Partner | New request, Confirm / Decline buttons |
| student\_viewing\_confirmed | Student | Confirmation with code and details |
| student\_viewing\_reminder | Student | Reminder before the viewing (requires opt-in) |
| partner\_declaration\_confirm | Partner | Confirm a tenant move-out declaration |
| partner\_availability\_reconfirm | Partner | Monthly check that availability is still accurate |

**Opt-in.** The student's first message covers replies. Ask 'Reply YES for viewing reminders' before sending any reminder template.

## 9. Tenant move-out declaration

**Flow**

1. A tenant messages 'I want to declare my room is vacating', or taps the menu option.
2. The bot asks for the property ID or searches by area and landmark, then confirms with the property photo and name.
3. The bot asks for the unit (for example Room 4) and the expected move-out date.
4. The system creates a `tenant_declarations` row as `pending_confirmation` and sends `partner_declaration_confirm` to the property's owner or manager.
5. On partner confirmation, the declaration becomes `confirmed` and a vacancy is created with status `upcoming`, `available_from` set to the move-out date and `source = tenant_declaration`. The partner can edit the price before it goes live.
6. The unit appears to students as 'Available from \[month\]'.

**Rules**

- A declaration alone never publishes anything. A partner (or the Team Leader) must confirm it.
- Unconfirmed declarations expire after 5 days, with one reminder to the partner.
- Two declarations for the same unit go to the Team Leader and publish nothing until resolved.
- A declaration can be cancelled by the tenant or partner before the move-out date.
- Remind the partner about 2 weeks before and on the move-out date to confirm the room is actually free. Only then does the vacancy become `open`.
- Rate limit per identity and log everything, since this flow is open to abuse.

**Table:** `tenant_declarations` (id, unit\_id, identity\_id, declared\_move\_out, status, confirmed\_by, confirmed\_at, expires\_at, created\_at).

## 10. Screen change map

| Screen | Change |
| :-- | :-- |
| 0 Splash | Shorten or remove. |
| 1 Homepage | Remove ticker and inspection pill. Change trust pill to 'Mapped and verified'. WhatsApp banner opens the real number. |
| 2 Search | Query vacancies of approved properties only. Add 'Available from' filter. Remove inspection language. |
| 3 Listing detail | Show the property public ID, 'Mapped and verified on', 'Condition updated', vacancy date. Request-viewing CTA. Calculator without inspection. |
| 4 WhatsApp page | Replace the simulated chat with click-to-chat. |
| 5-8 Signup screens | Remove public routes. Add /join waitlist. |
| 9 Login | Remove demo drawer. Route by role and partner status. |
| 10 Student dashboard | Defer. |
| 11 Agent dashboard | Becomes 'My properties' with units under each and an 'Open vacancy' action. |
| 12 New listing | Becomes 'Add property' (GPS, duplicate check, details, video) plus a short 'Open vacancy' form for existing units. |
| 13 Approval status | Used for suspended or inactive partners. |
| 14-15 Landlord screens | Merge with 11-12 using the role flag. |
| 16 Team Leader console | Updates described in section 7. |
| Inspection modal | Becomes the viewing-request flow. |
| Calculator | Remove the inspection line. |

## 11. Security and quality

- Row-level security on every table: partners see and edit only properties they manage; students never read unapproved data; only the Team Leader role can approve, merge or suspend.
- Validate the Twilio signature on both webhooks. Rotate secrets. Keep credentials out of the client bundle.
- Server-side authorisation on all admin routes; redirects in the client are not security.
- Uploads: type and size limits, and signed URLs for ID documents. Gov ID images are visible only to the Team Leader.
- Minimise personal data. Store phone numbers in a normalised format and avoid logging full message bodies in application logs.
- Observability: structured logs, alerting on webhook failures, and a dashboard for message delivery rate and booking funnel.
- Tests: unit tests for fee calculation and the 15% cap, integration tests for duplicate detection, webhook idempotency tests (replay the same MessageSid), and an end-to-end test of the viewing flow on the sandbox.

## 12. Milestones and acceptance criteria

**M0: Kick-off (start immediately).** Twilio and Meta onboarding, template submission, repository cleanup plan. *Done when* the sender registration is submitted and templates are in review.

**M1: Scope cut and inspection fee removal.** Workstreams A and B. *Done when* the cut items are gone from production builds, no demo accounts exist in production, and the calculator and backend totals match.

**M2: Data model and approval.** Workstreams C and D: schema migration, ID generation, duplicate check, invite-only onboarding, hidden-until-approved, Team Leader approval and merge. *Done when* a seeded duplicate property is caught in the portal, a merged ID still resolves, and suspending a partner hides their vacancies.

**M3: WhatsApp concierge on sandbox.** Search, results and viewing request with partner Confirm/Decline. *Done when* a tester completes the full flow, replayed webhooks create no duplicate bookings, and the Radar tab shows the conversation.

**M4: Production sender and pilot dry run.** Switch to the production number, enable approved templates, onboard the first partners, map a first batch of properties. *Done when* 5 internal users complete real bookings end to end.

**M5: Tenant declarations and freshness.** Section 9 plus monthly availability reconfirm and condition updates. *Done when* a confirmed declaration creates an upcoming vacancy and expires correctly when unconfirmed.

**Pilot launch:** one campus cluster first, then expand. Track conversations started, matches shown, viewing requests, confirmed viewings, rooms taken, and partner response time.

## 13. Open decisions (need an answer before M2)

1. Do landlords with multi-unit lodges register the building once with units under it? Recommended: yes.
2. Who may confirm a tenant declaration: owner only, or any manager? Recommended: any active manager.
3. Confirmation timeout for viewing requests before reassignment (suggested: a few hours during the day).
4. Is the agency fee ever lower than 15% for agents? The model supports any value from 0 to 15.
5. Do co-manage requests need the owner's approval only, or Team Leader approval too?
6. Whether to build WhatsApp one-time-code login for partners in the pilot or after it.
