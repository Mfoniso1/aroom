# 🛠️ Aroom Project — Dev Log

> This file is updated after every task completed on the project.
> Each entry explains **what was asked**, **what was changed**, **which files** were touched, and **what coding concept** was used — linking back to `curriculum.md`.

---

## Entry 001 — Splash Screen Fix
**Date:** 2026-10-06  
**Task:** The loading/splash screen was not showing when the website opened.

### What was wrong
- `App.tsx` used `sessionStorage` to remember if the splash had been seen.
  `sessionStorage` survives browser tab refreshes (F5), so after the first view
  the splash was permanently blocked — `showSplash` was always `false`.
- Inside `SplashScreen.tsx`, the logo fly-to-navbar transforms were being set
  **inside a React state updater function** (`setPhase(prev => { setEmblemTransform(...) })`).
  React 19 forbids side-effects inside updaters, so the transforms were silently
  thrown away and the logo never flew anywhere.
- `transformOrigin: '0 0'` was set but the logo was centred, so the scale
  calculation was wrong and the logo landed in the wrong spot.

### What was changed

#### `src/App.tsx`
```ts
// BEFORE — blocked on refresh:
const [showSplash, setShowSplash] = useState(() => {
  return !sessionStorage.getItem('aroom_splash_seen')
})

// AFTER — always shows on fresh load:
const [showSplash, setShowSplash] = useState(true)
```
**Curriculum link → Module 3.1 (useState)**

---

#### `src/components/shared/SplashScreen.tsx`
```ts
// BEFORE — side-effect inside updater (React 19 violation):
setPhase((prev) => {
  if (prev !== 'docking') {
    setEmblemTransform(...)   // ← NOT allowed here
  }
  return 'docking'
})

// AFTER — moved to a dedicated useEffect that watches phase:
useEffect(() => {
  if (phase !== 'docking' || dockingTriggered.current) return
  dockingTriggered.current = true
  const dx = tRect.left - cRect.left
  const dy = tRect.top  - cRect.top
  setLockupTransform(`translate(${dx}px, ${dy}px)`)
  setLockupScale(scaleVal)
}, [phase])
```
**Curriculum link → Module 3.3 (useEffect), Module 3.4 (useRef + DOM)**

---

### Files changed
| File | What changed |
|---|---|
| `src/App.tsx` | Removed `sessionStorage`, simplified to `useState(true)` |
| `src/components/shared/SplashScreen.tsx` | Full rewrite — fixed React state bug, fixed transform origin, unified logo into one flying `div` |

### Build result
✅ 0 TypeScript errors — `npm run build` passed

---

## Entry 002 — Slow Down Logo Flight Animation
**Date:** 2026-10-06  
**Task:** The logo was merging into the navbar too fast. Reduce the speed of that animation.

### What was changed

#### `src/components/shared/SplashScreen.tsx`
```ts
// BEFORE — fast flight (0.85 seconds):
transition: isDocking
  ? 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease'
  : 'none',

// AFTER — slower, more graceful (1.5 seconds):
transition: isDocking
  ? 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.1s ease'
  : 'none',
```

#### Default `duration` increased from `3200ms` → `4200ms`
The splash must stay mounted long enough for the animation to finish.
- Dock phase starts at `2200ms`
- Flight takes `1500ms`
- Minimum alive time: `2200 + 1500 = 3700ms`
- New duration set to `4200ms` (300ms buffer after landing)

```
Timeline:
0ms      → Logo strokes draw in
900ms    → "Aroom" wordmark fades up
2200ms   → Logo begins flying to navbar  ← docking starts here
3700ms   → Logo lands in navbar          ← flight complete
4200ms   → Splash unmounts, landing page takes over
```

**Curriculum link → Module 5.3 (Inline styles), Module 3.3 (useEffect timers)**

### Files changed
| File | What changed |
|---|---|
| `src/components/shared/SplashScreen.tsx` | Transition `0.85s` → `1.5s`, opacity `0.6s` → `1.1s`, default duration `3200` → `4200` |
| `src/App.tsx` | `duration={3200}` → `duration={4200}` |

### Build result
✅ Hot-reloaded via Vite dev server — no errors

---

_New entries will be added below as work continues._

---

## Entry 003 — Navbar Buttons Redesign
**Date:** 2026-10-06  
**Task:** Add a "Home" button, rename "Browse Rooms" to "Explore" button, add "Log In" and "Sign Up" buttons to the navbar.

### What was changed

#### `src/components/layout/MainLayout.tsx` — nav section
```tsx
// BEFORE:
<nav className="flex items-center gap-6">
  <Link to="/search">Browse Rooms</Link>
  <Link to="/portal" className="...bg-slate-900...">Agent Portal</Link>
</nav>

// AFTER:
<nav className="flex items-center gap-2">
  <Link to="/">Home</Link>                    // ghost button, goes to home
  <Link to="/search">Explore</Link>           // soft emerald button (was Browse Rooms)
  <span aria-hidden="true" />                 // visual divider line
  <Link to="/login">Log In</Link>             // ghost button
  <Link to="/signup">Sign Up</Link>           // solid emerald CTA button
</nav>
```

**Visual hierarchy used:**
| Button | Style | Why |
|---|---|---|
| Home | Ghost (no background) | Least important — you're already here |
| Explore | Soft emerald outline | Important discovery action |
| Log In | Ghost | Secondary auth action |
| Sign Up | Solid emerald | Primary CTA — most important |

#### `src/App.tsx` — new routes added
```tsx
<Route path="/login"  element={<MainLayout>...</MainLayout>} />
<Route path="/signup" element={<MainLayout>...</MainLayout>} />
```
Without these, clicking Log In / Sign Up would land on the 404 page.
Both show a "coming soon" placeholder until the auth pages are built.

**Curriculum link → Module 2.2 (Props), Module 4.1 (Routes), Module 4.2 (Link), Module 5.1 (Tailwind classes)**

### Files changed
| File | What changed |
|---|---|
| `src/components/layout/MainLayout.tsx` | Navbar rebuilt with 4 buttons + divider |
| `src/App.tsx` | Added `/login` and `/signup` routes |

### Build result
✅ Hot-reloaded via Vite — no errors

---

