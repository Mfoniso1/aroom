# 06 — Developer Workflow, Git & Running the Project

## 1. What is Git & GitHub?

- **Git:** A local version-control tool (like a time machine for your project). Every time you make progress, you take a snapshot called a **Commit**.
- **GitHub:** A cloud service that stores your Git repositories online so you can collaborate, back up your code, and deploy it to the world.

### The 3 Stages of Git:
```
[ Working Directory ]  ---( git add . )--->  [ Staging Area ]  ---( git commit )--->  [ Local Git History ]
(Your files in VS Code)                      (Box packed for shipping)                 (Official saved snapshot)
                                                                                              │
                                                                                     ( git push origin main )
                                                                                              ▼
                                                                                   [ GitHub Cloud Repo ]
```

---

## 2. Environment Variables & Secrets (`.env`)

In software development, **never hardcode passwords, API keys, or private tokens inside your code**. If you push a private password to a public GitHub repository, automated bots will steal it in seconds!

### How `.env` Protects You:
1. All private keys are stored in a local file called `.env`:
   - `DATABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WHATSAPP_VERIFY_TOKEN`
2. In our [`.gitignore`](file:///c:/Users/RV/Desktop/Aroom/.gitignore) file, we add `.env`. This tells Git: *"Never upload this file to GitHub under any circumstances!"*
3. We provide a safe template called [`.env.example`](file:///c:/Users/RV/Desktop/Aroom/backend/.env.example) showing other developers what keys are needed, with fake dummy values.

---

## 3. How to Run the Entire Project Locally (Step-by-Step)

### Terminal 1: Running the Frontend (`aroom-web`)
1. Open your terminal in the `aroom-web` directory:
   ```powershell
   cd c:\Users\RV\Desktop\Aroom\aroom-web
   ```
2. Install dependencies (only needed the first time):
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" install
   ```
3. Start the Vite development server:
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" run dev
   ```
4. Open your browser and navigate to **[http://localhost:5173/](http://localhost:5173/)**.

---

### Terminal 2: Running the Backend Server (`backend`)
1. Open a second terminal window in the `backend` directory:
   ```powershell
   cd c:\Users\RV\Desktop\Aroom\backend
   ```
2. Install dependencies (only needed the first time):
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" install
   ```
3. Start the development API server:
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" run dev
   ```
4. Test the health check endpoint: Open **[http://localhost:5000/health](http://localhost:5000/health)** in your browser. You should see `{ "status": "healthy" }`.

---

### Terminal 3: Testing & Migrating the Database
1. Inside the `backend` folder:
2. **Test Supabase connection:**
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" run db:test
   ```
3. **Run database migrations:**
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" run db:migrate
   ```
4. **Run the 11 backend automated tests:**
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" test
   ```

---

## 4. Beginner Troubleshooting Guide

### Issue A: `File npm.ps1 cannot be loaded because running scripts is disabled`
- **Cause:** Windows PowerShell security execution policy blocks script execution by default.
- **Fix:** Run npm using `npm.cmd` explicitly:
  ```powershell
  & "C:\Program Files\nodejs\npm.cmd" install
  ```

### Issue B: `Port 5000 or Port 5173 is already in use`
- **Cause:** A previous instance of the server is still running in the background.
- **Fix:** Find and stop the process:
  ```powershell
  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
  ```

### Issue C: `invalid input syntax for type uuid`
- **Cause:** A UUID in your SQL script contained characters outside the hexadecimal range (`0-9` and `a-f`).
- **Fix:** Replace non-hex letters like `u`, `s`, `l` with valid hex letters `d`, `b`, `f`.

---

## 🎓 Summary: You Are Ready!

You now understand:
1. Why Aroom exists and how it uses software to build marketplace trust.
2. How the React frontend, Node.js backend, and Supabase database communicate.
3. How database tables, UUIDs, migrations, and RLS policies work.
4. How the "Total Move-In Cost" calculator was implemented.
5. How professional software engineers manage Git, `.env`, and tests.

Happy coding! 🚀

