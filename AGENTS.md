# ReinvestWealth

npm workspaces monorepo with two workspaces: `frontend` (React 19 + Vite + TanStack Router + Tailwind v4 + Zustand + Axios) and `backend` (Express 5 + Supabase, TypeScript ESM).

## Cursor Cloud specific instructions

### Services
- **frontend** (Vite dev server) — port `5173`. Standard scripts in `frontend/package.json` (`dev`, `build`, `lint`, `preview`).
- **backend** (Express API) — port `3001`, endpoints `/health` and `/api`. Standard scripts in `backend/package.json` (`dev`, `build`, `start`).
- Run both together from the repo root with `npm run dev` (root `package.json` uses `concurrently`). Build everything with `npm run build`.

### Non-obvious notes
- The Vite dev server proxies `/api` → `http://localhost:3001` (see `frontend/vite.config.ts`); the frontend Axios client uses the relative `baseURL: '/api'`. The backend must be running for any `/api` call to resolve.
- The backend boots fine without Supabase env vars: `getSupabaseClient()` is lazy and only throws if/when a Supabase call is made. No code path calls it yet, so the app runs end-to-end with no `.env`. Add `backend/.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only when implementing Supabase-backed features (see `backend/src/config/env.ts`).
- `npm run lint` (frontend) currently reports 2 pre-existing errors in the scaffold (`src/routes/index.tsx` react-refresh, `src/stores/appStore.ts` empty-object-type). These are existing code issues, not environment problems; the lint toolchain itself works.
- There is no application-level auth, no login UI, and no real domain features yet — the app is an early scaffold.