## Entry 004 — Room Photos Downloaded + Hero Background
**Date:** 2026-10-06  
**Task:** Search the web for 10 clean/neat room/house photos, save them to a folder, and use one as the homepage hero background.

### What was done

#### Step 1 — Created the images folder
```
aroom-web/public/images/rooms/
```
Files in `public/` are served directly by Vite at the root URL (e.g. `/images/rooms/room-01-apartment.jpg`).

#### Step 2 — Downloaded 10 photos from Unsplash (free, no copyright)
| File | Subject |
|---|---|
| `room-01-apartment.jpg` | Modern apartment interior ← **used as hero** |
| `room-02-bedroom.jpg` | Clean single bedroom |
| `room-03-modern-bedroom.jpg` | Modern styled bedroom |
| `room-04-bright-bedroom.jpg` | Bright white bedroom |
| `room-05-hotel-style.jpg` | Hotel-style room |
| `room-06-living-room.jpg` | Living room interior |
| `room-07-sofa-lounge.jpg` | Sofa lounge area |
| `room-08-clean-bedroom.jpg` | Clean tidy bedroom |
| `room-09-cozy-room.jpg` | Cozy study room |
| `room-10-kitchen.jpg` | Clean kitchen |

Downloaded using PowerShell `Invoke-WebRequest` with Unsplash CDN URLs.

#### Step 3 — Applied as hero background in `HomePage.tsx`
```tsx
// BEFORE — plain CSS gradient:
<div className="relative bg-linear-to-b from-green-700 via-green-800 to-green-900 ...">

// AFTER — real photo with dark overlay:
<div className="relative py-24 px-4 ... min-h-150 flex items-center">
  {/* The photo */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('/images/rooms/room-01-apartment.jpg')" }}
  />
  {/* Dark green overlay to keep text readable */}
  <div className="absolute inset-0 bg-linear-to-b from-green-950/80 via-green-900/75 to-green-950/90" />
  ...content on top (z-10)...
</div>
```

**Why the overlay?** A dark semi-transparent gradient sits between the photo and the text. This keeps the white headline easy to read regardless of what the photo shows. The overlay uses the brand emerald-green colour so it still feels on-brand.

**Curriculum link → Module 5.3 (Inline styles — backgroundImage), Module 5.1 (Tailwind — absolute, inset-0, bg-cover, z-10)**

### Files changed
| File | What changed |
|---|---|
| `public/images/rooms/` | New folder — 10 JPG photos added |
| `src/features/marketplace/pages/HomePage.tsx` | Hero section: gradient → photo + overlay |

### Build result
✅ Hot-reloaded via Vite — no errors



---

## Entry 005 — Sign Up Role Selection Page
**Date:** 2026-10-12  
**Task:** Build a real Sign Up page with three role options: Student, Landlord, Agent.

### What was built

Created `src/features/auth/pages/SignUpPage.tsx` — a role-picker page with three interactive cards.

#### How it works
1. User lands on `/signup`
2. Three cards are shown — **Student**, **Landlord**, **Agent**
3. Hovering over a card reveals a list of perks for that role
4. Clicking a card selects it (card border highlights, checkmark appears)
5. The **Continue** button activates only after a role is chosen
6. Clicking Continue navigates to `/signup/student`, `/signup/landlord`, or `/signup/agent` (those forms are "coming soon" placeholders until built)

#### Card details
| Role | Badge | Icon colour | Who it's for |
|---|---|---|---|
| Student | Most Popular | Emerald green | Finding rooms near campus |
| Landlord | List & Earn | Amber/gold | Listing their own property |
| Agent | Earn Commission | Violet purple | Managing listings for landlords |

#### Code concept — `useState` to track selected role
```tsx
// A state variable stores which role the user clicked
const [selected, setSelected] = useState<Role | null>(null)

// When a card is clicked, we save the role
onClick={() => setSelected(role.id)}

// The Continue button is disabled until a role is selected
disabled={!selected}
```

#### Code concept — Conditional styling
```tsx
// The card border changes based on whether it is selected
className={isSelected ? role.cardBorder : 'border-slate-200'}

// The perks list slides open using max-height animation
className={isActive ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
```

**Curriculum link → Module 2.1 (useState), Module 2.3 (Conditional rendering), Module 5.1 (Tailwind dynamic classes)**

### Files changed
| File | What changed |
|---|---|
| `src/features/auth/pages/SignUpPage.tsx` | **New file** — full role-picker page |
| `src/App.tsx` | Imported `SignUpPage`; replaced placeholder `/signup` route; added `/signup/:role` sub-route |

### Build result
✅ Vite dev server running at http://localhost:5174/ — no errors

---

## Entry 006 — Student Registration Form
**Date:** 2026-10-12  
**Task:** Build the student sign-up form with Gmail option, all required fields, validation, and a password strength meter.

### What was built

Created `src/features/auth/pages/StudentRegisterPage.tsx`.

#### Fields on the form
| Field | Type | Notes |
|---|---|---|
| Profile photo | File upload (optional) | Live preview in circular avatar |
| Full Name | Text input | Required |
| Email Address | Email input | Validated format |
| Phone Number | Tel input | Nigerian mobile format (070/080/090…) |
| University / Campus | Dropdown | All 10 campuses from `campuses.ts` |
| Matric / Student ID | Text input | Required, auto-uppercase |
| Password | Password input | Min 8 chars, show/hide toggle |
| Confirm Password | Password input | Must match password |
| Terms checkbox | Checkbox | Must be checked to submit |

#### Google Sign-Up button
```tsx
<button onClick={() => alert('Google OAuth — coming soon!')}>
  <svg>...Google logo...</svg>
  Continue with Google
</button>
```
The button is visible and styled — the actual Google login needs a backend (Firebase/Auth.js) to work. Clicking it shows an alert for now.

#### Inline validation
```tsx
const validate = (): FormErrors => {
  const e: FormErrors = {}
  if (!form.fullName.trim()) e.fullName = 'Full name is required'
  if (!validateEmail(form.email)) e.email = 'Enter a valid email address'
  // ... etc
  return e
}
```
Errors appear below each field in red only after the user tries to submit. Fixing a field clears its error immediately.

