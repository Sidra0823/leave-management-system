# Run instructions (Backend)

## Prerequisites
- Node.js (v16+)
- npm

## Steps
1. Open terminal and go to `backend/`
2. Install dependencies:
   ```
   npm install
   ```
3. Initialize the database and start server:
   ```
   node index.js
   ```
   The server listens on port 3000 by default.

## Notes
- The backend uses `database.sqlite` created automatically in `backend/` on first run.
- Use the provided `frontend/index.html` to test simple flows, or use Postman to call the APIs in `API_SAMPLE.md`.
