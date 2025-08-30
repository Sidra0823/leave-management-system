<<<<<<< HEAD
# Mini Leave Management System — Complete Instructions & Requirements

**Purpose:**  
This README contains *everything* you need to run, test, debug, and (optionally) deploy the Leave Management System provided in this assignment bundle.

---

## Project Structure
```
leave-management-assignment/
  backend/
    index.js          # Express server
    db.js             # SQLite wrapper + table init
    package.json
    init_db.js        # (optional) DB initialization script
    database.sqlite   # created automatically after init/run
  frontend/
    index.html        # minimal demo UI
  diagrams/
    er_diagram.png
    class_and_pseudocode.md
  API_SAMPLE.md
  ASSUMPTIONS.md
  run_instructions.md
  README.md          # (this file)
```

---

## Prerequisites (what to install)
1. **Node.js** — v16+ (LTS recommended).  
   - Check: `node -v` and `npm -v`
2. **Git** (optional, for pushing to GitHub).  
   - Check: `git --version`
3. **(Optional) Python 3** — to serve frontend quickly with `python -m http.server`.
4. **(Optional) sqlite3 CLI** — to inspect the SQLite database directly:
   - `sqlite3 backend/database.sqlite`
5. **(Optional) npx / serve** — `npx serve` is used to serve the frontend.

---

## Files you may edit
- `backend/index.js` — main API code (routes and logic).
- `backend/db.js` — DB helper and init (creates tables automatically).
- `frontend/index.html` — demo UI; change `base` URL if backend is running on a different port.
- `ASSUMPTIONS.md` — documented assumptions and edge-cases.

---

## Configuration & Important Defaults
- Default backend port: **3000** (environment variable `PORT` will override).
- Default total leaves per new employee: **20** (change in `backend/index.js` where balance is initialized).
- Date format used throughout: **YYYY-MM-DD**.

---

## Step-by-step: Run locally (Windows PowerShell and macOS/Linux)

### 1. Extract the ZIP (if zipped)
**Windows (PowerShell)**:
```powershell
Expand-Archive -Path .\leave-management-assignment.zip -DestinationPath .\leave-management-assignment
cd .\leave-management-assignment\leave-management-assignment
```
**macOS / Linux (bash)**:
```bash
unzip leave-management-assignment.zip -d leave-management-assignment
cd leave-management-assignment
```

### 2. Install backend dependencies
Change to backend directory and install:
```bash
cd backend
npm install
```

If `sqlite3` fails to install on Windows, install the "Build Tools for Visual Studio" (C++ build tools) and Python, then retry:
```bash
npm install
```

### 3. Initialize the database (only if required)
`db.js` is designed to create tables automatically. If you prefer an explicit init, run:
```bash
node init_db.js
```
You should see:
```
Database initialized with tables.
```

### 4. Start the backend server
From `backend` folder:
```bash
npm start
```
You should see:
```
Server listening on 3000
```

If port 3000 is busy, start on port 4000:
**macOS / Linux**
```bash
PORT=4000 npm start
```
**PowerShell**
```powershell
$env:PORT=4000; npm start
```

### 5. Serve the frontend
Option A (quick open): double-click `frontend/index.html` and open in browser.  
Option B (recommended): use a static server (avoids CORS/file issues):

**Using npx serve**
```bash
# from project root
npx serve -l 5500 frontend
# open http://localhost:5500
```

**Using Python**
```bash
# from project root
python -m http.server 5500
# open http://localhost:5500/frontend/index.html
```

If backend port is not 3000, edit `frontend/index.html` and change the `base` const to `http://localhost:YOUR_PORT`.

---

## API Endpoints (Base URL: http://localhost:3000)
Below are the main endpoints. See `API_SAMPLE.md` for examples.

1. `POST /employees` — Add employee  
   - Body JSON: `{ "name", "email", "department", "joiningDate" }`
   - Response: created employee object + message.

2. `GET /employees` — List all employees