#### Password strength meter
```tsx
function passwordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++   // long enough?
  if (/[A-Z]/.test(pw)) score++ // has uppercase?
  if (/[0-9]/.test(pw)) score++ // has a number?
  if (/[^A-Za-z0-9]/.test(pw)) score++ // has a symbol?
  // score 1=Weak, 2=Fair, 3=Good, 4=Strong
}
```
4 coloured bars fill up as the password gets stronger.

**Curriculum link → Module 2.1 (useState), Module 2.4 (Forms & onChange), Module 3.1 (Validation logic), Module 5.1 (Tailwind)**

### Files changed
| File | What changed |
|---|---|
| `src/features/auth/pages/StudentRegisterPage.tsx` | **New file** — full registration form |
| `src/App.tsx` | Added `/signup/student` route using `StudentRegisterPage` |

### Build result
✅ Vite hot-reload — no TypeScript errors

---

## Entry 007 — Global House Background on All Pages
**Date:** 2026-10-12  
**Task:** Make every page show a house/room photo as the background to visually communicate what the app is about.

### What was done

#### Step 1 — Downloaded house exterior photos
Two new photos added to `public/images/rooms/`:
- `house-01-exterior.jpg` — modern house exterior ← **used as global background**
- `house-02-modern.jpg` — sleek modern home exterior

#### Step 2 — Applied fixed background to `MainLayout.tsx`

The background uses CSS `position: fixed` (Tailwind: `fixed`) so the photo stays perfectly still while the page content scrolls over it — like a window showing the house behind everything.

```tsx
{/* The house photo — fixed behind everything */}
<div
  className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/images/rooms/house-01-exterior.jpg')" }}
  aria-hidden="true"
/>

{/* White overlay — keeps text readable */}
<div className="fixed inset-0 -z-10 bg-white/80 backdrop-blur-[2px]" aria-hidden="true" />
```

**Why two layers?**
| Layer | What it does |
|---|---|
| Photo div | Shows the house image, fills the whole screen |
| Overlay div | Adds white at 80% opacity — like frosted glass — so text on top is always readable |

**Key Tailwind classes learned:**
| Class | Meaning |
|---|---|
| `fixed inset-0` | Position at all 4 edges of the screen (top, right, bottom, left = 0) |
| `-z-10` | Send it behind all other content (negative z-index) |
| `bg-cover` | Scale the photo to always fill the whole screen |
| `bg-center` | Keep the photo centred |
| `bg-white/80` | White colour at 80% transparency |
| `backdrop-blur-[2px]` | Slight blur to soften the photo |

**Curriculum link → Module 5.1 (Tailwind — fixed, z-index, bg-cover), Module 5.3 (Inline styles — backgroundImage)**

### Files changed
| File | What changed |
|---|---|
| `public/images/rooms/house-01-exterior.jpg` | New photo — house exterior |
| `public/images/rooms/house-02-modern.jpg` | New photo — modern home exterior |
| `src/components/layout/MainLayout.tsx` | Added fixed background photo + white overlay behind all pages |

### Build result
✅ Vite hot-reload — no errors. Background appears on Home, Search, Sign Up, Register, and all other pages.

---

## Entry 008 — Unique Page Backgrounds with Soft Transparency
**Date:** 2026-10-12  
**Task:** Make the background pictures have transparent overlays, and give every page its own unique room/house view.

### What was built

1. **Created `src/components/shared/PageBackground.tsx`**:
   - Accepts an `image` prop and an optional `overlayClass` prop.
   - Sets a fixed, full-viewport background image with gentle soft overlay (`bg-white/65 - bg-white/75` or transparent dark wash) so text and cards remain crystal clear.

2. **Assigned unique house & room images across pages**:
   | Page | URL | Unique Picture | View / Feel |
   |---|---|---|---|
   | **Home** | `/` | `house-01-exterior.jpg` | Verified modern house exterior |
   | **Explore / Search** | `/search` | `room-06-living-room.jpg` | Clean living room / shared flat atmosphere |
   | **Sign Up (Role Selection)** | `/signup` | `house-02-modern.jpg` | Contemporary building structure |
   | **Student Registration** | `/signup/student` | `room-04-bright-bedroom.jpg` | Bright student bedroom |
   | **Listing Detail** | `/listings/:id` | `room-03-modern-bedroom.jpg` | Modern executive bedroom |

3. **Curriculum Link**:
   - `curriculum.md` → Module 2.2 (Reusing components with Props) & Module 5.1 (Tailwind layered positioning `-z-10`, `fixed`, `backdrop-blur`).

### Verification & Build
- `npm run build` completed with 0 errors.
- Dev server running live on `http://localhost:5174/`.

---

## Entry 009 — High-Quality Full-Coverage Hero Backgrounds on All Pages
**Date:** 2026-10-12  
**Task:** Use a high-quality, relevant background image that covers the entire hero section. Ensure `background-size: cover`, `background-position: center`, and ensure the image fills the section without stretching or distortion across all pages.

### What was done

1. **Created `src/components/shared/HeroSection.tsx`**:
   - Explicitly configured with CSS `background-size: cover`, `background-position: center`, and `background-repeat: no-repeat`.
   - Prevents stretching, distortion, or pixelation while filling the entire hero header area.
   - Includes custom contrast-preserving gradient overlays (`from-slate-950/85 via-emerald-950/80 to-slate-900/90`) so all text, badges, and search inputs remain highly legible.

2. **Applied across all pages**:
   | Page | URL | Hero Image | Hero Focus |
   |---|---|---|---|
   | **Home** | `/` | `room-01-apartment.jpg` | Main campus apartment hero + search bar |
   | **Explore** | `/search` | `room-06-living-room.jpg` | Verified student housing header |
   | **Sign Up** | `/signup` | `house-02-modern.jpg` | Modern account onboarding hero |
   | **Student Register** | `/signup/student` | `room-04-bright-bedroom.jpg` | Clean student accommodation header |
   | **Listing Details** | `/listings/:id` | `listing.imageUrl` | The specific property photo in full hero resolution |

3. **Curriculum Link**:
   - `curriculum.md` → Module 5.1 (Tailwind Responsive Sizing & Alignment), Module 5.3 (CSS background cover, center, no-repeat).

