# Aroom Hackathon: Getting Started Guide (SPARK Students)

Welcome to the team! This guide takes you from **zero to a running Aroom project in VS Code** on your own computer. Follow the steps in order. It should take about 20–30 minutes.

**Repository:** https://github.com/Mfoniso1/aroom

---

## 1. Install the tools (one time only)

| Tool | Why you need it | Download |
|------|-----------------|----------|
| **VS Code** | Your code editor | https://code.visualstudio.com |
| **Git** | Downloads and shares code | https://git-scm.com/downloads |
| **Node.js (LTS version)** | Runs the project | https://nodejs.org |

After installing, **restart your computer** (or at least close and reopen VS Code), then check everything worked. Open a terminal (VS Code: `Terminal > New Terminal`) and run:

```bash
git --version
node --version
npm --version
```

Each command should print a version number. If you see "command not found", the install did not work. Ask a mentor for help.

---

## 2. Set up Git with your identity (one time only)

Use the same email as your GitHub account:

```bash
git config --global user.name "Your Full Name"
git config --global user.email "you@example.com"
```

Create a free GitHub account at https://github.com if you don't have one yet. **Send your GitHub username to the team lead** so you can be added as a collaborator on the repo.

---

## 3. Get the project (clone)

1. Open VS Code.
2. Open the terminal: `Terminal > New Terminal`.
3. Go to the folder where you keep projects, for example:
   ```bash
   cd Documents
   ```
4. Clone the repository:
   ```bash
   git clone https://github.com/Mfoniso1/aroom.git
   ```
   *If asked to sign in, use your GitHub account in the browser window that pops up.*
5. Open the project in VS Code: `File > Open Folder...` and select the **`aroom`** folder.

> **Alternative (no terminal):** In VS Code press `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`), type `Git: Clone`, paste the repo URL, choose a folder, and click **Open** when prompted.

---

## 4. Understand the project layout

```
aroom/
├── aroom-web/                      <- Frontend (React + Vite + TypeScript + Tailwind)
├── backend/                        <- Backend API
├── Aroombrief.md                   <- What we are building and why (READ THIS FIRST)
├── Aroom_Technical_Implementation_Plan.md
└── Frontend_Development_Plan.md
```

**Frontend team:** you work inside `aroom-web/`.
**Backend team:** you work inside `backend/`.

---

## 5. Run the frontend

In the VS Code terminal:

```bash
cd aroom-web
npm install
npm run dev
```

- `npm install` downloads all libraries. It takes a minute or two. You only do this the first time (and again whenever `package.json` changes).
- `npm run dev` starts the site. Open **http://localhost:5173** in your browser.
- To stop the server, press `Ctrl + C` in the terminal.

You should see the Aroom marketplace homepage. If you do, you're ready.

---

## 6. Run the backend (backend team)

```bash
cd backend
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
npm install
```

Open the new `.env` file and fill in the values your mentor gives you. **Never commit `.env` to GitHub. It contains secrets.** Then check the backend's README or `package.json` scripts for the start command (usually `npm run dev`).

---

## 7. Recommended VS Code extensions

Click the Extensions icon (left sidebar) and install:

- **ES7+ React/Redux Snippets**
- **Tailwind CSS IntelliSense**
- **Prettier - Code formatter**
- **GitLens** (optional, shows who changed what)

---

## 8. The daily teamwork workflow (IMPORTANT)

**Never work directly on `main`.** Always use your own branch. This is how teams avoid breaking each other's work.

### Start of every work session
```bash
git checkout main
git pull origin main
```

### Create your feature branch (once per task)
```bash
git checkout -b feature/your-name-short-task
# example: git checkout -b feature/amina-search-filters
```

### Save your work (do this often)
```bash
git add .
git commit -m "feat: add price filter to search page"
```

### Share your work
```bash
git push origin feature/your-name-short-task
```

Then go to the repo on GitHub, click **"Compare & pull request"**, describe what you did, and ask a teammate to review it. After approval, it gets merged into `main`.

### Commit message tips
Start with a keyword: `feat:` (new feature), `fix:` (bug fix), `docs:` (documentation), `style:` (visual changes).

---

## 9. Hackathon starter tasks

Pick one, and create a branch for it:

1. **Beginner:** Change the homepage headline text and see it update live in your browser.
2. **Beginner:** Add a new mock listing to the list in `HomePage.tsx`.
3. **Intermediate:** Add a "Price: low to high" sort dropdown on the Search page.
4. **Intermediate:** Add a footer with contact links to `MainLayout.tsx`.
5. **Advanced:** Add a "Save listing" heart button to `ListingCard.tsx`.

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| `git` / `node` / `npm` not recognized | Restart VS Code or your computer. Reinstall if still failing. |
| `npm install` fails | Make sure you are inside the `aroom-web` folder (`cd aroom-web`). Check your internet. |
| Page is blank at localhost:5173 | Check the terminal and the browser console (`F12`) for red errors, and send a screenshot to the team. |
| Port 5173 already in use | Close old terminals running `npm run dev`, or press `Ctrl + C` in them. |
| `git push` rejected | Run `git pull origin main`, resolve any conflicts, then push again. |
| Merge conflict markers (`<<<<<<<`) in a file | Ask a mentor. We will resolve it together. |
| Accidentally edited `main` | Don't panic. Run `git checkout -b feature/my-fix` and your changes move to a new branch. |

---

## 11. Rules of the hackathon team

- Pull before you start working, and commit often.
- Small, focused pull requests are better than giant ones.
- Never commit secrets (`.env`, passwords, API keys).
- Ask for help early. Everyone started as a beginner.

Happy hacking! 🚀
