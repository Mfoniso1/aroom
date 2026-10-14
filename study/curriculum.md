# 📚 Aroom Codebase Curriculum

> **Goal:** Understand every file in the Aroom project by learning exactly what each one uses.
> This curriculum is built directly from the real code — every concept listed appears in a real Aroom file.

---

## How to Use This Curriculum

1. Read the **concept** explanation
2. Open the **linked file** in VS Code
3. Find the **exact line** shown — you will now recognise what it does
4. Tick the checkbox when you understand it

Progress through the modules in order. Each one unlocks the next.

---

## Module 1 — JavaScript & TypeScript Foundations
> **Unlocks:** `campuses.ts`, `main.tsx`, `App.tsx` (imports section)

### 1.1 Variables & Constants
A variable stores a piece of information so you can use it later.

```ts
// From: MainLayout.tsx — line 4
const CURRENT_YEAR = new Date().getFullYear()
//    ^^^^^^^^^^^^   a name       ^^^^^^^^^^^ a value (the current year number)
```
- `const` = the value never changes after it is set
- `let` = the value can change later
- **Task:** Open `MainLayout.tsx`. Find `CURRENT_YEAR`. Notice it is used later in the footer to show the copyright year.

---

### 1.2 Functions
A function is a named block of code you can run whenever you need it.

```ts
// From: App.tsx — line 18
const handleSplashComplete = () => {
  setShowSplash(false)   // runs when the loading screen finishes
}
```
- `() =>` means "a function that takes no inputs"
- The `{ }` block is the code that runs when called
- **Task:** Open `App.tsx`. Find `handleSplashComplete`. Find where it is *called* (passed into `<SplashScreen>`).

---

### 1.3 Objects & Dictionaries
An object groups related values together under one name using `key: value` pairs.

```ts
// From: Logo.tsx — lines 20–42
const sizeConfig = {
  sm: { emblem: 'w-7 h-7', svg: 'w-4 h-4', text: 'text-lg' },
  md: { emblem: 'w-9 h-9', svg: 'w-5 h-5', text: 'text-xl' },
  lg: { emblem: 'w-12 h-12', svg: 'w-7 h-7', text: 'text-3xl' },
}[size]   // ← picks the right row based on the 'size' prop passed in
```
- **Task:** Open `Logo.tsx`. Trace how `sizeConfig.emblem` is used further down the file to set the badge size.

---

### 1.4 Imports & Exports
Files share code with each other using `import` and `export`.

```ts
// From: App.tsx — lines 1–11
import { useState } from 'react'                        // from npm package
import { MainLayout } from '@/components/layout/MainLayout'  // from our own file
import { SplashScreen } from '@/components/shared/SplashScreen'
```
- `@/` is a shortcut for the `src/` folder
- **Task:** Open `Logo.tsx`. Find the `export` keyword at line 11. This is what makes `Logo` usable in `MainLayout.tsx`.

---

### 1.5 TypeScript: Types & Interfaces
TypeScript adds *rules* to JavaScript so mistakes are caught before the page loads.