### Verification
- Production build `npm run build` completed cleanly in 3.33s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 010 — Semi-Transparent Black Overlay (45–60%) with Layered Gradient
**Date:** 2026-10-12  
**Task:** Add a semi-transparent black overlay over the background image using a layered gradient / overlay with approximately 45–60% opacity based on image brightness to ensure foreground text is highly readable while preserving visual details.

### What was done

1. **Enhanced `HeroSection.tsx`**:
   - Added `blackOverlayOpacity` property (clamped to the 40–65% range, defaulting to 50–54%).
   - Integrated layered CSS pseudo-overlay combining:
     - Base semi-transparent black overlay (`rgba(0, 0, 0, opacity)`).
     - Layered darkening vertical gradient:
       `linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.55) 50%, rgba(0, 0, 0, 0.60) 100%)`.
   - Result: All text (headlines, subtitles, badges, inputs) is crisp and WCAG compliant for contrast, without losing the architectural details and textures of the houses and rooms.

2. **Calibrated Opacity by Image Brightness across All Pages**:
   - **Home (`/`)**: `blackOverlayOpacity={50}` + subtle dark emerald tint to match brand colors.
   - **Explore (`/search`)**: `blackOverlayOpacity={52}` + layered 48–62% vertical black gradient.
   - **Sign Up (`/signup`)**: `blackOverlayOpacity={50}` on modern house exterior.
   - **Student Register (`/signup/student`)**: `blackOverlayOpacity={54}` (compensated for the bright white bedroom image).
   - **Listing Detail (`/listings/:id`)**: `blackOverlayOpacity={48}` for rich photo details.

3. **Curriculum Link**:
   - `curriculum.md` → Module 5.2 (CSS pseudo-layers & opacity blending), Module 5.3 (Color contrast & accessibility).

### Verification
- Production build `npm run build` succeeded in 3.73s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 011 — Full-Page Semi-Transparent Black Overlay (45–60%) Across All Pages
**Date:** 2026-10-12  
**Task:** Apply the semi-transparent black overlay (45–60% opacity) with layered gradient to the full background of all pages so the background is darkened enough for foreground elements to be highly readable while retaining building and interior details.

### What was done

1. **Upgraded `PageBackground.tsx`**:
   - Replaced earlier white overlay with a layered semi-transparent black overlay:
     - Base color: `rgba(0, 0, 0, opacity)` with `blackOverlayOpacity` configured between 45% and 60%.
     - Layered subtle gradient: `linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.52) 50%, rgba(0, 0, 0, 0.60) 100%)`.
   - Darkens the entire page background without washing out or distorting photographic details.

2. **Calibrated Per-Page Values for Balanced Contrast**:
   - **Home (`/`)**: 50% black overlay on `house-01-exterior.jpg`.
   - **Explore / Search (`/search`)**: 52% black overlay on `room-06-living-room.jpg`.
   - **Sign Up (`/signup`)**: 50% black overlay on `house-02-modern.jpg`.
   - **Student Register (`/signup/student`)**: 54% black overlay on `room-04-bright-bedroom.jpg`.
   - **Listing Details (`/listings/:id`)**: 48% black overlay on `room-03-modern-bedroom.jpg`.

3. **Curriculum Link**:
   - `curriculum.md` → Module 5.2 (Layered gradients & transparency in UI), Module 5.3 (Accessibility & text contrast).

### Verification
- Production build `npm run build` completed in 1.91s with 0 errors.
- Dev server running live on `http://localhost:5174/`.

---

## Entry 012 — Centered Hero Section Layout Across All Pages
**Date:** 2026-10-12  
**Task:** Ensure the hero section is perfectly centered both horizontally and vertically across all pages.

### What was done

1. **Enhanced `HeroSection.tsx`**:
   - Updated the outer hero container to enforce `flex flex-col items-center justify-center text-center`.
   - Updated the inner `max-w-5xl mx-auto` content container with `flex flex-col items-center justify-center text-center px-4`.
   - Guaranteed that whether custom classes or heights are specified, children always align to the center axis.

2. **Standardized Page Hero Inner Blocks**:
   - **Home (`/`)**: Centered trust badge pill, animated headline, subtitle, search form (`w-full max-w-3xl mx-auto`), and trust checkmarks.
   - **Explore / Search (`/search`)**: Added `flex flex-col items-center justify-center text-center` to badge, title, and description.
   - **Sign Up (`/signup`)**: Centered onboarding title and description.
   - **Student Register (`/signup/student`)**: Centered student account badge, heading, and subtitle.
   - **Listing Details (`/listings/:id`)**: Centered verification badge, property title, landmark, and availability indicators.

3. **Curriculum Link**:
   - `curriculum.md` → Module 5.1 (Flexbox alignment with `items-center`, `justify-center`, and `text-center`).

### Verification
- Production build `npm run build` completed cleanly in 1.80s with 0 errors.
- Dev server running live on `http://localhost:5174/`.

---

## Entry 013 — Professional Font Upgrade, High-Visibility Listings Header & Zero Photo Division
**Date:** 2026-10-12  
**Task:**
1. Make the "Recently Added Near You" heading text significantly more visible with an appropriate, professional font tailored for our proptech / student housing platform.
2. Eliminate the photo division / horizontal seam occurring on pages across the site.

### Root Cause Analysis of "Photo Division"
- Each page was simultaneously rendering **two competing image layers**:
  1. `PageBackground`: Fixed fullscreen background image (`fixed inset-0`).
  2. `HeroSection`: Its own independent `backgroundImage` block ending abruptly at min-height (`min-h-120`/`min-h-150`).
- On the Home page, the hero displayed an apartment room (`room-01-apartment.jpg`), while the rest of the page displayed an exterior house (`house-01-exterior.jpg`). At the bottom boundary of the hero, a harsh horizontal dividing line cut across the screen.
- On other pages, because the hero's local image scrolled while the background stayed fixed, an optical dividing seam appeared between the top section and the rest of the page.

### What was done

1. **Professional Font Integration (Plus Jakarta Sans)**:
   - Added Google Fonts `<link>` for **Plus Jakarta Sans** (weights 300 to 800) in `index.html`.
   - Configured `--font-sans` in `src/index.css` via `@theme` and set default `body` font family to Plus Jakarta Sans.
   - Provides clean, modern geometric letterforms standard in modern property tech platforms (e.g., Airbnb).

