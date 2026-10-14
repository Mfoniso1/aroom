# 01 — Project Overview & Real-World Problem

## 1. What is Aroom?

**Aroom** is a verified off-campus student accommodation marketplace. It connects tertiary institution students (starting with UNILAG - University of Lagos) with trusted agents and landlords renting rooms, self-contains, and shared flats near campus.

---

## 2. What Real Problem Does This Project Solve?

In Nigeria, finding off-campus accommodation is notoriously painful and risky:

1. **Phantom Listings & Scams:** Fake agents advertise rooms that don't exist or don't belong to them, demand "non-refundable inspection fees," and disappear.
2. **Double-Bookings & Ghost Rooms:** A room is paid for, but the agent continues advertising it to 10 other desperate students.
3. **Hidden Move-In Costs:** A student sees a room advertised for ₦350,000/year, only to find out they need ₦440,000 upfront because of agency fees (10%), agreement/legal fees, caution deposits, and maintenance charges.
4. **Time-Wasting for Agents:** Honest agents receive dozens of calls from people who aren't serious students or have unrealistic budgets.

---

## 3. How Does Aroom Solve This?

Aroom's philosophy is: **Trust, not extra fancy features, determines if the platform survives.**

Here are the software solutions built into this project:

| Problem | Software Solution Built in Aroom |
|---|---|
| **Fake Agents** | One-time phone OTP & government ID check + Agent Trust Scoring (`gold`, `silver`, `bronze`). |
| **Fake Students / Time Wasters** | Student institutional email verification (e.g., domain matching against `@live.unilag.edu.ng`). |
| **Double Bookings** | Single-tap status toggle (`available` -> `held` -> `taken`). When an inspection is booked, status updates automatically. |
| **Phantom Rooms** | Crowdsourced availability reports. If a student inspects a room and reports "taken", the system flags or marks the room taken immediately. |
| **Hidden Upfront Fees** | **"Total Move-In Cost" Calculator** button on every listing card that breaks down the true total (Rent + Agency + Agreement + Caution + Service). |
| **Accessibility for Students** | **WhatsApp AI Triage Bot** that lets students search and qualify leads via conversation without needing high-speed apps. |

---

## 4. The Two Main Users (Personas)

Every marketplace has two sides:

```
[ Students (Demand) ]  <---- (Aroom Platform) ---->  [ Agents / Landlords (Supply) ]
  • Wants verified rooms                              • Wants qualified student leads fast
  • Transparent pricing                               • Minimal listing friction
  • Protection from scams                             • No time-wasting calls
```

---

## 5. The 3 Pillars of the Codebase

When exploring the code in your file explorer, you will notice 3 primary pillars:

1. **`aroom-web/` (The Frontend)**
   - What the user sees on their screen (buttons, listing photos, cards, search filters, and total cost popups).
   - Built with **React**, **Vite**, and **Tailwind CSS**.

2. **`backend/` (The API Server)**
   - The brains and logic behind the scenes.
   - Handles account registration, calculates agent scores, coordinates WhatsApp webhooks, and manages search queries.
   - Built with **Node.js**, **Express**, and **TypeScript**.

3. **`supabase/` (The Database & Cloud Storage)**
   - The persistent memory of the system.
   - Stores tables of campuses, users, listings, photos, inquiries, and reviews.
   - Built with **PostgreSQL** and **Supabase**.

---

### ⏭️ Next Step:
Proceed to **[02-architecture-and-tech-stack.md](./02-architecture-and-tech-stack.md)** to see how these 3 pillars communicate with each other!