3. `POST /leaves/apply` — Apply for leave  
   - Body JSON: `{ "emp_id", "start_date", "end_date", "type", "reason" }`
   - Response: created leave request with status `PENDING`.

4. `PUT /leaves/approve/:id` — Approve leave by leave id  
   - If sufficient balance, sets status `APPROVED` and deducts days.
   - If insufficient balance, sets status `REJECTED`.

5. `PUT /leaves/reject/:id` — Reject a pending leave.

6. `GET /leaves/balance/:empId` — Get leave balance for an employee.

7. `GET /leaves` — List all leave requests.

---

## Sample PowerShell Commands (copy & paste)

> Ensure backend is running in one PowerShell window before running these.

**Add employee**
```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/employees" `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"name":"Sidra","email":"sidra@example.com","department":"HR","joiningDate":"2025-01-15"}'
```

**List employees**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/employees"
```

**Apply leave**
```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/leaves/apply" `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"emp_id":1,"start_date":"2025-09-10","end_date":"2025-09-12","type":"ANNUAL","reason":"Family"}'
```

**Approve leave (leave id 1)**
```powershell
Invoke-RestMethod -Method Put -Uri "http://localhost:3000/leaves/approve/1"
```

**Check leave balance**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/leaves/balance/1"
```

---

## Inspecting the SQLite DB directly (optional)
If you have the `sqlite3` CLI:
```bash
sqlite3 backend/database.sqlite
# then:
.tables
SELECT * FROM employees;
SELECT * FROM leave_requests;
SELECT * FROM leave_balances;
.quit
```

---

## Troubleshooting

**Cannot connect / Invoke-RestMethod : Unable to connect**
- Make sure the backend server is running (`npm start`) in a separate terminal.
- Check which port the server logs say (`Server listening on 3000`).
- If running on different port, update the URL accordingly.

**Error: SQLITE_ERROR: no such table**
- Run `node init_db.js` in the backend folder once to create tables.
- Or ensure `db.js` contains the CREATE TABLE IF NOT EXISTS logic and restart the server.

**sqlite3 install/build fails on Windows**
- Install Windows Build Tools and Python, then `npm install` again.
- Alternatively use WSL (Windows Subsystem for Linux) for easier builds.

**CORS / frontend fetch errors**
- Serve frontend via `npx serve` or `python -m http.server` instead of opening the HTML file directly.
- Ensure `cors()` is enabled in `backend/index.js` (it is by default in this bundle).

---

## Assumptions & Edge Cases (see ASSUMPTIONS.md)
- Default total leaves = 20 (per-employee, per-year).
- Dates must be `YYYY-MM-DD`.
- No half-day/partial-day support.
- Overlap checks are not enforced before approval (improvement).
- Concurrent approvals handled by SQLite; for production use transactions/locks.

---

## What to include in submission (Checklist)
- Single ZIP (this bundle) ✔  
- README with setup steps & assumptions ✔  
- ER diagram & HLD pseudocode ✔  
- Source code (backend & frontend) ✔  
- API examples & screenshots (optional - add screenshots in `screenshots/` if you want)  
- (Optional) Live URL if deployed

---

## (Optional) Quick Deploy Guide — Render (backend) + Vercel (frontend)

**Deploy backend to Render (quick steps):**
1. Create GitHub repo and push this code.
2. Sign up at Render, connect your GitHub, create a new Web Service using the backend repo.
3. Build Command: `npm install`
4. Start Command: `npm start` (Render provides a `PORT` env var).
5. Add environment variables if needed.
6. Deploy; note the provided public URL.

**Deploy frontend to Vercel:**
1. Upload the `frontend` folder to a GitHub repo or use Vercel's import.
2. Vercel will serve static site; ensure the frontend points to the deployed backend URL (update `base` in `index.html`).

---

## How to change business logic quickly
- To change default annual leaves (20 → N): search for `20` in `backend/index.js` (where leave_balances are initialized) and update.
- To add leave types: extend validations in `POST /leaves/apply` in `index.js`.

---

