# 🖥️ Beginner Coding Study List

## 🎯 My Goal
> **Understand the code behind the Aroom project I am building.**
>
> Aroom is a real web application — a verified campus housing marketplace for Nigerian university students.
> By learning the topics below, I will be able to read, understand, and eventually write the code that makes Aroom work.

---

A roadmap of topics to learn as a beginner in programming. Work through them in order — each builds on the last.

---

## 🟢 Stage 1 — Absolute Basics

- [ ] **What is coding / programming?** — how computers follow instructions
- [ ] **Choosing a first language** — Python is the most beginner-friendly; JavaScript is great if you want to build websites
- [ ] **Setting up your environment** — installing VS Code, running your first "Hello, World!" program
- [ ] **Variables** — storing information (numbers, text, true/false)
- [ ] **Data types** — strings, integers, floats, booleans
- [ ] **Operators** — math (`+`, `-`, `*`, `/`), comparison (`==`, `>`, `<`), logical (`and`, `or`, `not`)
- [ ] **Comments** — writing notes inside your code

---

## 🟡 Stage 2 — Control Flow

- [ ] **If / else statements** — making decisions in code
- [ ] **Loops** — `for` loops and `while` loops (repeating actions)
- [ ] **Break & continue** — controlling loop behaviour
- [ ] **Nested conditions** — if inside if

---

## 🟠 Stage 3 — Functions & Organisation

- [ ] **Functions** — writing reusable blocks of code
- [ ] **Parameters & return values** — passing data in and out of functions
- [ ] **Scope** — understanding where variables live
- [ ] **Built-in functions** — `print()`, `len()`, `range()`, `type()`, etc.

---

## 🔵 Stage 4 — Data Structures

- [ ] **Lists / Arrays** — ordered collections of items
- [ ] **Dictionaries / Objects** — key-value pairs (like a real dictionary)
- [ ] **Tuples & Sets** — other ways to group data
- [ ] **Indexing & slicing** — accessing items inside a list

---

## 🟣 Stage 5 — Problem Solving

- [ ] **Reading error messages** — understanding what went wrong
- [ ] **Debugging** — finding and fixing bugs step by step
- [ ] **Pseudocode** — planning your solution in plain English before writing code
- [ ] **Basic algorithms** — searching a list, sorting items, counting things

---

## ⚫ Stage 6 — Working Like a Developer

- [ ] **Git basics** — saving versions of your code (`git init`, `commit`, `push`)
- [ ] **GitHub** — storing your projects online and sharing them
- [ ] **Reading documentation** — how to look things up yourself
- [ ] **Command line / Terminal basics** — navigating folders, running scripts

---

## 🌐 Stage 7 — Pick a Path (choose one to start)

### Web Development (HTML / CSS / JavaScript)
- [ ] HTML — structure of a webpage (headings, paragraphs, links, images)
- [ ] CSS — styling a webpage (colours, fonts, layout)
- [ ] JavaScript — making pages interactive (buttons, forms, animations)
- [ ] React — building modern web apps (what Aroom uses!)

### Python / Backend / Data
- [ ] File reading & writing
- [ ] Working with APIs (fetching data from the internet)
- [ ] Intro to databases (storing information permanently)
- [ ] Basic data analysis with pandas

### Mobile Apps
- [ ] Flutter / Dart — build apps that run on Android and iOS
- [ ] React Native — use JavaScript to build mobile apps

---

## 📚 Free Resources to Get Started

| Resource | What it covers | Link |
|---|---|---|
| **freeCodeCamp** | HTML, CSS, JS, Python | https://www.freecodecamp.org |
| **The Odin Project** | Full web dev curriculum | https://www.theodinproject.com |
| **CS50 (Harvard)** | Intro to Computer Science | https://cs50.harvard.edu/x |
| **Python.org Tutorial** | Official Python beginner guide | https://docs.python.org/3/tutorial |
| **MDN Web Docs** | HTML, CSS, JavaScript reference | https://developer.mozilla.org |
| **W3Schools** | Quick interactive lessons | https://www.w3schools.com |

