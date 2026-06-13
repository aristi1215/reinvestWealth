export type Platform = 'capterra' | 'g2' | 'getapp'

export type RunType =
  | 'pain_themes'
  | 'feature_gaps'
  | 'sentiment'
  | 'copy_suggestions'
  | 'full'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Company {
  id: string
  slug: string
  display_name: string
  is_own_product: boolean
  capterra_url: string | null
  g2_slug: string | null
  created_at: string
}

export interface Review {
  id: string
  company_id: string
  platform: Platform
  external_id: string | null
  reviewer_name: string | null
  reviewer_role: string | null
  reviewer_company_size: string | null
  rating: number | null
  review_date: string | null
  title: string | null
  pros_text: string | null
  cons_text: string | null
  full_text: string | null
  switched_from: string | null
  raw_html: string | null
  scraped_at: string
}

export interface PainTheme {
  label: string
  description: string
  frequency_pct: number
  verbatim_phrases: string[]
  severity: number
}

export interface FeatureGap {
  feature_name: string
  description: string
  demand_count: number
  opportunity_score: number
  complexity: 'quick_win' | 'medium' | 'complex'
}

export interface SentimentResult {
  overall_sentiment: 'positive' | 'mixed' | 'negative'
  nps_estimate: number
  positive_aspects: { aspect: string; frequency_pct: number }[]
  negative_aspects: { aspect: string; frequency_pct: number }[]
  emotional_keywords: string[]
}

export interface CopySuggestionsResult {
  ad_headlines: string[]
  value_propositions: string[]
  resonant_phrases: string[]
  search_keywords: string[]
}

export type AnalysisResult =
  | { themes: PainTheme[] }
  | { gaps: FeatureGap[] }
  | SentimentResult
  | CopySuggestionsResult
  | FullAnalysisResult

export interface FullAnalysisResult {
  pain_themes: { themes: PainTheme[] }
  feature_gaps: { gaps: FeatureGap[] }
  sentiment: SentimentResult
  copy_suggestions: CopySuggestionsResult | null
}

export interface AnalysisRun {
  id: string
  company_id: string
  run_type: RunType
  status: JobStatus
  model_used: string
  reviews_analyzed: number | null
  result: AnalysisResult | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface ScrapeJob {
  id: string
  company_id: string
  platform: Platform | 'all'
  status: JobStatus
  reviews_scraped: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface WeeklyDigest {
  id: string
  week_start: string
  data: WeeklyDigestData
  created_at: string
}

export interface WeeklyDigestData {
  whats_new: { company_slug: string; new_review_count: number; avg_rating: number }[]
  emerging_pain_themes: {
    company_slug: string
    label: string
    delta_pct: number
    frequency_pct: number
  }[]
  competitive_opportunities: {
    company_slug: string
    headline: string
    resonant_phrase: string
  }[]
  top_reviews: {
    review_id: string
    company_slug: string
    rating: number
    title: string
    excerpt: string
  }[]
}
