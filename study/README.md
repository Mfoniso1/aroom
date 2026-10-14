# 🎓 Aroom Beginner Developer Study Guide

Welcome to the **Aroom Study Guide**! If you are new to software development, this guide is designed specifically for you.

Building modern web applications can feel overwhelming because there are so many moving parts: frontends, backends, databases, APIs, environment variables, Git, and third-party integrations like WhatsApp. 

This guide breaks down **the entire Aroom project into simple, beginner-friendly topics** using real-world analogies, clear diagrams, and file-by-file explanations.

---

## 🗺️ Learning Roadmap / Table of Contents

Follow these modules in order to build a solid mental model of how the entire system works:

| Module | File | What You Will Learn |
|---|---|---|
| **01** | [`01-project-overview.md`](./01-project-overview.md) | **The Big Picture:** What problem Aroom solves, client-server architecture, and the restaurant analogy. |
| **02** | [`02-architecture-and-tech-stack.md`](./02-architecture-and-tech-stack.md) | **The Tech Stack:** React, Node.js, Express, TypeScript, PostgreSQL, and Supabase explained simply. |
| **03** | [`03-database-and-supabase.md`](./03-database-and-supabase.md) | **The Database Layer (`supabase/`):** Tables, rows, columns, UUIDs, migrations, seeds, RLS security, and storage. |
| **04** | [`04-backend-api-and-whatsapp.md`](./04-backend-api-and-whatsapp.md) | **The Backend Layer (`backend/`):** REST APIs, HTTP methods, business logic services, and WhatsApp bot triage. |
| **05** | [`05-frontend-aroom-web.md`](./05-frontend-aroom-web.md) | **The Frontend Layer (`aroom-web/`):** React components, Props, State, Tailwind CSS, and the Move-In Cost Calculator. |
| **06** | [`06-developer-workflow-and-git.md`](./06-developer-workflow-and-git.md) | **Developer Workflow:** Git, GitHub, `.env` files, NPM scripts, and how to run everything locally. |

---

## 💡 How Software Actually Works (The 1-Minute Summary)

Think of Aroom like a **modern restaurant**:

1. **The Customer & Menu (Frontend - `aroom-web`):**
   - The student or agent visits the website on their browser or phone.
   - They look at property pictures, filter prices, and click buttons.
2. **The Waiter (Backend API - `backend`):**
   - When a user clicks "Book Inspection" or searches for a room, the waiter takes that request from the browser and brings it to the kitchen.
3. **The Pantry / Filing Cabinet (Database - `supabase`):**
   - Where all records are stored safely: who the users are, which rooms are available, photos, and reviews.
4. **The Food Delivery Courier (WhatsApp Bot):**
   - An alternative conversational interface that lets students order or ask questions straight from WhatsApp.

Let's begin by opening **[Module 01: Project Overview](./01-project-overview.md)**!