---

## 💡 Study Tips

1. **Code every day** — even 20–30 minutes beats 3 hours once a week
2. **Build things** — don't just follow tutorials; try a small project of your own
3. **Break things on purpose** — changing code and seeing what breaks teaches you a lot
4. **Google is a tool, not cheating** — professional developers search constantly
5. **Read other people's code** — explore projects on GitHub
6. **Be patient** — confusion is normal; it means you're learning

---

---

> _"Everyone starts somewhere. The best time to start was yesterday. The second best time is now."_

---

## 🏠 Understanding the Aroom Project — Real Examples

This section connects what you are learning to **actual files in the Aroom codebase**.
As you study each topic, come back here and open the file — the code will start to make sense.

---

### What is Aroom made of?

| Technology | What it does in Aroom |
|---|---|
| **React** (JavaScript) | Builds every screen the user sees |
| **TypeScript** | JavaScript with rules that catch mistakes early |
| **Tailwind CSS** | Styles — colours, sizes, spacing — using short class names |
| **React Router** | Moves the user between pages (Home → Search → Listing) |
| **Vite** | Packages all the code together so the browser can run it |

---

### File-by-file Breakdown

#### `src/App.tsx` — The Starting Point
This is the **first file that runs** when someone opens the Aroom website.
- It decides whether to show the loading screen (splash) or the main app.
- It sets up all the **routes** (URL paths like `/`, `/search`, `/listings`).
- **Topics to understand it:** Variables, If/else, Functions, React basics

---

#### `src/components/shared/SplashScreen.tsx` — The Loading Screen
This file controls the **animated intro** you see when the site first opens.
- The logo animates in the centre of the screen.
- After ~2 seconds it flies across the screen and merges into the navbar.
- **Topics to understand it:** Functions, Timers (`setTimeout`), DOM (querying elements), CSS transitions, React state (`useState`, `useEffect`)

---

#### `src/components/shared/Logo.tsx` — The Aroom Brand Logo
This builds the green squircle badge + "Aroom" wordmark used everywhere on the site.
- It accepts **props** (options you pass in) like `size="md"` or `variant="dark"`.
- **Topics to understand it:** Functions with parameters, If/else, JSX (HTML written inside JavaScript)

---

#### `src/components/layout/MainLayout.tsx` — The Page Shell
Every public page (Home, Search, Listing) is **wrapped** in this layout.
- It contains the **navbar** at the top (with the logo and nav links).
- It contains the **footer** at the bottom.
- **Topics to understand it:** Functions, JSX, React components

---

#### `src/features/marketplace/pages/HomePage.tsx` — The Landing Page
The first page visitors see.
- Has the hero text, search bar, and featured listings.
- **Topics to understand it:** React components, props, lists/arrays, `.map()` (looping over data to render cards)

---

#### `src/features/marketplace/pages/SearchPage.tsx` — The Search & Filter Page
Lets students search for rooms by campus, price, etc.
- **Topics to understand it:** State (storing what the user has typed), arrays, filtering data

---

#### `src/lib/campuses.ts` — The Data File
A list of supported Nigerian universities (UNIPORT, UNILAG, etc.).
- Just an exported JavaScript array — a great first file to read!
- **Topics to understand it:** Arrays, objects, variables, exporting/importing

---

### 🗺️ Suggested Learning Order (for Aroom)

```
1. Variables & Data Types      → read campuses.ts
2. Functions & JSX             → read Logo.tsx
3. If/else + Props             → read MainLayout.tsx
4. useState + useEffect        → read SplashScreen.tsx
5. React Router                → read App.tsx
6. Arrays + .map()             → read HomePage.tsx
7. State + Filtering           → read SearchPage.tsx
```

---

> Once you finish Stage 4 of the study roadmap above, you will be able to read and understand **every file in Aroom**. Keep going! 🚀
