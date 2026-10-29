# Engineering Specification: Aroom WhatsApp AI Concierge (UNIPORT MVP Readiness)

**To:** Lead Full-Stack / Frontend Developer

**From:** Software Engineering Lead

**Date:** October 29, 2026

**Target Modules:**

* `aroom-web/src/lib/whatsappAiConcierge.ts`

* `aroom-web/src/features/marketplace/pages/WhatsAppConciergePage.tsx`

* `aroom-web/src/lib/listingsStore.ts`

* `aroom-web/src/lib/pilotAuthStore.ts`

* `supabase/functions/whatsapp-ai-webhook/index.ts`

## 1. Objective

Great job on the initial architecture of the WhatsApp AI Concierge—the Triple-Tier fallback engine, TwiML builder, and responsive dual-pane UI are rock solid.

However, before we push this live to UNIPORT students in Choba and Alakahia, we need to close **7 critical operational and technical edge cases** that will break user trust in production. Please implement the tasks below in order of priority (**P0** $\rightarrow$ **P2**).

## 2. P0 Tasks: Must-Ship Before Student Pilot

### Task 2.1: Fix `parseMaxBudget` Regex Collision (`whatsappAiConcierge.ts`)

**The Bug:**

Currently, `parseMaxBudget` parses numeric tokens aggressively. If a student types *"Show me #1 for 1 year"* or *"Book David at 2pm"*, loose number matching can misinterpret `1` or `2` or room codes as budget constraints or fail when combined with budget numbers.

**What to Implement:**

1. Strip out all house reference codes (`#\d+`), agent codes (`A\d+`), time strings (`\d{1,2}\s*(?:am|pm)`), and duration strings (`\d+\s*(?:year|yr|month)s?`) **before** running budget extraction.

2. Enforce a minimum realistic floor for Nigerian annual student rent (`>= 50000`).

```
// aroom-web/src/lib/whatsappAiConcierge.ts

export function parseMaxBudget(rawMessage: string): number | null {
  // 1. Strip house codes (#1), agent codes (A1), times (2pm), and durations (1 year)
  const sanitized = rawMessage
    .toLowerCase()
    .replace(/#\d+/g, '')
    .replace(/\ba\d+\b/g, '')
    .replace(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/g, '')
    .replace(/\b\d+\s*(?:year|yr|month|day|week)s?\b/g, '');

  // 2. Match explicit 'k' notation first (e.g., "250k", "₦180k", "250.5k")
  const kMatch = sanitized.match(/(?:₦|ngn|\b)\s*(\d{2,4}(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    const val = Math.round(parseFloat(kMatch[1]) * 1000);
    return val >= 50000 ? val : null;
  }

  // 3. Match full numbers >= 50,000 (e.g., "250,000", "250000")
  const fullMatch = sanitized.match(/(?:₦|ngn|\b)\s*(\d{2,3}(?:,\d{3})+|\d{5,7})\b/i);
  if (fullMatch) {
    const val = parseInt(fullMatch[1].replace(/,/g, ''), 10);
    return val >= 50000 ? val : null;
  }

  return null;
}

```

### Task 2.2: Two-Step Booking State Machine (`pending_agent` $\rightarrow$ `confirmed`)

**The Bug:**

`createWhatsAppAgentBooking()` immediately sets booking status to `'confirmed'`. In reality, if a student books an inspection for tomorrow at 2:00 PM and the agent hasn't confirmed availability, the student will get stranded at the campus gate.

**What to Implement:**

1. **Update Booking Status Type (`whatsappAiConcierge.ts` & Supabase `whatsapp_bookings`):**

   ```
   export type InspectionBookingStatus =
     | 'pending_agent'      // Default when student creates booking
     | 'confirmed'          // Agent or Team Leader confirmed slot
     | 'reschedule_needed'  // Agent proposed a different time
     | 'completed'          // Walkthrough happened
     | 'reported_issue'     // Student reported no-show or fee extortion
     | 'cancelled';
   
   export interface WhatsAppInspectionBooking {
     id: string;
     referenceCode: string; // e.g., #ARM-4821
     studentName: string;
     studentPhone: string;
     agentId: string;
     agentName: string;
     agentPhone: string;
     houseId: string;
     houseTitle: string;
     meetupLandmark: string; // REQUIRED: Public landmark, never private alley
     preferredSlot: string;
     status: InspectionBookingStatus;
     createdAt: string;
   }
   
   ```

