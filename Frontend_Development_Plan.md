# Aroom Frontend Development Plan (React + Vite)

This document outlines the standard frontend architecture, technology stack, and phased implementation plan for the **Aroom** campus accommodation platform, utilizing a modern React Single Page Application (SPA).

## 1. The Frontend Tech Stack

Since the backend API (Fastify/NestJS) handles all core domain logic, the frontend will act strictly as a presentation and interaction layer. We are using a modern React SPA stack optimized for fast development and simple static hosting:

*   **Build Tool & Framework:** **Vite + React 18**. Vite provides instantaneous hot module replacement (HMR) and extremely fast build times compared to older tools like Create React App.
*   **Language:** **TypeScript** for strict type-checking, ensuring type safety with the backend API.
*   **Routing:** **React Router v6** for robust client-side routing.
*   **Styling:** **Tailwind CSS** for utility-first, responsive design.
*   **Component Library:** **shadcn/ui** for accessible, unstyled, and highly customizable Radix primitives.
*   **Forms & Validation:** **React Hook Form** + **Zod** (crucial for validating the fast-paced agent listing upload wizard).
*   **State & Data Fetching:** 
    *   **Axios** or **Fetch API** for interacting with the Fastify/NestJS backend.
    *   **TanStack React Query v5** for efficient client-side data fetching, caching, and background synchronization.
    *   **Zustand** (Optional) for simple global state management if needed (e.g., auth state).

---

## 2. Information Architecture (Folder Structure)

We will structure the React application logically, separating features into distinct modules to keep the codebase maintainable.

```text
aroom-web/
├── src/
│   ├── assets/                            # Static assets (images, icons)
│   ├── components/
│   │   ├── ui/                            # shadcn/ui generic components (buttons, inputs)
│   │   ├── layout/                        # Navbar, Footer, PageWrapper
│   │   └── shared/                        # Reusable domain components (TrustBadge, ListingCard)
│   ├── features/                          # Feature-based modules (Domain-driven)
│   │   ├── marketplace/                   # Student-facing search and listings
│   │   ├── agent/                         # Agent dashboard and 90-second listing wizard
│   │   ├── auth/                          # Login, Signup, OTP Verification
│   │   └── admin/                         # Moderator Trust & Safety console
│   ├── hooks/                             # Custom React hooks (e.g., useAuth)
│   ├── lib/                               # Utilities (axios instance, tailwind cn)
│   ├── routes/                            # React Router configuration
│   ├── types/                             # TypeScript interfaces (shared with backend)
│   ├── App.tsx                            # Main App component (Providers wrapper)
│   └── main.tsx                           # React DOM entry point
```

---

## 3. Development Phases (Sprints)

### Phase 1: Foundation & Scaffold
*   Bootstrap the React application using Vite (`npm create vite@latest aroom-web -- --template react-ts`).
*   Configure Tailwind CSS and initialize `shadcn/ui`.
*   Set up React Router with layout wrappers for public, agent-authenticated, and admin routes.
*   Configure Axios instance and TanStack React Query provider.
*   Create core UI components (Buttons, Inputs, Modals).

### Phase 2: The Marketplace (Student View)
*   Build the **Homepage** with the primary "Find a Room" search bar.
*   Build the **Search Grid** with client-side URL parameter syncing (for filtering by Campus, Budget, Room Type).
*   Build the **Listing Card** component emphasizing Trust Badges (`Verified` vs. `Unverified`).
*   Build the **Listing Detail Page** (image galleries, agent trust scores, "Book Inspection" CTA).

### Phase 3: The Agent Portal (Supply Side)
*   Build the Agent Onboarding flow (Phone OTP UI, ID document upload).
*   Build the **90-Second Listing Wizard** (Multi-step form using React Hook Form + Zod).
    *   *Step 1:* Core Details (Price, Type, Landmark).
    *   *Step 2:* Photo Upload.
    *   *Step 3:* Confirmation & Instant "Unverified - New" publication.
*   Build the **Agent Dashboard** to manage listings and view incoming student inquiries.

### Phase 4: Integration & Polish
*   Connect the frontend to the Fastify/NestJS backend REST API endpoints.
*   Implement JWT authentication flows (login, persisting session, route guards).
*   Implement loading states and skeleton loaders.
*   Handle global error states, Toast notifications, and form submission feedback.
*   Prepare for static deployment (Vercel, Cloudflare Pages, or Netlify).
