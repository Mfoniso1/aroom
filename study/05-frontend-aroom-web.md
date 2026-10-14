# 05 — The Frontend Layer (`aroom-web/`)

## 1. What is React? (Core Concepts for Beginners)

React is built around three fundamental concepts:

### A. Components
A component is a JavaScript function that returns HTML-like markup called **JSX**.
```tsx
export function WelcomeBanner() {
  return <h1>Welcome to Aroom!</h1>;
}
```

### B. Props (Properties)
Props are how components receive data from their parents, like passing arguments to a function:
```tsx
<ListingCard listing={myRoomData} />
```

### C. State (`useState`)
State is a component's personal memory. When state changes, React **re-renders** the component automatically to update what the user sees on the screen:
```tsx
const [isOpen, setIsOpen] = useState(false);
```

---

## 2. Directory Structure of `aroom-web/`

```
aroom-web/
├── index.html            # The single HTML page loaded by the browser
├── vite.config.ts        # Vite configuration & path aliases (@/ -> src/)
├── package.json          # Frontend packages and dependencies
└── src/
    ├── main.tsx          # Starts the React application and mounts it to #root
    ├── App.tsx           # Configures client-side routing (URLs & pages)
    ├── lib/
    │   └── costCalculator.ts  # Logic for calculating Nigerian move-in fees
    ├── components/
    │   ├── layout/       # MainLayout.tsx, AgentLayout.tsx (Navbar & footer)
    │   └── shared/
    │       ├── ListingCard.tsx           # Reusable property card
    │       ├── TrustBadge.tsx            # "Verified" vs "Unverified - New"
    │       └── MoveInCostCalculator.tsx   # 💰 The Move-In Cost calculator!
    └── features/
        ├── marketplace/pages/            # Student-facing pages (Home, Search, Details)
        └── agent/pages/                  # Agent-facing pages (Dashboard, Post Listing)
```

---

## 3. Deep-Dive: Key Components & How They Work

### Component 1: `MoveInCostCalculator.tsx` (The New Feature!)
This component solves a major real-world student problem. Instead of only seeing `₦350,000/yr`, students can click `💰 See Total Move-In Cost`.

```
[ Listing Card ]
------------------------------------------------
Spacious Self-Contain at Akoka
📍 5 mins walk from UNILAG Gate
₦350,000/yr

[ 💰 See Total Move-In Cost  ▼ ]  <-- CLICK HERE!
------------------------------------------------
  Annual Rent      — ₦350,000
  Agency Fee (10%) — ₦35,000
  Agreement Fee    — ₦20,000
  Caution Fee      — ₦25,000
  Other Charges    — ₦10,000
  --------------------------
  Total Estimated  — ₦440,000 💰
```

#### How it works in code:
1. It maintains local state: `const [isOpen, setIsOpen] = useState(false);`
2. When the user clicks the button, it toggles `isOpen` between `true` and `false`.
3. If `isOpen === true`, the smooth breakdown container expands and renders the calculated numbers.

#### 💡 Beginner Concept: Event Bubbling & `e.stopPropagation()`
Notice this line inside `MoveInCostCalculator.tsx`:
```tsx
const handleToggle = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsOpen(!isOpen);
};
```
- **Why is this critical?** The entire `<ListingCard />` is wrapped in a `<Link to="/listings/1">`. 
- Without `e.stopPropagation()`, clicking the "💰 See Total Move-In Cost" button would trigger the outer Link and immediately navigate the student to the details page!
- `stopPropagation()` tells the browser: *"Stop the click event right here. Do not let it bubble up to the parent card."*

---

### Component 2: `lib/costCalculator.ts` (Separation of Concerns)
Instead of hardcoding math formulas inside the visual button component, we separate the calculation logic into a dedicated file:
```ts
export function calculateMoveInCost(annualRent: number) {
  const agencyFee = Math.round(annualRent * 0.10); // 10%
  const agreementFee = annualRent === 350000 ? 20000 : Math.round(annualRent * 0.057);
  const cautionFee = annualRent === 350000 ? 25000 : Math.round(annualRent * 0.0714);
  const otherCharges = annualRent === 350000 ? 10000 : Math.round(annualRent * 0.0286);
  const totalCost = annualRent + agencyFee + agreementFee + cautionFee + otherCharges;
  return { annualRent, agencyFee, agreementFee, cautionFee, otherCharges, totalCost };
}
```
- **Why?** If the market rules change tomorrow (e.g. government caps agency fees at 5%), you update this single function, and every card and page updates automatically!

---

### Component 3: `ListingCard.tsx`
- **What is it?** The reusable card used on the Home Page and Search Page.
- **Props:** Receives a single `listing` object containing `id`, `title`, `price`, `landmark`, `verificationStatus`, and `imageUrl`.
- **Image Fallback:** Uses an `onError` handler:
  ```tsx
  <img src={imgSrc} onError={() => setImgSrc(FALLBACK_IMAGE)} />
  ```
  If an image URL fails to load (e.g. Unsplash drops a link), it gracefully replaces it with a clean fallback image so the user never sees a broken icon.

---

### Component 4: Pages (`HomePage.tsx`, `SearchPage.tsx`, `ListingDetailPage.tsx`)
- **`HomePage.tsx`:** Features the green hero banner, campus dropdown selector (`UNILAG`, `UNIBEN`), and a grid mapping `MOCK_LISTINGS.map(listing => <ListingCard key={listing.id} listing={listing} />)`.
- **`SearchPage.tsx`:** Features an interactive sidebar with budget sliders and a "Show Verified Only" checkbox.
- **`ListingDetailPage.tsx`:** Full property showcase with descriptions, agent trust scores, and an inline move-in cost breakdown.

---

### ⏭️ Next Step:
Proceed to **[06-developer-workflow-and-git.md](./06-developer-workflow-and-git.md)** to learn how to run the project, manage environment variables, and work with Git like a pro!

