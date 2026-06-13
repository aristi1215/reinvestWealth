-- Rival IQ — Supabase / Postgres schema
-- Run these statements on a fresh Supabase project before connecting the
-- backend with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_own_product BOOLEAN DEFAULT FALSE,
  capterra_url TEXT,
  g2_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('capterra', 'g2', 'getapp')),
  external_id TEXT,
  reviewer_name TEXT,
  reviewer_role TEXT,
  reviewer_company_size TEXT,
  rating NUMERIC(2,1),
  review_date DATE,
  title TEXT,
  pros_text TEXT,
  cons_text TEXT,
  full_text TEXT,
  switched_from TEXT,
  raw_html TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, platform, external_id)
);

CREATE TABLE IF NOT EXISTS analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL CHECK (run_type IN ('pain_themes', 'feature_gaps', 'sentiment', 'copy_suggestions', 'full')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  model_used TEXT DEFAULT 'gemini-2.0-flash',
  reviews_analyzed INTEGER,
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start)
);

CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  reviews_scraped INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_company_idx ON reviews(company_id);
CREATE INDEX IF NOT EXISTS reviews_platform_idx ON reviews(platform);
CREATE INDEX IF NOT EXISTS reviews_review_date_idx ON reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS analysis_runs_company_idx ON analysis_runs(company_id);
CREATE INDEX IF NOT EXISTS analysis_runs_run_type_idx ON analysis_runs(run_type);
CREATE INDEX IF NOT EXISTS analysis_runs_status_idx ON analysis_runs(status);
CREATE INDEX IF NOT EXISTS scrape_jobs_company_idx ON scrape_jobs(company_id);

-- Seed companies
INSERT INTO companies (slug, display_name, is_own_product, capterra_url, g2_slug)
VALUES
  ('reinvestwealth', 'ReInvestWealth', TRUE,  'https://www.capterra.com/p/10025243/ReInvestWealth/reviews/', NULL),
  ('quickbooks',     'QuickBooks Online', FALSE, 'https://www.capterra.com/p/190778/QuickBooks-Online/reviews/', 'quickbooks-online'),
  ('freshbooks',     'FreshBooks',       FALSE, 'https://www.capterra.com/p/142390/FreshBooks/reviews/',       'freshbooks'),
  ('wave',           'Wave',             FALSE, 'https://www.capterra.com/p/178021/Wave-Apps/reviews/',        'wave-accounting'),
  ('xero',           'Xero',             FALSE, 'https://www.capterra.com/p/196946/Xero/reviews/',             'xero')
ON CONFLICT (slug) DO NOTHING;