## Final notes
- This bundle is intentionally minimal and focused on clarity and speed-of-setup for an assignment. It demonstrates the required features: add employees, apply/approve/reject leaves, and track balances.
- If you'd like, I can update the code to add:
  - Authentication (JWT)
  - Role-based access (HR vs Employee)
  - An admin UI (React) and charts for leave usage
  - Deployment files (Dockerfile, Render/YAML)

---

If you want me to write this README into the project file (overwriting existing README.md) and re-zip the bundle so you can download the updated ZIP, tell me now — I can do that immediately.


---

**Assignment Part 1 coverage:** See `DATA_MODEL.md` for ERD, tables, keys, and indexes. `backend/schema.sql` contains the exact DDL used by the app.
=======
# Mini Leave Management System — Python (FastAPI)

This is a minimal Leave Management System implementing your assessment requirements. It mirrors the GitHub reference you shared, but in Python with FastAPI + SQLite.

## Features
- Add employees (name, email, department, joining date, annual allowance)
- Apply for leave
- Approve/Reject leave
- Fetch leave balance
- List leaves by status
- Validations and edge-case handling

## Tech
- FastAPI, SQLAlchemy, SQLite
- Auto docs at `/docs` and `/redoc` when running locally

## Quick Start
```bash
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Open: http://127.0.0.1:8000/docs
Open: http://127.0.0.1:8000/redoc

## API Summary
- `POST /employees` — add employee
- `GET /employees/{id}` — get employee
- `GET /employees/{id}/balance` — remaining balance
- `POST /leaves` — apply for leave
- `POST /leaves/{id}/decision` — approve/reject (`{ "approve": true|false }`)
- `GET /leaves?status=pending|approved|rejected` — list leaves

See `sample_requests.http` for ready-to-run examples (VS Code REST Client).

## Edge Cases Covered
- Employee not found — 404
- Invalid dates (start > end) — 400
- Applying before joining date — 400
- Overlapping pending/approved requests — 400
- Insufficient balance on apply **and** on approve — 400
- Duplicate email on employee create — 400
- Guard against excessively long single leave (MVP: > 60 days) — 400

## Assumptions
- Annual allowance defaults to 24 days; counts calendar days (inclusive). (Can be swapped to business days)
- Only *annual* leaves consume allowance; other types are tracked but not deducted in MVP.
- Overlap check blocks conflicts with both approved and pending requests for the same employee.
- No authentication in the MVP (can be added with OAuth/JWT).

## High Level Design (HLD)
![HLD](docs/HLD.png)

**Flow:** UI/Client → FastAPI → CRUD/Service → SQLAlchemy → SQLite. Balance is derived from approved leaves. Scaling notes:
- Move from SQLite → Postgres/MySQL
- Add read replicas and a job queue for heavy calculations
- Introduce auth service & RBAC for HR vs employee actions
- Use containerization (Docker) and a PaaS (Render/Heroku) for deployment

## Project Layout
```
app/
  main.py         # FastAPI endpoints
  database.py     # DB engine/session
  models.py       # ORM models
  schemas.py      # Pydantic schemas
  crud.py         # business logic
  utils.py        # helpers
docs/
  HLD.png
provided_assets/  # copied from your uploaded ZIP for reference/history
sample_requests.http
requirements.txt
README.md
```

## Potential Improvements
- Working days/holidays calendar & half-day support
- Accrual policy, carry-forward, and encashment
- Attachments & leave cancellation
- Email/Slack notifications on approvals
- Admin UI (React) + role-based permissions
- Unit tests & CI pipeline

## Deployment (Render example)
- Create a new Web Service, build with `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- Add a persistent DB (e.g., Postgres) and set the URL in `database.py`

---

**Assessment Mapping:** This repository covers Part 1 (APIs) and Part 2 (HLD + scaling). ReadMe includes setup, assumptions, edge cases, and improvements. Screenshots can be added from Swagger UI after running locally.
>>>>>>> 483795f721c374317f22f31a3d64998bef64845a