2. **High-Visibility "Recently Added Near You" Section**:
   - Encapsulated the listings section in an elevated frosted glass container (`bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/60 shadow-2xl`).
   - "Recently Added Near You" heading is now prominent in `text-slate-900 font-extrabold text-3xl sm:text-4xl tracking-tight`.
   - Added an emerald uppercase badge pill (`Verified Student Accommodations`) above the heading.
   - Upgraded subtitle to crisp `text-slate-600` and the button to a high-contrast emerald CTA button (`bg-emerald-600 hover:bg-emerald-700 text-white font-bold`).

3. **Complete Elimination of Photo Division**:
   - Refactored `HeroSection.tsx` so the `image` prop is optional. When omitted, `HeroSection` seamlessly inherits the unified page background without rendering a separate cutting box.
   - Each page now has **one single, continuous, full-bleed photograph**:
     - **Home (`/`)**: Unified `room-01-apartment.jpg` across the entire page (zero exterior/interior split).
     - **Explore (`/search`)**: Unified `room-06-living-room.jpg` with continuous dark overlay.
     - **Sign Up (`/signup`)**: Unified `house-02-modern.jpg`.
     - **Student Register (`/signup/student`)**: Unified `room-04-bright-bedroom.jpg`.
     - **Listing Details (`/listings/:id`)**: Unified `listing.imageUrl`.

### Curriculum Link
- `curriculum.md` → Module 5.1 (Typography with Google Fonts & Tailwind @theme), Module 5.2 (Unified page layering vs. nested image clipping).

### Verification
- Production build `npm run build` completed in 1.54s with 0 errors.
- Dev server running live on `http://localhost:5174/`.

---

## Entry 014 — Canonical Tailwind Classes & Nigerian Academic Dictionary Updates
**Date:** 2026-10-12  
**Task:** Resolve Tailwind canonical class suggestions (`flex-shrink-0` -> `shrink-0`) and add Nigerian student/academic terms (`matric`, `Matric`, `Chukwuemeka`) to cSpell dictionaries.

### What was resolved

1. **Tailwind Canonical Classes (`shrink-0`)**:
   - Replaced all 4 instances of legacy `flex-shrink-0` with canonical `shrink-0`:
     - `SignUpPage.tsx` (role perks checklist)
     - `StudentRegisterPage.tsx` (alert icons on lines 93 and 457, terms checkbox on line 442)

2. **Project Dictionaries (`.cspell.json`)**:
   - Added Nigerian university terms and student names into both root `.cspell.json` and `aroom-web/.cspell.json`:
     - `"Chukwuemeka"` (Nigerian student placeholder name)
     - `"Matric"` / `"matric"` (matriculation / student ID number)

### Curriculum Link
- `curriculum.md` → Module 5.1 (Tailwind utility shorthand standards: `shrink-0`, `grow`), Project hygiene.

### Verification
- Production build `npm run build` passed with 0 errors in 2.08s.
- Linter diagnostics fully cleared.

---

## Entry 015 — Universal Back Buttons, Student Dashboard & Landlord Registration
**Date:** 2026-10-14  
**Task:** 
1. Add a back button below content on each page of the website to return to the previous page.
2. Create a dedicated Student Dashboard (`/student/dashboard`) and take students there upon login.
3. Create a Landlord sign-up form with email auto-suggestion for First/Last name, property kinds owned, campus locations, and phone OTP verification.

### What was built

1. **Universal Back Navigation ([`BackButton.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/BackButton.tsx))**:
   - Built a reusable `BackButton` component that calls `navigate(-1)` using `useNavigate()`, falling back to `/` if there is no previous history.
   - Embedded into [`MainLayout.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/layout/MainLayout.tsx) so every page automatically renders a back button below content (hidden on the home page).
   - Embedded into [`AgentLayout.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/layout/AgentLayout.tsx) to provide quick navigation back to the marketplace or previous pages.

2. **Student Dashboard ([`StudentDashboardPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/student/pages/StudentDashboardPage.tsx))**:
   - Shows verified student profile (Matric number, campus, department).
   - Saved room bookmarks with removal controls and direct links to listing details.
   - Upcoming free physical inspection booking slots.
   - Scam protection guarantee highlights.

3. **Landlord Registration Form ([`LandlordRegisterPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/auth/pages/LandlordRegisterPage.tsx))**:
   - **Step 1 (Account & Auto-suggestion):** Parses the email (e.g., `emeka.okafor@gmail.com`) and offers a one-click badge to auto-fill First Name ("Emeka") and Last Name ("Okafor"). Password strength indicator included.
   - **Step 2 (Phone & OTP Verification):** Validates 11-digit Nigerian mobile numbers and provides a simulated 6-box OTP entry with auto-focus.
   - **Step 3 (Property Kinds & Locations):** Multi-select property types (Self-Contain, Single Rooms, Flats, Entire Lodges) and campus location tags (Choba, Alakahia, Aluu, Back of Chem, Akoka, Ugbowo, etc.).
   - **Step 4 (Completion):** Instant confirmation leading directly to `/portal/dashboard`.

4. **Unified Login Portal ([`LoginPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/auth/pages/LoginPage.tsx))**:
   - Role switcher for **Student**, **Agent**, and **Landlord**.
   - Student login navigates directly to `/student/dashboard`.
   - Agent/Landlord login navigates directly to `/portal/dashboard`.

### Curriculum Link
- `curriculum.md` → Module 4.1 (React Router navigation & history stack `navigate(-1)`), Module 3.2 (Controlled form inputs & smart string parsing), Module 3.3 (Multi-step wizards & role-based routing).

### Verification
- Production build `npm run build` executed cleanly in 2.05s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 016 — Customized Student Physical Inspection Scheduling
**Date:** 2026-10-14  
**Task:** Customize the student room inspection scheduling workflow across listing details and the student dashboard.

### What was built