2. **Update Bot Reply Copy (`whatsappAiConcierge.ts`):**

   * When a booking is created, set `status: 'pending_agent'`.

   * Tell the student: *"⏳ Inspection Request **#ARM-XXXX** logged for \[Slot\] at **\[Meetup Landmark\]**. We have pinged \[Agent Name\] to lock in this time. Click below to send your pass to \[Agent Name\] on WhatsApp."*

3. **Update UI Badge (`WhatsAppConciergePage.tsx`):**

   * In the **Scheduled Free Inspections** drawer, render an amber pill (`⏳ Awaiting Agent Confirm`) for `pending_agent` and an emerald pill (`✅ Confirmed`) for `confirmed`.

4. **Agent Webhook Reply Handler (`whatsapp-ai-webhook`):**

   * If an incoming Twilio WhatsApp message comes from an approved `agentPhone` matching `CONFIRM #ARM-XXXX` (or reply `1`), update status to `'confirmed'` and trigger a Twilio notification back to `studentPhone`.

### Task 2.3: Mandatory Student WhatsApp Phone Gate on Web Simulator (`WhatsAppConciergePage.tsx`)

**The Bug:**

Unauthenticated visitors on `/whatsapp-ai` can trigger an inspection booking with a fallback/placeholder phone number, leaving the agent and Team Leader with no way to reach the student on WhatsApp.

**What to Implement:**

1. Add a Nigerian phone number validator helper:

   ```
   export function isValidNigerianPhone(phone: string): boolean {
     const cleaned = phone.replace(/[\s\-+]/g, '');
     return /^(?:0|234)(?:70|80|81|90|91)\d{8}$/.test(cleaned);
   }
   
   ```

2. In `whatsappAiConcierge.ts` (Stage 4: Inspection Booking):

   * Check if `session.studentPhone` passes `isValidNigerianPhone()`.

   * If **false**, hold the pending booking intent in session state (`pendingBookingDraft`) and reply:

     > *"Almost done! Drop your active WhatsApp phone number (e.g., 0803XXXXXXX) so we can generate your free **#ARM-XXXX** inspection pass and send it to your phone."*

   * On the very next message, extract the phone number, persist it to `localStorage` (`aroom_student_phone`), complete `createWhatsAppAgentBooking()`, and output the `#ARM-XXXX` confirmation.

### Task 2.4: Stateful Web-to-WhatsApp Handoff (`WhatsAppConciergePage.tsx`)

**The Bug:**

The top header CTA (`Open in WhatsApp`) currently hardcodes a static text string:
`https://wa.me/2348099990001?text=Hello%20Aroom%2C%20I%20need%20a%20verified%20student%20room%20near%20UNIPORT`

If a student already filtered rooms or created a booking on the web simulator, clicking that button loses all context.

**What to Implement:**
Create a dynamic `buildWhatsAppHandoffUrl()` computed helper in `WhatsAppConciergePage.tsx`:

* **Case A (Student has an active booking `#ARM-XXXX`):**
  Pre-fill text: `"Hello Aroom, my free inspection pass is #ARM-4821 for [House Title] with [Agent Name] at [Slot]. Please confirm my slot."`

* **Case B (Student was viewing specific listings/filters):**
  Pre-fill text: `"Hello Aroom, I was checking rooms on the web simulator (Area: Choba, Max Budget: ₦250k, House #1). Please send the details to my WhatsApp."`

* **Case C (Default initial state):**
  Keep existing default greeting.

## 3. P1 Tasks: Trust, Campus Survival Metrics & Cost Clarity

### Task 3.1: Enrich Listing Schema with "Student Survival Metrics" (`listingsStore.ts`)

Static photos aren't enough for UNIPORT students—they ask about water, light, trek distance to the gate, and video proof before stepping out.

**What to Implement:**

1. Extend the `Listing` interface in `listingsStore.ts`:

   ```
   export interface CampusSurvivalMetrics {
     waterSource: 'Borehole (Running)' | 'Well Water' | 'Pumped Daily';
     powerStatus: 'Federal Light (Band A/B)' | 'Solar Backup' | 'Generator Allowed';
     walkMinutesToGate: number; // e.g., 6
     nearestLandmark: string;   // e.g., "Choba Junction (by Crunchies)"
     walkthroughVideoUrl?: string; // 15-sec compressed MP4 or YouTube Shorts/Cloudinary link
     securityFeatures: string[]; // e.g., ['Fenced & Gated', 'Caretaker On-Site']
   }
   
   ```

