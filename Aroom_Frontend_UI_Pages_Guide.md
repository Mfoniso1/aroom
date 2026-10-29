# Aroom Platform: Comprehensive Page-by-Page Frontend & UI Screen Guide

> **Platform Version:** Aroom MVP Pilot (University of Port Harcourt — UNIPORT)  
> **Target Audience:** All Platform Stakeholders (Students, Parents, Verified Agents, Direct Landlords, Team Leaders & Investors)  
> **Document Purpose:** Complete architectural and functional walkthrough of every single UI page, component, user role permission, and interactive state across the Aroom web ecosystem.

---

## Table of Contents
1. [User Personas & Role Architecture](#1-user-personas--role-architecture)
2. [Marketplace & Public Screens (Students & General Visitors)](#2-marketplace--public-screens)
   - [0. Splash Screen / App Loader (`SplashScreen.tsx`)](#screen-0-splash-screen)
   - [1. Marketplace Homepage (`/` — `HomePage.tsx`)](#screen-1-marketplace-homepage)
   - [2. Campus Search & Discovery Page (`/search` — `SearchPage.tsx`)](#screen-2-campus-search--discovery-page)
   - [3. Verified Listing Detail Page (`/listings/:id` — `ListingDetailPage.tsx`)](#screen-3-verified-listing-detail-page)
   - [4. WhatsApp AI Concierge Page (`/whatsapp-ai` — `WhatsAppConciergePage.tsx`)](#screen-4-whatsapp-ai-concierge-page)
3. [Authentication & Onboarding Screens](#3-authentication--onboarding-screens)
   - [5. Unified Role Selector (`/signup` — `SignUpPage.tsx`)](#screen-5-unified-role-selector)
   - [6. Student Registration (`/signup/student` — `StudentRegisterPage.tsx`)](#screen-6-student-registration)
   - [7. Verified Agent Registration (`/signup/agent` — `AgentRegisterPage.tsx`)](#screen-7-verified-agent-registration)
   - [8. Direct Landlord Registration (`/signup/landlord` — `LandlordRegisterPage.tsx`)](#screen-8-direct-landlord-registration)
   - [9. Unified Intelligent Login (`/login` — `LoginPage.tsx`)](#screen-9-unified-intelligent-login)
4. [Student Portal Screens](#4-student-portal-screens)
   - [10. Student Personal Dashboard (`/student/dashboard` — `StudentDashboardPage.tsx`)](#screen-10-student-personal-dashboard)
5. [Verified Agent Portal Screens](#5-verified-agent-portal-screens)
   - [11. Agent Performance Dashboard (`/portal/dashboard` — `DashboardPage.tsx`)](#screen-11-agent-performance-dashboard)
   - [12. Agent Create New Listing (`/portal/listings/new` — `NewListingPage.tsx`)](#screen-12-agent-create-new-listing)
   - [13. Partner Approval Status (`/portal/status` — `ApprovalStatusPage.tsx`)](#screen-13-partner-approval-status)
6. [Direct Landlord Portal Screens](#6-direct-landlord-portal-screens)
   - [14. Direct Landlord Dashboard (`/portal/landlord/dashboard` — `LandlordDashboardPage.tsx`)](#screen-14-direct-landlord-dashboard)
   - [15. Landlord Create Direct Listing (`/portal/landlord/new` — `LandlordNewListingPage.tsx`)](#screen-15-landlord-create-direct-listing)
7. [Team Leader / Operations Admin Command Center](#7-team-leader--operations-admin-command-center)
   - [16. Team Leader Command Console (`/admin/approvals` — `TeamLeaderApprovalsPage.tsx`)](#screen-16-team-leader-command-console)
8. [Interactive Modals & Global Components](#8-interactive-modals--global-components)
   - [Move-In Cost Calculator Component (`MoveInCostCalculator.tsx`)](#move-in-cost-calculator-component)
   - [₦0 Free Inspection Modal (`InspectionScheduleModal.tsx`)](#free-inspection-schedule-modal)
   - [Video Walkthrough Player Modal (`VideoModal.tsx`)](#video-walkthrough-player-modal)
   - [Profile Editor Modal (`EditProfileModal.tsx`)](#profile-editor-modal)
   - [Live Activity Ticker (`DashboardTicker.tsx`)](#live-activity-ticker)
9. [Investor & Stakeholder Presentation Decks](#9-investor--stakeholder-presentation-decks)
10. [Comprehensive User Role vs. Page Access Matrix](#10-comprehensive-user-role-vs-page-access-matrix)

---

## 1. User Personas & Role Architecture

Aroom serves 4 primary active user classes:

| Persona | Primary Goal | Key Distinguishing Feature |
| :--- | :--- | :--- |
| 🎓 **Student / Parent** | Secure verified accommodation near UNIPORT without fraud or inspection fees. | ₦0 inspection fees, transparent total move-in calculator, WhatsApp AI concierge, room-taken alerts. |
| 🛡️ **Verified Agent** *(Closed cohort of 15–20)* | List verified lodges, close high-intent student leads, and earn legally capped 15% agency commissions. | Dedicated agent portal, quota tracking (15–20 listings/mo), physical inspection alerts, request Team Lead verification. |
| 🏢 **Direct Landlord** | Fill entire student hostels/lodges within 48–72 hours without paying agent commissions. | 0% agency fee listings, multi-unit occupancy manager, direct student chat & inspection bookings. |
| 👑 **Team Leader / Admin** *(Don-Amadiwochi Eze & Enyinma Justice Smart)* | Protect students, enforce accreditation, verify physical lodges on-ground, and oversee WhatsApp bookings. | 5-tab Command Center: Partner verification queue, accredited roster, listing audit, WhatsApp booking radar, live metrics. |

---

## 2. Marketplace & Public Screens

### Screen 0: Splash Screen
- **Component File:** [`src/components/shared/SplashScreen.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/components/shared/SplashScreen.tsx)
- **Target User:** Every first-time visitor or user refreshing the application.
- **Duration:** 4,200 ms with smooth fade-out.
- **UI Elements:**
  - Centered glowing Aroom emerald brand emblem with animated pulse ring.
  - Tagline: *"Student Housing • Transparent & Scam-Free"*.
  - Feature pills: `Team-Leader Verified` • `₦0 Inspection Fee` • `UNIPORT Anchor Pilot`.
- **Purpose:** Eliminates visual layout jump while checking stored pilot authentication sessions and initializing listings.

---

### Screen 1: Marketplace Homepage
- **Route:** `/`
- **Component File:** [`src/features/marketplace/pages/HomePage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/marketplace/pages/HomePage.tsx)
- **Target User:** Prospective UNIPORT students, returning students, and sponsors/parents.
- **Layout & Key UI Elements:**
  1. **Top Navigation Bar:** Aroom logo, quick links (`Explore Rooms`, `WhatsApp AI`, `Role Badges`, `Sign In / Portal`).
  2. **Hero Header:**
     - Trust Pill: `Team-Leader Verified • ₦0 Inspection Fee`.
     - Dynamic Headline: Rotating accommodation types (*Student Rooms, Campus Hostels, Self-Contains, Shared Flats*).
     - Subtitle: *"Transparent move-in costs and Team-Leader-vetted campus agents."*
  3. **Instant Search Box:**
     - Campus Selector: Pre-populated with UNIPORT key areas (*Choba Gate, Alakahia/UPTH, Delta Park, Back of Chem, Ozuoba, Aluu*).
     - Room Type Selector: *Self-Contain, Single Room, Shared Flat*.
     - One-click `Search` CTA.
  4. **WhatsApp AI Shortcut Banner:** Prominent pill linking directly to the conversational WhatsApp Concierge: *"Prefer WhatsApp? Chat with Aroom AI to book a trusted agent →"*.
  5. **Verified Listings Grid:** Showcases latest verified campus rooms featuring high-resolution photography, video walkthrough icons, upfront pricing, and direct landlord/agent attribution badges.
  6. **Interactive Global Ticker:** Displays real-time campus activity (e.g., *"Amara booked a free inspection in Alakahia"*, *"David verified a ₦250k self-contain"*).

---

### Screen 2: Campus Search & Discovery Page
- **Route:** `/search` (supports query params: `?campus=...&roomType=...`)
- **Component File:** [`src/features/marketplace/pages/SearchPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/marketplace/pages/SearchPage.tsx)
- **Target User:** Students actively filtering and comparing rooms based on location, budget, and fees.
- **Layout & Key UI Elements:**
  1. **Compact Hero Bar:** Displays active campus focus (e.g., *"UNIPORT Student Housing"*).
  2. **Mobile Quick-Filter Bar:** Kept above the fold so mobile users never have to scroll excessively to filter rooms.
  3. **Sidebar / Filter Drawer:**
     - **Location Filter:** Specific UNIPORT clusters (Choba, Alakahia/UPTH, Delta Park, Back of Chem, Ozuoba, Aluu).
     - **Budget Slider:** Price range from ₦100,000 to ₦600,000+/year.
     - **Uploader Type Filter:** Toggle between *All*, *Direct Landlord (0% Agency Fee)*, and *Verified Agent (Capped 15%)*.
     - **Team Lead Verified Only:** Filter for strictly physically inspected lodges.
  4. **Listings Results Feed:** Real-time filtered grid showing matching cards with move-in costs, distance to campus gate, and instant booking CTAs.
  5. **Empty State:** Friendly fallback when filters yield no matches, offering a one-click *"Reset Filters"* button.

---

### Screen 3: Verified Listing Detail Page
- **Route:** `/listings/:id`
- **Component File:** [`src/features/marketplace/pages/ListingDetailPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/marketplace/pages/ListingDetailPage.tsx)
- **Target User:** Students evaluating a specific lodge before taking action.
- **Layout & Key UI Elements:**
  1. **Hero Media Gallery:**
     - High-resolution property image.
     - **"Watch Verified Video Tour"** button: Opens an in-app player playing authentic, unedited on-site walkthrough footage recorded by the Team Lead or verified partner.
     - Availability badge: `Available`, `Held (Inspection Scheduled)`, or `Taken`.
  2. **Property Overview:**
     - Title, neighborhood landmark (e.g., *"5 mins walk to UNIPORT Choba Gate"*), and key infrastructure indicators (*Running treated borehole water, individual prepaid meter, fenced compound, security gate*).
  3. **Uploader Identity Card:**
     - Distinguishes **Direct Landlord** (e.g., *Chief Emeka Nwosu — Property Owner*) from **Verified Campus Agent** (e.g., *David Opubo — Team-Leader Accredited Agent*).
     - Response rate & verified star rating.
  4. **The Move-In Cost Calculator Widget:**
     - Itemizes exact breakdown: Annual Rent + Caution Fee (Refundable) + Legal & Agreement + Utilities/Compound Fee + Agency Commission (15% for agents, **₦0 for Direct Landlords**) + Physical Inspection Fee (**₦0 FREE**).
     - Computes the **True Total Move-In Cost** so parents and students face zero unexpected fees at the gate.
  5. **Action CTAs:**
     - **"Book Free Physical Inspection"**: Launches schedule modal.
     - **"Chat with Agent / Landlord on WhatsApp"**: Pre-fills a structured WhatsApp inquiry message.

---

### Screen 4: WhatsApp AI Concierge Page
- **Route:** `/whatsapp-ai`
- **Component File:** [`src/features/marketplace/pages/WhatsAppConciergePage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/marketplace/pages/WhatsAppConciergePage.tsx)
- **Target User:** Students who prefer messaging on WhatsApp over browsing web catalogs, or users on low-bandwidth 2G campus connections.
- **Layout & Key UI Elements:**
  1. **Simulated WhatsApp Chat UI:**
     - WhatsApp web header with green styling, official Aroom Verified checkmark, and active status.
     - Two-way interactive messaging supporting English and Nigerian Pidgin (e.g., *"Abeg I need room for Choba under 250k"*).
     - Automated natural language parsing returning verified lodge cards, video links, and exact move-in package summaries.
  2. **One-Tap Quick Reply Chips:**
     - *"I need a self-contain near UNIPORT Choba Gate under ₦300k"*
     - *"Who are your verified agents?"*
     - *"Show me direct landlord rooms (₦0 agent fee)"*
     - *"Book David for a free inspection tomorrow at 2pm"*
  3. **Integrated Booking Confirmation:** Generates a real booking tracking code (e.g., `#ARM-4821`) and syncs immediately to the Team Leader Console.

---

## 3. Authentication & Onboarding Screens

### Screen 5: Unified Role Selector
- **Route:** `/signup`
- **Component File:** [`src/features/auth/pages/SignUpPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/auth/pages/SignUpPage.tsx)
- **Target User:** Any new user arriving to create an account.
- **UI Elements:**
  - Three distinct, visual role cards:
    1. **Student:** *"Find verified campus rooms & book free physical inspections"* (Pill: `₦0 Inspection Fee`).
    2. **Direct Landlord:** *"List your own properties directly to students with 0% agency fee"* (Pill: `Direct Owner`).
    3. **Campus Agent:** *"Join our Team-Leader-verified agent roster and manage student houses"* (Pill: `Verified Roster`).
  - One-click navigation routing to each role's dedicated registration flow.

---

### Screen 6: Student Registration
- **Route:** `/signup/student`
- **Component File:** [`src/features/auth/pages/StudentRegisterPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/auth/pages/StudentRegisterPage.tsx)
- **Target User:** UNIPORT students registering for an account.
- **Key Fields & Validation:**
  - Full Name, Student Email (`@uniport.edu.ng` or personal), Phone Number (Nigerian format: `080...`).
  - Campus Selection (defaulted to UNIPORT).
  - Matriculation / JAMB Registration Number (ensures verified student identity).
  - Password with visual strength meter (Weak, Fair, Good, Strong).
  - Terms Agreement: Commits to attending booked inspections responsibly.
- **Post-Registration:** Automatically creates student session and redirects directly to `/student/dashboard`.

---

### Screen 7: Verified Agent Registration
- **Route:** `/signup/agent`
- **Component File:** [`src/features/auth/pages/AgentRegisterPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/auth/pages/AgentRegisterPage.tsx)
- **Target User:** Prospective agents applying to join the closed 15–20 curated partner cohort.
- **Multi-Step Flow:**
  - **Step 1 — Account & Identity:** Full Name, Email, Phone, Agency / Brand Name, Password.
  - **Step 2 — Coverage & Verification:**
    - Primary UNIPORT operational areas (*Choba, Alakahia, Delta Park, Back of Chem, Ozuoba, Aluu*).
    - Government ID Card Upload (NIN slip, Voter's Card, or Driver's License).
    - Physical office or resident address in Port Harcourt.
  - **Step 3 — Application Submitted:** Displays confirmation notice explaining that the **Aroom Team Leader will call within 24 hours** to conduct physical identity vetting and on-site audit before granting listing rights.

---

### Screen 8: Direct Landlord Registration
- **Route:** `/signup/landlord`
- **Component File:** [`src/features/auth/pages/LandlordRegisterPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/auth/pages/LandlordRegisterPage.tsx)
- **Target User:** Property owners who own lodges or hostels near UNIPORT.
- **Key Fields & Flow:**
  - Owner Full Name, Phone, Email, Password.
  - Lodge / Hostel Name (e.g., *"Eze Royal Lodge"*).
  - Exact Property Location & Closest Campus Landmark.
  - Total Units Count (e.g., 10-unit self-contain complex).
  - Proof of Ownership / Caretaker Authorization document upload.
  - Explains the **0% Agency Fee Model**: Direct landlords pay 0% commission and can fill vacancies rapidly.

---

### Screen 9: Unified Intelligent Login
- **Route:** `/login`
- **Component File:** [`src/features/auth/pages/LoginPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/auth/pages/LoginPage.tsx)
- **Target User:** Returning students, agents, landlords, and operations admins.
- **Intelligent Role Routing Engine:**
  - Accepts registered Email or Nigerian Phone Number + Password.
  - Automatically identifies role upon validation:
    - **Team Leader / Admin:** Redirects immediately to `/admin/approvals`.
    - **Student:** Redirects to `/student/dashboard`.
    - **Approved Agent:** Redirects to `/portal/dashboard`.
    - **Approved Landlord:** Redirects to `/portal/landlord/dashboard`.
    - **Pending / Under Review Partner:** Redirects to `/portal/status` with real-time status banner.
  - **Demo Credentials Drawer:** Built-in pilot quick-switch drawer enabling one-click test logins as Student, Approved Agent, Approved Landlord, Pending Partner, or Team Leader.

---

## 4. Student Portal Screens

### Screen 10: Student Personal Dashboard
- **Route:** `/student/dashboard`
- **Component File:** [`src/features/student/pages/StudentDashboardPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/student/pages/StudentDashboardPage.tsx)
- **Target User:** Authenticated UNIPORT students managing their housing search.
- **Key Modules & UI Elements:**
  1. **Student Profile Card:** Displays student name, campus (UNIPORT), matriculation number, and account verification badge. Includes button to open `EditProfileModal`.
  2. **Room-Taken Protection Banner:**
     - Proactively alerts the student if a room they previously viewed or scheduled has been rented out by someone else.
     - Automatically generates **instant similar-budget alternative lodges** nearby, eliminating wasted travel across Choba.
  3. **Scheduled Free Inspections Hub:**
     - Cards showing upcoming physical inspections booked with accredited agents/landlords.
     - Date & time slot, location pin, partner name, and direct WhatsApp call/chat button.
     - Toggle for WhatsApp inspection reminders.
  4. **Saved Listings (Bookmarks):** Collection of student's bookmarked properties with quick move-in price badges and inspection booking shortcuts.
  5. **Quick Search Discovery:** One-click shortcut to explore all verified UNIPORT rooms.

---

## 5. Verified Agent Portal Screens

### Screen 11: Agent Performance Dashboard
- **Route:** `/portal/dashboard`
- **Component File:** [`src/features/agent/pages/DashboardPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/agent/pages/DashboardPage.tsx)
- **Target User:** Accredited campus agents managing listings and student inquiries.
- **Key Modules & UI Elements:**
  1. **Agent Profile Header:** Displays agent name, agency name, verified badge, assigned coverage clusters (e.g., *Choba Gate, Delta Park*), phone, and email.
  2. **Performance Metrics Strip:**
     - `Active Listings` (Progress towards monthly quota of 15–20 listings).
     - `Total Student Views`.
     - `Student Direct Inquiries & Walkthrough Bookings`.
  3. **Property Inventory Manager:**
     - Table / card list of agent's listed accommodations.
     - **Status Toggle:** Instantly switch status between `Available`, `Held (Inspection Scheduled)`, and `Taken`.
     - **Verification Status:** Shows `Verified` (green badge) or `Pending Team Lead Vetting` (amber badge).
     - **"Request Team Lead Verification" CTA:** Notifies Team Leader to conduct on-site audit for newly uploaded properties.
  4. **Action Bar:** Prominent `+ List New Property` CTA leading to the multi-step listing creator.

---

### Screen 12: Agent Create New Listing
- **Route:** `/portal/listings/new`
- **Component File:** [`src/features/agent/pages/NewListingPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/agent/pages/NewListingPage.tsx)
- **Target User:** Accredited agents adding new lodges to the marketplace.
- **Step-by-Step Flow:**
  - **Step 1 — Core Details & Automated Fee Breakdown:**
    - Select UNIPORT Area & Room Type (Self-Contain, Single Room, Shared Flat).
    - Proximity / Landmark (e.g., *"3 mins walk to UPTH gate"*).
    - Base Annual Rent input (e.g., ₦250,000).
    - Caution Fee (Refundable) & Legal Fee inputs.
    - Utility / Compound levy toggle.
    - **Capped 15% Agency Fee:** Automatically computed (e.g., ₦37,500). System enforces strict 15% cap to protect students.
    - **Total Move-In Package Display:** Live preview of what the student will pay.
  - **Step 2 — On-Site Video Tour & Media Upload:**
    - Direct device video file picker (supports MP4/MOV recorded on smartphone).
    - **Automated Video Thumbnail Extractor:** Captures the first frame of the uploaded walkthrough video to use as the listing's high-definition cover image automatically.
    - In-browser video preview player with unmuted audio playback test.
  - **Step 3 — Publication & Team Lead Dispatch:**
    - Submits listing with `unverified_new` badge.
    - Instantly dispatches a verification notification to the Team Leader for on-ground confirmation.

---

### Screen 13: Partner Approval Status
- **Route:** `/portal/status`
- **Component File:** [`src/features/agent/pages/ApprovalStatusPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/agent/pages/ApprovalStatusPage.tsx)
- **Target User:** Newly registered agents and landlords checking their verification state.
- **Three Dynamic States:**
  1. **Pending Approval (Amber):** Explains that the application is under active review by the UNIPORT Team Leader. Displays Team Leader contact phone/WhatsApp for inquiries.
  2. **Approved (Emerald):** Celebrates successful accreditation. Unlocks direct access to the Agent/Landlord Dashboard and listing creation tools.
  3. **Rejected / Suspended (Red):** Displays the exact reason for rejection or suspension entered by the Team Leader (e.g., unverified NIN, inspection fee extortion report) along with appeal instructions.

---

## 6. Direct Landlord Portal Screens

### Screen 14: Direct Landlord Dashboard
- **Route:** `/portal/landlord/dashboard`
- **Component File:** [`src/features/agent/pages/LandlordDashboardPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/agent/pages/LandlordDashboardPage.tsx)
- **Target User:** Property owners managing lodges and student hostels.
- **Key Modules & UI Elements:**
  1. **Landlord Profile Card:** Displays property owner credentials, lodge portfolio name (e.g., *Nwosu Executive Student Suites*), and verified ownership badge.
  2. **0% Agency Commission Banner:** Reminds students and landlords that direct owner properties incur **zero agency fees**, accelerating occupancy.
  3. **Lodge & Unit Occupancy Manager:**
     - Tracks multi-room student buildings: shows `Total Units` vs `Available Units` (e.g., 8 of 10 occupied).
     - Allows landlord to mark individual rooms as `Available`, `Held`, or `Taken`.
  4. **Direct Student Inspection Tracker:** Displays upcoming student inspection bookings and incoming WhatsApp inquiries.
  5. **"+ List Property (Direct Landlord)" CTA:** Quick link to upload direct-from-owner accommodation.

---

### Screen 15: Landlord Create Direct Listing
- **Route:** `/portal/landlord/new`
- **Component File:** [`src/features/agent/pages/LandlordNewListingPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/agent/pages/LandlordNewListingPage.tsx)
- **Target User:** Direct landlords listing whole lodges or vacant self-contain units.
- **Distinguishing Features:**
  - Category options include *Entire Student Lodge / Hostel* as well as single units.
  - **Zero Agency Commission:** The fee calculator explicitly sets agency fee to **₦0**, highlighting the cost savings to prospective student tenants.
  - Video walkthrough uploader with automatic cover thumbnail generation.
  - Submits directly for priority Team Leader verification.

---

## 7. Team Leader / Operations Admin Command Center

### Screen 16: Team Leader Command Console
- **Route:** `/admin/approvals` (redirects from `/admin`)
- **Component File:** [`src/features/admin/pages/TeamLeaderApprovalsPage.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/features/admin/pages/TeamLeaderApprovalsPage.tsx)
- **Target User:** Aroom Operations Leads (**Don-Amadiwochi Eze** & **Enyinma Justice Smart**).
- **Comprehensive 5-Tab Operational Architecture:**

#### Tab 1: Overview
- High-level executive dashboard showing:
  - `Verified Partner Cohort Count` (target: 15–20 curated agents & landlords).
  - `Active Verified Listings` across UNIPORT clusters.
  - `Pending Applications Queue` requiring field verification.
  - `Active WhatsApp Student Inquiries & Bookings`.
  - System health indicator (Supabase sync + Twilio webhook status).

#### Tab 2: Verification Queue
- Real-time review queue for new partner applications and unverified listings:
  - Partner profile inspection: Full Name, Agency/Lodge Name, Phone, Email, Coverage Areas.
  - **Gov ID Card Modal:** Allows Team Leader to preview uploaded NIN/Voter's Card in high resolution.
  - **Phone Contacted Tracker:** Checkbox to log when Team Leader has placed a phone call to the partner.
  - **Action Controls:**
    - `Approve Partner`: Instantly issues verified badge and unlocks listing privileges.
    - `Reject Application`: Prompts for custom feedback note sent to the applicant.
    - `Suspend Partner`: Instantly freezes listing and booking capabilities if rules are breached.
  - **Listing Verification Actions:** Audit on-site video walkthrough, confirm running water/light, and click `Approve Listing` to award the *"Team-Leader Verified"* shield.

#### Tab 3: Partner & Student Roster
- Complete searchable directory of all platform participants:
  - Filter by `All`, `Approved`, `Pending`, `Rejected`, or `Suspended`.
  - Real-time search bar by name, agency, or phone number.
  - Quick action controls to call, email, or toggle suspension on any partner.
  - **"Register Pre-Approved Partner" Button:** Modal allowing Team Leader to directly onboard known, trusted UNIPORT agents or landlords on the spot.
  - Student Accounts Sub-Table: Displays registered students, UNIPORT matric numbers, and active bookmarks.

#### Tab 4: WhatsApp Bookings Radar
- Live audit log of all student bookings processed through the WhatsApp AI concierge:
  - Student name & contact phone number.
  - Requested campus area & budget.
  - Assigned accredited agent or direct landlord.
  - Inspection appointment date and time.
  - Status indicators (`Confirmed`, `Reminder Sent`, `Completed`).

#### Tab 5: Team Leader Profile Settings
- Allows Team Leader to configure the public-facing contact information displayed to applicants:
  - Team Leader full name (e.g., *Don-Amadiwochi Eze*).
  - Official Aroom verification hotline phone number.
  - Official WhatsApp support link.

---

## 8. Interactive Modals & Global Components

### Move-In Cost Calculator Component
- **Component File:** [`src/components/shared/MoveInCostCalculator.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/components/shared/MoveInCostCalculator.tsx)
- **Embedded In:** Listing Detail Page, Search Cards, New Listing Creators.
- **Functionality:**
  - Displays side-by-side or itemized fee lines:
    - Base Rent (Annual)
    - Refundable Caution Fee
    - Tenancy Legal & Agreement Fee
    - Utility & Borehole Maintenance Fee
    - Agency Commission (15% for agents, 0% for landlords)
    - Physical Inspection Fee (**₦0 FREE**)
  - Shows clear sum: **"True Total Move-In Cost"**. Eliminates surprises at payment time.

### Free Inspection Schedule Modal
- **Component File:** [`src/components/shared/InspectionScheduleModal.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/components/shared/InspectionScheduleModal.tsx)
- **Functionality:**
  - Interactive date and time slot selector (Morning, Afternoon, Evening).
  - Displays assigned verified agent/landlord profile with phone number.
  - Highlights **"100% Free — You pay ₦0 for this inspection"**.
  - Generates instant booking confirmation with WhatsApp reminder integration.

### Video Walkthrough Player Modal
- **Component File:** [`src/components/shared/VideoModal.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/components/shared/VideoModal.tsx)
- **Functionality:**
  - Lightbox video player showing unedited walkthrough footage of the accommodation.
  - Verifies presence of key amenities (tiled floors, running borehole water, private meter).
  - Audio support enabled by default.

### Profile Editor Modal
- **Component File:** [`src/components/shared/EditProfileModal.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/components/shared/EditProfileModal.tsx)
- **Functionality:**
  - Allows students, agents, and landlords to update their phone numbers, email addresses, bios, and operational coverage areas without leaving the dashboard.

### Live Activity Ticker
- **Component File:** [`src/components/shared/DashboardTicker.tsx`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/src/components/shared/DashboardTicker.tsx)
- **Functionality:**
  - Continuously cycling ticker bar showing authentic real-time marketplace activity across UNIPORT (e.g., new inspections booked, newly verified rooms added, student moves confirmed).

---

## 9. Investor & Stakeholder Presentation Decks

In addition to the operational web application, Aroom includes dedicated, publication-grade executive presentation artifacts built directly into the codebase:

1. **UNIPORT Investor Pitch Deck (₦5M Seed Round):**
   - **File:** [`aroom-web/public/investor-pitch-deck.html`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/public/investor-pitch-deck.html)
   - **Compiled PDF:** [`Aroom_Investor_Pitch_Deck_UNIPORT.pdf`](file:///c:/Users/DELL/Downloads/Aroom/Aroom_Investor_Pitch_Deck_UNIPORT.pdf)
   - **Scope:** 12 widescreen (16:9) slides covering the UNIPORT housing reality, the closed 15–20 partner quota engine, ₦0 inspection fee defense, unit economics (₦12,500/lease take rate), and the ₦5M fund allotment with 8–10 month payback.

2. **Formal Business Proposal & Slide Presentation:**
   - **Slide Deck:** [`aroom-web/public/business-proposal-slides.html`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/public/business-proposal-slides.html)
   - **Compiled Proposal Slide PDF:** [`Aroom_Business_Proposal_UNIPORT_Slides.pdf`](file:///c:/Users/DELL/Downloads/Aroom/Aroom_Business_Proposal_UNIPORT_Slides.pdf)
   - **Full Formal Proposal Document:** [`aroom-web/public/business-proposal.html`](file:///c:/Users/DELL/Downloads/Aroom/aroom-web/public/business-proposal.html) & [`Aroom_Business_Proposal_UNIPORT.pdf`](file:///c:/Users/DELL/Downloads/Aroom/Aroom_Business_Proposal_UNIPORT.pdf)

---

## 10. Comprehensive User Role vs. Page Access Matrix

| Route | Page Name | Public / Guest | Student | Verified Agent | Direct Landlord | Team Leader |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `/` | Homepage | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/search` | Search & Filter Catalog | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/listings/:id` | Listing Detail Page | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/whatsapp-ai` | WhatsApp AI Concierge | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/login` | Intelligent Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/signup` | Unified Role Picker | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/signup/student` | Student Registration | ✅ | 🔄 *(Self)* | ❌ | ❌ | ❌ |
| `/signup/agent` | Agent Application | ✅ | ❌ | 🔄 *(Self)* | ❌ | ❌ |
| `/signup/landlord`| Landlord Application | ✅ | ❌ | ❌ | 🔄 *(Self)* | ❌ |
| `/student/dashboard`| Student Dashboard | ❌ *(Redirects)* | ✅ | ❌ | ❌ | ❌ |
| `/portal/dashboard` | Agent Dashboard | ❌ *(Redirects)* | ❌ | ✅ *(Approved)* | ❌ | ❌ |
| `/portal/listings/new`| Agent Create Listing | ❌ *(Redirects)* | ❌ | ✅ *(Approved)* | ❌ | ❌ |
| `/portal/landlord/dashboard`| Landlord Dashboard | ❌ *(Redirects)* | ❌ | ❌ | ✅ *(Approved)*| ❌ |
| `/portal/landlord/new`| Landlord Create Listing | ❌ *(Redirects)* | ❌ | ❌ | ✅ *(Approved)*| ❌ |
| `/portal/status` | Partner Approval State | ❌ *(Redirects)* | ❌ | ✅ *(Pending/All)*| ✅ *(Pending/All)*| ❌ |
| `/admin/approvals`| Team Leader Console | ❌ *(Redirects)* | ❌ | ❌ | ❌ | ✅ *(Admin only)* |

---
*Document maintained by Aroom Technologies Engineering & Operations Team.*