1. **Inspection Scheduling Modal ([`InspectionScheduleModal.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/InspectionScheduleModal.tsx))**:
   - **Date Picker**: Direct choice across 5 practical options (*Today*, *Tomorrow*, *In 2 days*, *Weekend*, *Next Week*).
   - **Time Slots**: Distinct daylight and study-schedule slots (*10:00 AM Morning*, *1:30 PM Midday/Lecture Break*, *4:00 PM Late Afternoon*, *5:30 PM Evening*).
   - **Meeting Point Selector**: Safe meeting location choices (*Campus Main Gate*, *Directly in front of Lodge*, *Nearby Popular Landmark/Junction*).
   - **Companion & Safety Preferences**: Option to declare if visiting with a classmate, parent, or alone, with phone SMS confirmations and zero-fee policy reminders.

2. **Listing Details Integration ([`ListingDetailPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/marketplace/pages/ListingDetailPage.tsx))**:
   - Replaced static button with interactive "Customize & Book Inspection" CTA.
   - Shows live confirmation card upon booking with options to reschedule or view inside the student dashboard.

3. **Student Dashboard Live Management ([`StudentDashboardPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/student/pages/StudentDashboardPage.tsx))**:
   - Added interactive "Inspect" / "Reschedule" actions directly on saved listing cards.
   - Quick "Reschedule" button in the upcoming inspections banner that opens the scheduling modal and updates the slot instantly.

### Curriculum Link
- `curriculum.md` → Module 3.2 (Modal workflows, controlled selection state, composite booking structures), Module 4.2 (Two-way synchronization between marketplace items and user dashboard states).

### Verification
- Production build `npm run build` completed in 1.53s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 017 — Immediate Inspection Calls, WhatsApp Reminders & Automated Alternative Matcher
**Date:** 2026-10-14  
**Task:** Customize student physical inspection scheduling with:
1. Immediate calling option to the agent if already nearby.
2. Scheduled inspection emphasizing "the earlier, the better".
3. Automatic WhatsApp reminders 45 mins and 15 mins before time.
4. Automatic "Room Taken" notification with instant suggestions of alternative verified rooms matching budget and campus location.

### What was built

1. **Dual-Mode Inspection ([`InspectionScheduleModal.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/InspectionScheduleModal.tsx))**:
   - **Mode A: "Call Agent Now (Immediate)"**: Allows students near campus to trigger a direct phone call to the agent to inspect the lodge immediately, logging the call on Aroom to protect against extortion or inspection fees.
   - **Mode B: "Schedule Inspection (Earlier is Better)"**: Prominently highlights that campus rooms move within 24–48 hours, encouraging students to choose the nearest slot.
   - **WhatsApp Automation Checkbox**: Opt-in toggle to receive automated WhatsApp pings **45 mins** and **15 mins** before inspection with meeting point directions and live agent contact.