2. Update the bot listing card formatter in `whatsappAiConcierge.ts` so every room recommendation includes a compact reality line:

   ```
   🏠 *#1 Modern Studio at Alakahia*
   📍 5 mins walk to UPTH Gate • 💧 Borehole • ⚡ Band B Light + Gen Allowed
   💰 Base Rent: ₦200,000/yr | *Total Year-1 Move-In: ₦245,000*
   🛡️ Inspection Fee: *₦0 (FREE)*
   
   ```

3. In `WhatsAppConciergePage.tsx`, if `listing.walkthroughVideoUrl` exists, render a `"🎥 Watch 15s Room Video"` badge button directly on the inline media card.

### Task 3.2: Base Rent vs. Total Move-In Package Disambiguation (`whatsappAiConcierge.ts`)

**The Bug:**

When a student says *"I need self contain under 250k"*, a room with `baseRent = 240,000` has a `totalMoveInCost = 295,000` (once Caution, Legal, Utility, and Agency are added). Showing it without warning feels like bait-and-switch; hiding it completely hides good options.

**What to Implement:**
In Stage 2 (`filterCatalogByBudget`), bucket results into two clear sections in the bot's response:

1. **✅ Total Move-In Under Your Budget (**$\le$ **₦250,000 All-In):** Rooms where `totalMoveInCost <= maxBudget`.

2. **💡 Base Rent Fits, Total Move-In Slightly Above:** Rooms where `annualRent <= maxBudget`, `totalMoveInCost > maxBudget`, and `totalMoveInCost <= maxBudget * 1.25`. Explicitly note: *"Base rent fits your ₦250k budget, and Year 2 drops back to base rent."*

## 4. P2 Tasks: Anti-Extortion & Post-Inspection Loop

### Task 4.1: Anti-Extortion Warning & `REPORT` Keyword Handler (`whatsappAiConcierge.ts`)

To prevent rogue agents from asking for "mobilization", "card fee", or "transport money" once the student clicks the direct agent WhatsApp link:

1. **Inject Safety Warning in Every Booking Card:**

   > *"🛡️ **Aroom Safety Rule:** Show pass **#ARM-XXXX** when meeting \[Agent Name\] at **\[nearestLandmark\]**. NEVER pay any inspection, form, or transport fee. If asked for ₦1, reply **REPORT #ARM-XXXX** here immediately."*

2. **Add Stage 5 Intent (`REPORT` / `NO SHOW`) in `whatsappAiConcierge.ts`:**

   * Trigger on regex: `/\b(report|extort|asked for money|inspection fee|no show|agent didn't come)\b/i`.

   * Automatically flag the latest booking as `status = 'reported_issue'`.

   * Fire an urgent alert event to `TeamLeaderApprovalsPage.tsx` so the Team Leader can intervene and suspend the agent if verified.

## 5. Acceptance Criteria & QA Checklist for PR

Before merging your PR into `main`, verify that all 6 automated/manual test cases pass:

* \[ \] **Test 1 (Regex Isolation):** Typing `"Show me #1 and #2 for 1 year"` or `"Book A1 tomorrow at 2pm"` does **not** trigger a budget filter of `₦1` or `₦2`.

* \[ \] **Test 2 (Phone Gate on Web):** Attempting to book an inspection on `/whatsapp-ai` without a valid 11-digit Nigerian phone number prompts the user for their WhatsApp number before generating `#ARM-XXXX`.

* \[ \] **Test 3 (Pending Status):** Newly created bookings start with `status: 'pending_agent'` and display the public `meetupLandmark` instead of confirmed status.

* \[ \] **Test 4 (Stateful Handoff):** Clicking `"Open in WhatsApp"` in the top header after booking `#ARM-4821` opens `wa.me` with `#ARM-4821` pre-populated in the message query parameter.

* \[ \] **Test 5 (Budget Bucketing):** Searching `"Choba under 250k"` separates rooms where Total Move-In $\le$ ₦250k from rooms where only Base Rent $\le$ ₦250k.

* \[ \] **Test 6 (Report Trigger):** Typing `"Agent asked me for 2k inspection fee"` flags the active booking as `reported_issue` and outputs the Team Leader escalation line.