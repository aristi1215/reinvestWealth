# Rival IQ — ReInvestWealth Competitor Intelligence

A full-stack competitive intelligence dashboard for ReInvestWealth: it
scrapes public review platforms, runs themed AI analyses on the reviews,
and surfaces actionable insight (pain themes, feature gaps, sentiment,
copy suggestions) through a polished dashboard.

The repo is a npm-workspace monorepo:

```
/backend     Express + TypeScript API
/frontend    Vite + React 19 + TanStack Router dashboard
```

The application is built so the **demo works out of the box with no
external services**. Supabase, Gemini, Playwright, and the cron scheduler
are all _optional_ — enable them by setting environment variables.

## Highlights

- **5 tracked products**: ReInvestWealth, QuickBooks Online, FreshBooks, Wave, Xero
- **Pages**: Dashboard, Competitors grid, Competitor detail (4 tabs), Reviews browser, Analysis hub, Weekly Digest
- **AI runs**: pain themes, feature gaps, sentiment, copy suggestions (or `full` chained run)
- **Live job pipeline**: scrape and analysis triggers spawn background jobs; the UI polls every 2.5s and surfaces toasts on completion
- **Design system**: dark sidebar / light content surface, custom tokens, Inter + JetBrains Mono, Recharts visualizations, animated status badges
- **Mock-first**: rich seed data for all 5 companies plus realistic AI analysis results so the dashboard looks "loaded" the moment it boots

## Prerequisites

- Node.js 20+
- npm 10+
- (optional) Supabase project (URL + service role key)
- (optional) Google Gemini API key
- (optional) Playwright browser binaries (`npx playwright install chromium`)

## Setup

```bash
git clone <repo>
cd <repo>
npm install
```

Both `frontend` and `backend` install via npm workspaces.

### Configure environment (optional)

Without env vars the app runs in mock mode for everything. To use real
services:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# edit backend/.env and add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
# GEMINI_API_KEY, etc. as desired
```

### Supabase (optional)

If you want to persist to Postgres, run the migrations in
[`docs/schema.sql`](docs/schema.sql) on a Supabase project, then set
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`.

The schema seeds the 5 companies and stores reviews / analysis runs /
scrape jobs / weekly digests. Until both env vars are set, the backend
uses an in-memory store seeded with realistic data.

## Run

```bash
npm run dev
```

This boots both processes via `concurrently`:

- Backend: <http://localhost:3001>
- Frontend: <http://localhost:5173> (proxies `/api` to the backend)

Health check: <http://localhost:3001/health>

## Trigger a scrape and analysis

From the UI:

1. Open the dashboard, click **Sync** (top-right) to scrape all companies
2. Click **Analyze All** to run the 4 analyses across all companies
3. Watch the Header pill, sidebar status, and toasts update as jobs progress

From the CLI:

```bash
# Scrape all companies, all platforms
curl -X POST http://localhost:3001/api/v1/scrape \
  -H 'Content-Type: application/json' \
  -d '{"company_slug":"all","platform":"all"}'

# Run a sentiment analysis just for QuickBooks
curl -X POST http://localhost:3001/api/v1/analysis \
  -H 'Content-Type: application/json' \
  -d '{"company_slug":"quickbooks","run_type":"sentiment"}'

# Generate a fresh weekly digest
curl -X POST http://localhost:3001/api/v1/digest/generate
```

## API surface

All routes under `/api/v1`.

| Method | Path | Notes |
|---|---|---|
| GET | `/companies` | List tracked companies + counts |
| GET | `/companies/:slug` | Detail with latest analysis runs |
| GET | `/reviews` | Filtered + paginated reviews |
| POST | `/scrape` | `{ company_slug, platform }` — kicks off a scrape job |
| GET | `/scrape/jobs` | All scrape jobs |
| GET | `/scrape/jobs/:id` | Single scrape job |
| POST | `/analysis` | `{ company_slug, run_type }` — kicks off analysis |
| GET | `/analysis/runs` | Filterable runs list |
| GET | `/analysis/runs/:id` | Single run with result |
| DELETE | `/analysis/runs/:id` | Remove a run |
| GET | `/digest/latest` | Most recent digest (auto-generates if missing) |
| POST | `/digest/generate` | Build a fresh digest |
| GET | `/dashboard/summary` | Aggregate dashboard payload |

## Known limitations

- **Playwright**: by default scrapes return synthetic "fresh" reviews so
  the live job pipeline can be demoed safely. Set `ENABLE_PLAYWRIGHT=true`
  and install browsers (`npx playwright install chromium`) to do real
  scrapes — note that Capterra/G2 may return bot challenges.
- **Gemini free tier**: 15 RPM. The service enforces a minimum 5s
  interval between calls and retries on 429s. Full analysis across all
  5 companies (4 analysis types) takes ~2 minutes minimum.
- **Auth**: this build assumes a trusted operator. Add Supabase Auth
  before exposing publicly.