```ts
// From: Logo.tsx — lines 3–9
interface LogoProps {
  variant?: 'light' | 'dark'   // must be one of these two strings (? = optional)
  size?: 'sm' | 'md' | 'lg'
  badge?: string
  showTagline?: boolean
  className?: string
}
```
- An `interface` is like a contract — it says what shape an object must have
- `?` after a name means it is optional (you don't have to pass it)
- **Task:** Open `MainLayout.tsx` line 12. See `<Logo variant="light" size="md" />`. These match the interface rules exactly.

---

## Module 2 — React Components
> **Unlocks:** `Logo.tsx`, `MainLayout.tsx`, `ListingCard.tsx`, `TrustBadge.tsx`

### 2.1 What is a Component?
A component is a reusable piece of UI — like a Lego brick. It is a function that returns HTML-like code called **JSX**.

```tsx
// From: Logo.tsx — line 11
export function Logo({ variant = 'light', size = 'md' }: LogoProps) {
  return (
    <div className="...">    {/* JSX: looks like HTML, written in JavaScript */}
      ...
    </div>
  )
}
```
- The component is named `Logo`
- It returns what will appear on screen
- **Task:** Open `MainLayout.tsx`. Count how many times `<Logo />` appears and with what different props.

---

### 2.2 Props — Passing Data Into a Component
Props are the inputs you hand to a component, like settings.

```tsx
// From: MainLayout.tsx — lines 12 and 33
<Logo variant="light" size="md" />       // navbar: light mode, medium size
<Logo variant="dark" size="sm" showTagline />   // footer: dark mode, small + tagline
```
- Same `Logo` component, different appearance — controlled by props
- **Task:** Open `Logo.tsx`. Find the `isDark` variable (line 18). It reads from `variant` and changes text colours.

---

### 2.3 Children — Wrapping Other Components
The special `children` prop lets a component wrap other content inside it.

```tsx
// From: App.tsx — line 33
<MainLayout>
  <HomePage />     {/* ← this is 'children' */}
</MainLayout>

// From: MainLayout.tsx — line 28
<main className="flex-1">{children}</main>   // ← printed here inside the layout
```
- `MainLayout` handles the navbar + footer; `children` is whatever page goes in the middle
- **Task:** Open `App.tsx`. Find all 3 places `<MainLayout>` wraps a page component.

---

### 2.4 Conditional Rendering — Showing Things Only When Needed
Use `&&` or a ternary (`? :`) to show an element only if a condition is true.

```tsx
// From: Logo.tsx — line 131
{badge && (
  <span className="...">{badge}</span>   // only shows if 'badge' prop was passed
)}

// From: SplashScreen.tsx — line 92
{!isDocking && (
  <button onClick={handleSkip}>Skip</button>   // skip button disappears when flying
)}
```
- **Task:** Open `SplashScreen.tsx`. Find where `isDocking` makes the white backdrop fade out.

---

## Module 3 — React State & Timing
> **Unlocks:** `App.tsx` (state), `SplashScreen.tsx` (full file)

### 3.1 useState — Remembering Things That Change
`useState` lets a component remember a value and re-draw itself when it changes.

```ts
// From: App.tsx — line 16
const [showSplash, setShowSplash] = useState(true)
//     ^^^^^^^^^^  ^^^^^^^^^^^^^^             ^^^^
//     read it     change it                 starting value
```
- When `setShowSplash(false)` is called, the component re-renders and the splash disappears
- **Task:** Open `App.tsx`. Trace the flow: `useState(true)` → splash shows → `handleSplashComplete` runs → `setShowSplash(false)` → splash hides.

---

### 3.2 useState with Multiple States
A component can have many independent state values.

```ts
// From: SplashScreen.tsx — lines 13–17
const [phase, setPhase]                 = useState<'enter' | 'brand' | 'docking'>('enter')
const [lockupTransform, setLockupTransform] = useState<string>('none')
const [lockupScale, setLockupScale]     = useState<number>(1)
```
- `phase` controls which animation stage the loading screen is in
- `lockupTransform` and `lockupScale` control where and how big the flying logo is
- **Task:** In `SplashScreen.tsx`, find every place `setPhase` is called and what it changes to.

---

### 3.3 useEffect — Running Code at the Right Time
`useEffect` runs code *after* the component appears on screen, or when a value changes.

```ts
// From: SplashScreen.tsx — lines 23–33
useEffect(() => {
  const brandTimer = setTimeout(() => setPhase('brand'), 900)    // after 0.9s
  const dockTimer  = setTimeout(() => setPhase('docking'), 2200) // after 2.2s
  const doneTimer  = setTimeout(() => onComplete(), duration)    // after 3.2s

  return () => {   // cleanup: cancel timers if component closes early
    clearTimeout(brandTimer)
    clearTimeout(dockTimer)
    clearTimeout(doneTimer)
  }
}, [duration, onComplete])
```
- `setTimeout` is a browser timer — it runs a function after X milliseconds
- The `return () => {}` block cleans up when the component is removed (prevents bugs)
- **Task:** In `SplashScreen.tsx`, find the second `useEffect` (line 36). What does it do when `phase` becomes `'docking'`?

---

### 3.4 useRef — Pointing at a Real DOM Element
`useRef` gives you a direct handle to an actual HTML element on the page.

```ts
// From: SplashScreen.tsx — lines 19–20
const lockupRef = useRef<HTMLDivElement>(null)
const dockingTriggered = useRef(false)

// Later — line 50
const cRect = lockupRef.current.getBoundingClientRect()
// ^^^ reads the element's pixel position on screen
```
- `getBoundingClientRect()` returns `{ top, left, width, height }` — where the element is
- This is how the logo knows the exact pixel coordinates to fly to
- **Task:** In `SplashScreen.tsx`, find `document.getElementById('app-header-logo')`. Now open `MainLayout.tsx` line 11 — that is the element it is targeting.

---

## Module 4 — Routing (Moving Between Pages)
> **Unlocks:** `App.tsx` (routes section), `MainLayout.tsx` (Link components)

### 4.1 Routes — Matching URLs to Pages
React Router shows a different component depending on the URL in the browser.

```tsx
// From: App.tsx — lines 32–45
<Routes>
  <Route path="/"              element={<MainLayout><HomePage /></MainLayout>} />
  <Route path="/search"        element={<MainLayout><SearchPage /></MainLayout>} />
  <Route path="/listings/:id"  element={<MainLayout><ListingDetailPage /></MainLayout>} />
  <Route path="/portal/dashboard" element={<AgentLayout><DashboardPage /></AgentLayout>} />
</Routes>
```
- When the URL is `/search` → `SearchPage` renders
- `:id` is a **URL parameter** — it captures whatever is in that spot, e.g. `/listings/42` gives `id = "42"`
- **Task:** Open `App.tsx`. Count all routes. Which layout does the Agent Portal use?

---

### 4.2 Link — Navigating Without Reloading
`<Link>` is like an `<a>` tag but it navigates without refreshing the whole page.

```tsx
// From: MainLayout.tsx — lines 11 and 15
<Link to="/" id="app-header-logo">
  <Logo />                        // clicking the logo goes to home
</Link>

<Link to="/search">Browse Rooms</Link>   // clicking goes to search page
```
- **Task:** In `MainLayout.tsx`, find the `id="app-header-logo"`. Now open `SplashScreen.tsx` line 41 — that ID is how the splash finds the navbar logo to fly into.

---

## Module 5 — CSS & Styling with Tailwind
> **Unlocks:** Every `.tsx` file — they all use Tailwind classes

### 5.1 Tailwind Utility Classes
Instead of writing a separate CSS file, Tailwind uses short class names directly on elements.

```tsx
// From: MainLayout.tsx — line 9
<header className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50">
//                 ^^^^^^^^^^^ ^^^^^^^^^^^^^^^ ^^^^^^^^ ^^^^^^^^ ^^^^ ^^^^
//                 white+95%   frosted glass   border   sticks   layer
//                 opacity     blur            below    at top   order
```

| Class | What it does |
|---|---|
| `bg-white` | White background |
| `bg-white/95` | White background at 95% opacity |
| `backdrop-blur-md` | Frosted glass blur behind the element |
| `sticky top-0` | Sticks to the top of the screen when scrolling |
| `z-50` | Sits above most other elements (like a layer) |
| `flex items-center` | Puts children side-by-side, vertically centred |
| `transition-all` | Animates any property change smoothly |

- **Task:** Open `SplashScreen.tsx` line 77. Read `fixed inset-0 z-9999`. What does this do to the loading screen?

---

### 5.2 Conditional Classes — Switching Styles with State
Use a template string with a ternary to switch classes based on state.

```tsx
// From: SplashScreen.tsx — lines 83–85
className={`absolute inset-0 bg-white transition-opacity duration-700 ease-out ${
  isDocking ? 'opacity-0' : 'opacity-100'
}`}
// When isDocking = true  → opacity-0  (invisible, fades out)
// When isDocking = false → opacity-100 (fully visible)
```
- **Task:** In `Logo.tsx` line 50, find the same pattern. What changes when `isDark` is true?

---

### 5.3 Inline Styles — For Values Tailwind Cannot Know Ahead of Time
When a value is calculated at runtime (like a pixel position), use the `style` prop.

```tsx
// From: SplashScreen.tsx — lines 106–115
style={{
  transformOrigin: 'top left',
  transform: isDocking
    ? `translate(${dx}px, ${dy}px) scale(${scaleVal})`  // ← calculated pixel values
    : 'none',
  transition: isDocking
    ? 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'  // spring easing curve
    : 'none',
  opacity: isDocking ? 0 : 1,
}}
```
- `transform: translate(x, y)` moves an element by exact pixels — used here to fly the logo across the screen
- **Task:** Trace how `dx` and `dy` are calculated in the second `useEffect` in `SplashScreen.tsx`.

---

## Module 6 — The DOM & Browser APIs
> **Unlocks:** `SplashScreen.tsx` (flight logic)

### 6.1 What is the DOM?
The DOM (Document Object Model) is the browser's live representation of every element on the page. JavaScript can read and change it.

```ts
// From: SplashScreen.tsx — line 41
const target = document.getElementById('app-header-logo')
// ↑ asks the browser: "find the element with this ID right now"
```

### 6.2 getBoundingClientRect — Measuring Elements
```ts
// From: SplashScreen.tsx — lines 50–60
const cRect = lockupRef.current.getBoundingClientRect()
const tRect = target.getBoundingClientRect()

const dx       = tRect.left   - cRect.left    // how far left/right to move
const dy       = tRect.top    - cRect.top     // how far up/down to move
const scaleVal = tRect.height / cRect.height  // how much to shrink
```
- This is the maths that makes the logo fly from the centre of the screen into the navbar
- **Real result:** the logo shrinks from `96px` tall to `36px` tall and slides to the top-left corner

---

## ✅ Completion Checklist

| Module | Topic | File to open | Done |
|---|---|---|---|
| 1.1 | Variables | `MainLayout.tsx` line 4 | [ ] |
| 1.2 | Functions | `App.tsx` lines 18–20 | [ ] |
| 1.3 | Objects | `Logo.tsx` lines 20–42 | [ ] |
| 1.4 | Imports/Exports | `App.tsx` lines 1–11 | [ ] |
| 1.5 | TypeScript interfaces | `Logo.tsx` lines 3–9 | [ ] |
| 2.1 | Components | `Logo.tsx` line 11 | [ ] |
| 2.2 | Props | `MainLayout.tsx` lines 12 & 33 | [ ] |
| 2.3 | Children | `App.tsx` line 33, `MainLayout.tsx` line 28 | [ ] |
| 2.4 | Conditional rendering | `SplashScreen.tsx` line 92 | [ ] |
| 3.1 | useState | `App.tsx` line 16 | [ ] |
| 3.2 | Multiple state values | `SplashScreen.tsx` lines 13–17 | [ ] |
| 3.3 | useEffect + timers | `SplashScreen.tsx` lines 23–33 | [ ] |
| 3.4 | useRef + DOM | `SplashScreen.tsx` lines 19, 50 | [ ] |
| 4.1 | Routes | `App.tsx` lines 32–45 | [ ] |
| 4.2 | Link navigation | `MainLayout.tsx` lines 11 & 15 | [ ] |
| 5.1 | Tailwind classes | `MainLayout.tsx` line 9 | [ ] |
| 5.2 | Conditional classes | `SplashScreen.tsx` lines 83–85 | [ ] |
| 5.3 | Inline styles | `SplashScreen.tsx` lines 106–115 | [ ] |
| 6.1–6.2 | DOM + measurements | `SplashScreen.tsx` lines 41–60 | [ ] |

---

> **When every box is ticked, you can read and explain every file in the Aroom project.**
> The next step after that is making your own changes to the code. 🚀
