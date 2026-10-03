**SOLUTION BRIEF**

**Campus Accommodation Platform with WhatsApp AI Triage**

*Prepared for Mfoniso Akpatang  |  Draft v1  |  September 2026*

# **1\. Overview**

This brief outlines a campus accommodation platform that connects students with verified off-campus housing near their university, using a WhatsApp AI triage bot as the primary conversational entry point. The platform serves two sides of a marketplace: students seeking rooms, agents/landlords listing available accommodation. 

The core design principle is that trust, not features, determines whether this platform survives contact with the market. Accommodation marketplaces in Nigeria typically fail through fake listings, double-bookings, and agents who disappear after collecting inspection fees — not through missing functionality. Every MVP decision below is filtered through that lens.

# **2\. The Two Personas**

* **Students (demand side) —** want verified rooms near a specific campus, honest pricing, and protection from scams or a room already taken by someone else.

* **Agents / landlords (supply side) —** want qualified leads fast, minimal listing friction, and some protection against time-wasting inquiries.

# **3\. WhatsApp AI Triage — Scope of Behaviour**

The bot is a conversation state machine, not open-ended chat. Its job is narrow and structured:

* Student messages in with campus, budget, room type, and move-in date.

* The AI extracts structured intent from free text and queries available listings matching those filters.

* The AI surfaces 2–3 matching listings and hands off to the agent, or books an inspection slot.

* Conversation state persists, so a student can return mid-conversation without repeating information already given.

 A single shared service class should sit behind both the WhatsApp bot and any future web dashboard inquiry flow, so booking/inquiry logic is written once and reused, not duplicated across channels.

# **4\. Trust & Verification Model**

A slow, synchronous, human-gated verification process would kill the platform's usefulness to agents who need a listing up immediately. The fix is not to remove verification — it's to decouple visibility from verification and layer trust signals over time.

## **4.1 Tiered visibility**

* A new listing goes live immediately, tagged “Unverified – New.” It is fully searchable and contactable right away — the agent loses no time.

* Verification runs in parallel, in the background, and upgrades the badge to “Verified” once complete — typically within hours, not days.

* Students see the trust badge and can decide their own risk tolerance, similar to “new host” vs “superhost” patterns in established marketplaces.

## **4.2 Making verification itself fast**

* Agent phone number verified via OTP once at signup — not per listing. This alone removes a large share of throwaway fraud accounts, instantly.

* Trust compounds per agent: a first-time agent's listing gets more scrutiny; an agent with several confirmed properties gets lighter-touch review on subsequent listings.

## **4.3 Protecting the transaction, not just the listing**

* No in-app payments at MVP. Inspection and negotiation happen offline, which removes the scenario where a fake agent collects money and disappears.

* Post-contact rating and reporting: “Did you visit this property? Was it as described?” Bad agents are flagged and demoted quickly rather than relying entirely on upfront vetting.

* Agent response/no-show rate is tracked and shown to future students as a reliability signal, independent of the verified/unverified badge.

## **4.4 Protecting agents from time-wasters**

* Students verify a university email or student ID at signup (automatable — domain matching against known institutional email formats).Non-students that need accommodation can also sign up , our system will have to classify these users.

* Every inquiry an agent receives is therefore from a confirmed student or other user who has signed up, which is worth more to agents than a listing verification badge alone.

# **5\. MVP Operating Model at a Glance**

| Step | Speed | Who does it |
| :---- | :---- | :---- |
| Agent signup: phone OTP \+ ID photo | Instant | Automated |
| Student/user signup: university email/ID check(to track student) | Instant | Automated |
| Listing goes live (tagged "Unverified"),agents are prompted to verify their listings after posting a listing. | Immediate | Automated |
| Spot-check / upgrade to "Verified" badge | – |  Students / users confirm a spot check after inspection. Agents also confirm students/users' inspection For faster verification agents/landlords can do a live upload.  |
| Bad-actor removal | Ongoing | Ratings \+ report system |

# **7\. MVP Scope**

Start with one campus, done well, rather than several campuses done thin. Density of listings and student trust in a single location is the proof point that justifies expansion.

| MVP — Must Have | Deferred — Post-MVP |
| :---- | :---- |
| Listing creation (simple agent-facing form) | Escrow / in-app rent payment collection |
| Listing status enforcement: available / held / taken. Ai should be able to flag a listing with comment from students that a listing has already been taken, held or still available   | Multi-university rollout |
| Search/filter by campus \+ budget \+ room type — single campus first | Agent CRM / analytics dashboard |
| WhatsApp AI triage bot with conversation state machine | Full automated KYC (address validation APIs, image forensics) |
| Async, batched listing spot-checks (not blocking) | In-app messaging beyond WhatsApp |
| Agent onboarding: phone OTP \+ ID photo | Automated credit-scoring of agents |
| Student/user onboarding: university email/ID, user Email verification |  |
| Rating \+ reporting system after contact |  |

# **7\. Open Decisions**

* **Monetization model —** lead-generation fee per successful match, agent subscription, or a cut of a reservation fee? This determines whether any payment rails are needed at MVP at all.

Premium offer; 

a.) Agent boost listings.

b). For students 20max free listings. 

c) 

# **7\. Suggested Next Steps**

* Confirm monetization model 

* Define the data model for listings, agents, students, and verification status as a shared object read by both the WhatsApp bot and any future web dashboard.

* Design the WhatsApp triage conversation flow in detail — intents, required slots, fallback/handoff to a human agent.

* Select and confirm the single pilot campus.

*This brief reflects a working strategy discussion and is intended as a planning document, not a final specification.*