2. **Automated "Room Taken" Fallback Banner ([`StudentDashboardPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/student/pages/StudentDashboardPage.tsx))**:
   - Displays an automated WhatsApp alert banner when an inspection room is rented out before the scheduled walkthrough.
   - Immediately presents **two verified alternative rooms** matching the exact student budget and campus landmark so the student does not make a wasted trip.

### Curriculum Link
- `curriculum.md` → Module 4.3 (WhatsApp Bot & Triage Integration patterns), Module 3.4 (Fallback UI states & urgent status changes).

### Verification
- Production build `npm run build` completed in 1.70s with 0 errors.
- Dev server running on `http://localhost:5174/`.




---

## Entry 018 — Automated Fee Breakdowns (15% Agency & Landlord Direct) + Dashboard Auth Nav Removal
**Date:** 2026-10-14  
**Task:**
1. Agent listing space creation with required and auto-calculated fees:
   - Annual Rent
   - Caution fee
   - Legal fee
   - Agency fee (automatically calculated as 15% of annual rent)
   - Utility fee (optional toggle)
   - Inspection fee (₦0 free inspection policy)
   - Dynamic Total Move-In Package sum.
2. Direct Landlord listing form:
   - Rent, caution, legal, utilities fee.
   - Direct landlord total package (zero agency fee).
3. Dashboard Navbar clean up:
   - When entering any user dashboard (`/student/*` or `/portal/*`), the `Log In` and `Sign Up` buttons automatically disappear and are replaced with portal status tags and a logout button.

### What was built

1. **Agent Listing Fee Breakdown ([`NewListingPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/NewListingPage.tsx))**:
   - **Form Fields**: Annual Rent, Caution Fee, Legal Fee, Optional Utility Checkbox + Fee, and Inspection Fee (fixed at ₦0 with scam-free guarantee tag).
   - **Automated 15% Agency Calculation**: Dynamically computes `rent * 0.15` as the user types their annual rent, preventing manual arithmetic errors or arbitrary agent markup.
   - **Real-Time Total Package Card**: Live sticky calculation showing the full move-in package summary:
     $$\text{Total Move-In} = \text{Rent} + \text{Caution} + \text{Legal} + \text{Agency (15\%)} + \text{Utility}$$

2. **Landlord Direct Listing Form ([`LandlordNewListingPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/LandlordNewListingPage.tsx))**:
   - Tailored specifically for verified property owners.
   - Includes Rent, Caution Fee, Legal Fee, and Utilities Fee with zero agency fee.
   - Shows a direct landlord total move-in package calculation.
   - Accessible from `/portal/landlord/new` and directly linked from the Agent/Landlord Dashboard quick actions.

3. **Dashboard Navbar Cleanup ([`MainLayout.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/layout/MainLayout.tsx))**:
   - Detects when the user is visiting `/student` or `/portal`.
   - Hides the generic `Log In` and `Sign Up` buttons.
   - Displays a contextual portal badge ("Student Portal" or "Agent & Landlord Portal") and an active "Log out" button.

### Curriculum Link
- `curriculum.md` → Module 3.2 (Computed state & real-time math calculations in React), Module 4.1 (Conditional navigation rendering based on route paths `location.pathname`).

### Verification
- Production build `npm run build` executed cleanly in 1.58s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 019 — Student Dashboard Dedicated Navbar & Continuous Right-to-Left Ticker Animation
**Date:** 2026-10-14  
**Task:**
1. Customize the navigation bar for the student dashboard:
   - Remove the `Log In` and `Sign Up` buttons since user is authenticated.
   - Keep the `Home` and `Explore` buttons.
   - Maintain the Aroom logo and brand name.
2. Build a continuous animated text transition between:
   - *"Keep track of your space"*
   - *"Secure a space now"*
   - Sliding in from the right to the left-middle of the dashboard continuously until the user leaves.
3. Remove the redundant inner second header from the student dashboard and replace it with a full-width dashboard live banner.

### What was built

1. **Continuous Ticker Component ([`DashboardTicker.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/DashboardTicker.tsx))**:
   - Supports both `compact` (navbar pill with pulse indicator) and `banner` (full-width hero ribbon) variants.
   - Cycles between *"Keep track of your space"* and *"Secure a space now"* every 3.8s.
   - Hardware-accelerated CSS keyframe `@keyframes tickerRightToLeft` in `src/index.css` bringing the text from `translateX(65px)` with soft blur into `translateX(0)` in the left-middle.

2. **Unified Navbar Integration ([`MainLayout.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/layout/MainLayout.tsx))**:
   - Maintains Aroom logo & name.
   - Embeds the `DashboardTicker` in the navbar center/left-middle on student routes.
   - Keeps `Home`, `Explore`, and adds a quick `Log out` action.
   - Hides `Log In` and `Sign Up` buttons.

3. **Dashboard Page Cleanup ([`StudentDashboardPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/student/pages/StudentDashboardPage.tsx))**:
   - Eliminated the stacked inner `<header>` to provide a single, non-redundant navbar.
   - Added the top dashboard heading banner with the continuous live text transition.

### Curriculum Link
- `curriculum.md` → Module 5.2 (CSS Keyframe Animations & transitions), Module 3.2 (Periodic state rotation with `setInterval` & React cleanup).

### Verification
- Production build `npm run build` executed cleanly in 1.66s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 020 — Direct Landlord vs Agent Explore Filters, Video Badges & Dedicated Landlord Dashboard
**Date:** 2026-10-14  
**Task:**
1. Update Explore page (`/search`) filter:
   - Add filter to show Direct Landlord uploads.
   - Add filter to show Agent uploads.
2. Indicate clearly on each video/card whether uploaded by Landlord (0% agency fee) or Agent (15% agency fee).
3. On descriptions, only include details previously required for agents (rent, caution, legal, 15% agency fee, utility, ₦0 inspection) and landlords (rent, caution, legal, utilities, 0% agency fee).
4. On the Agent's Dashboard, exclude the landlord listing button/page.
5. Create a separate, dedicated dashboard for the Landlord with property management, vacancy tracking, and direct student inspection schedules.

### What was built

1. **Explore Filter & Video Badges ([`SearchPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/marketplace/pages/SearchPage.tsx))**:
   - Sidebar filter controls with 3 modes: All Uploads, Direct Landlord Uploads (0% Agency Fee), and Agent Uploads (15% Agency Fee).
   - Quick pill toggles at the top of the search grid displaying real-time listing counts for each category.
   - Video walkthrough indicators (`🎥 Video Tour`) on listing cards.

2. **Tailored Listing Cards & Move-In Breakdown ([`ListingCard.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/ListingCard.tsx) & [`MoveInCostCalculator.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/MoveInCostCalculator.tsx))**:
   - Direct Landlord uploads display gold/amber badges with `👑 Direct Landlord • 0% Fee` and calculate:
     $$\text{Landlord Move-In} = \text{Rent} + \text{Caution} + \text{Legal} + \text{Utilities} + (\text{Agency Fee: } ₦0)$$
   - Agent uploads display slate/emerald badges with `🏢 Agent Upload • 15% Fee` and calculate:
     $$\text{Agent Move-In} = \text{Rent} + \text{Caution} + \text{Legal} + \text{Utilities} + (\text{Agency: } 15\%) + (\text{Inspection: } ₦0)$$

3. **Description & Detail Pages ([`ListingDetailPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/marketplace/pages/ListingDetailPage.tsx))**:
   - Dynamically resolves uploader source (Direct Landlord vs. Verified Agent).
   - Displays description and fee schedule containing only the exact fields required for that specific role.

4. **Agent Dashboard Cleanup ([`DashboardPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/DashboardPage.tsx))**:
   - Excluded the landlord listing button; agents now only see their dedicated `Add New Listing (15% Agency)` action.

5. **Dedicated Landlord Dashboard ([`LandlordDashboardPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/LandlordDashboardPage.tsx))**:
   - Landlord profile showing verified property ownership, NIN verification, and registered campus lodges.
   - Direct action button: `List Property (Direct Landlord)`.
   - Vacancy manager with units occupancy toggles and zero-agency move-in packages.
   - Direct student physical inspection schedule requests with one-click WhatsApp message triggers.
   - Configured routes in [`App.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/App.tsx) (`/portal/landlord/dashboard`, `/landlord/dashboard`) and updated role routing in [`LoginPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/auth/pages/LoginPage.tsx) and [`LandlordRegisterPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/auth/pages/LandlordRegisterPage.tsx).

### Curriculum Link
- `curriculum.md` → Module 3.2 (Composite filtering & polymorphic card rendering), Module 4.1 (Role-segregated routing & layout adaptation).

### Verification
- Production build `npm run build` executed cleanly in 4.23s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 021 — Clean Video Overlays, Interactive Video Playback & Minimal Student Profile
**Date:** 2026-10-14  
**Task:**
1. Clean up crowded video tags:
   - Remove verified/unverified tag from video containers.
   - Remove the 15% text.
   - Remove the "Zero middleman" tag.
   - Remove the 0% text.
2. Change "Video Tour" text to "View Video" and make video playable on click.
3. Streamline Student Dashboard profile:
   - Remove matric number.
   - Remove faculty.
   - Remove email.
   - Keep only the student's name.

### What was built

1. **Uncluttered Video Media Containers ([`ListingCard.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/ListingCard.tsx) & [`ListingDetailPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/marketplace/pages/ListingDetailPage.tsx))**:
   - Stripped away crowded tags directly overlying the video: verified/unverified badges, 15% commission tags, 0% tags, and "Zero middleman" badges.
   - Retained the `TrustBadge` in the card metadata / text row below the media box so trust indicators remain visible without obstructing the apartment footage.
   - Renamed "Video Tour" to **"View Video"** with a red action pill (`▶ View Video`) and a centered hover play button.

2. **Interactive Video Modal Player ([`VideoModal.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/VideoModal.tsx))**:
   - Built a responsive backdrop-blurred modal window embedding an HTML5 `<video controls autoPlay playsInline />` player.
   - Linked `/videos/room-tour.mp4` (verified room walkthrough) directly to thumbnail clicks and "View Video" button clicks.
   - Includes escape key dismiss, backdrop dismissal, title display, and uploader attribution badge.

3. **Minimal Student Profile ([`StudentDashboardPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/student/pages/StudentDashboardPage.tsx))**:
   - Removed matric number (`matricNumber`), faculty (`faculty`), and email (`email`) from the profile card.
   - Kept only the student's name (`Amara Chukwuemeka`) with their initial avatar and prominent search room CTA.

### Curriculum Link
- `curriculum.md` → Module 3.1 (HTML5 media elements, accessible modal overlays, keyboard event cleanup), Module 4.2 (User privacy and minimal profile rendering).

### Verification
- Production build `npm run build` executed cleanly in 4.18s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 022 — Device Storage Video Upload & Explore Page Video Playback
**Date:** 2026-10-14  
**Task:**
1. Enable video uploading directly from device storage (MP4, MOV, WebM) on Agent and Landlord listing workflows.
2. Display newly uploaded listings with their walkthrough videos directly on the Explore page (`/search`) and Homepage (`/`).
3. Ensure uploaded walkthrough videos play smoothly in `VideoModal` upon clicking "View Video".

### What was built

1. **Device Storage Video Upload Workflow ([`NewListingPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/NewListingPage.tsx) & [`LandlordNewListingPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/LandlordNewListingPage.tsx))**:
   - Integrated file input accepting `video/mp4,video/webm,video/quicktime,video/*` from local device storage (phones, laptops, tablets).
   - Live video preview player right inside Step 2 showing the uploaded file, file size in MB, and replace/remove actions.
   - Built automatic video thumbnail frame extraction using an off-screen HTML5 `<canvas>` element at 1.0s timestamp.
   - Added optional custom cover photo upload fallback.

2. **Unified Listing & Media Storage ([`listingsStore.ts`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/lib/listingsStore.ts))**:
   - Built browser IndexedDB persistence (`aroom_listings_db` / `uploaded_listings`) capable of storing full binary video Blobs beyond standard localStorage limits.
   - Provides reactive `useListings()` hook and global change dispatcher so newly uploaded listings appear at the very top of the Explore page (`/search`) and Homepage (`/`) instantly.
   - Implemented `getListingById(id)` lookup for [`ListingDetailPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/marketplace/pages/ListingDetailPage.tsx) to resolve dynamic uploaded listings and play custom device video walkthroughs.

3. **Explore Page & Video Player Integration ([`SearchPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/marketplace/pages/SearchPage.tsx) & [`VideoModal.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/VideoModal.tsx))**:
   - Replaced static mock arrays on `/search` and `/` with reactive `useListings()` hook.
   - Direct button in Step 3 of listing publishing: "View on Explore Page Now" to navigate and see the new listing immediately.
   - Clicking "View Video" on the card opens `VideoModal` and plays the exact video file uploaded from the user's device.

### Curriculum Link
- `curriculum.md` → Module 3.1 (HTML5 File API, Blob object URLs, IndexedDB binary storage, Canvas frame extraction), Module 4.2 (Two-way listing state synchronization across marketplace).

### Verification
- Production build `npm run build` executed cleanly in 1.95s with 0 errors.
- Dev server running on `http://localhost:5174/`.

---

## Entry 023 — Unmuted Video Volume, Reduced Zoom Clarity & Auto-Captured Cover Page
**Date:** 2026-10-14  
**Task:**
1. Enable video volume on uploaded walkthrough videos (remove forced mute, add volume/unmute controls, handle browser autoplay policies gracefully).
2. Reduce video zoom in card previews and playback modal for clear, unobstructed room viewing.
3. Automatically capture the initial view of the video as the cover page; eliminate asking for a separate cover page/photo upload.

### What was built

1. **Unmuted Audio & Sound Controls ([`VideoModal.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/VideoModal.tsx))**:
   - Initialized video playback unmuted (`muted = false`, `volume = 1.0`).
   - Added browser autoplay safety: if autoplay with sound is blocked by browser security policies, playback seamlessly falls back to muted mode while displaying an interactive `"Click to turn on sound 🔊"` toggle pill.
   - Synchronized volume change events (`onVolumeChange`) and provided a header audio toggle button.

2. **Reduced Zoom & Natural Framing ([`VideoModal.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/VideoModal.tsx), [`ListingCard.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/components/shared/ListingCard.tsx), & [`ListingDetailPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/marketplace/pages/ListingDetailPage.tsx))**:
   - Expanded modal container to `max-w-4xl lg:max-w-5xl` with `max-h-[75vh]` and `object-contain`, displaying both 16:9 landscape and 9:16 portrait smartphone walkthroughs at their true native resolution without cropping.
   - Removed aggressive `group-hover:scale-105` zoom animations on card and hero media containers.
   - Increased card media container height to `h-60 sm:h-64` with `object-cover object-center` for balanced, clear framing.

3. **Automatic Initial-View Cover Extraction ([`listingsStore.ts`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/lib/listingsStore.ts), [`NewListingPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/NewListingPage.tsx), & [`LandlordNewListingPage.tsx`](file:///c:/Users/Admin/Desktop/AROOM%20NEW/aroom/aroom-web/src/features/agent/pages/LandlordNewListingPage.tsx))**:
   - Updated `extractThumbnailFromVideo` to capture the exact first frame (`currentTime = 0.05s`) at full native resolution with 0.92 JPEG quality.
   - Completely removed separate cover photo file upload inputs from both Agent and Landlord listing wizards.
   - The initial video view is automatically extracted, previewed with a `"Cover Page Captured (First frame)"` badge, and saved directly as the listing's cover image.

### Curriculum Link
- `curriculum.md` → Module 3.1 (HTML5 media autoplay policies, `<canvas>` video frame extraction, responsive CSS aspect ratio & object fit), Module 3.2 (Streamlined multi-step form UX).

### Verification
- Production build `npm run build` executed cleanly in 2.31s with 0 errors.
- Dev server running on `http://localhost:5174/`.



