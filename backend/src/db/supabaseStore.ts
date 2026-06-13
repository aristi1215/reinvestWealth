import { getSupabaseClient } from './supabase.js'
import type {
  AnalysisRun,
  Company,
  Platform,
  Review,
  ScrapeJob,
  WeeklyDigest,
} from '../types/index.js'

function client() {
  const sb = getSupabaseClient()
  if (!sb) throw new Error('Supabase is not configured')
  return sb
}

function mapReview(row: Record<string, unknown>): Review {
  const review = row as unknown as Review
  return {
    ...review,
    rating: row.rating != null ? Number(row.rating) : null,
  }
}

function mapAnalysisRun(row: Record<string, unknown>): AnalysisRun {
  return row as unknown as AnalysisRun
}

export const supabaseStore = {
  async listCompanies(): Promise<Company[]> {
    const { data, error } = await client()
      .from('companies')
      .select('*')
      .order('display_name')
    if (error) throw error
    return (data ?? []) as Company[]
  },
  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const { data, error } = await client()
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return (data as Company | null) ?? undefined
  },
  async getCompanyById(id: string): Promise<Company | undefined> {
    const { data, error } = await client()
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return (data as Company | null) ?? undefined
  },

  async listReviews(): Promise<Review[]> {
    const { data, error } = await client().from('reviews').select('*')
    if (error) throw error
    return (data ?? []).map((row) => mapReview(row as Record<string, unknown>))
  },
  async getReviewsByCompanyId(companyId: string): Promise<Review[]> {
    const { data, error } = await client()
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
    if (error) throw error
    return (data ?? []).map((row) => mapReview(row as Record<string, unknown>))
  },
  async getReviewById(id: string): Promise<Review | undefined> {
    const { data, error } = await client()
      .from('reviews')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
      ? mapReview(data as Record<string, unknown>)
      : undefined
  },
  async upsertReview(review: Review): Promise<Review> {
    const { data, error } = await client()
      .from('reviews')
      .upsert(review, { onConflict: 'company_id,platform,external_id' })
      .select()
      .single()
    if (error) throw error
    return mapReview(data as Record<string, unknown>)
  },
  async countReviewsSince(companyId: string, since: Date): Promise<number> {
    const { count, error } = await client()
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('scraped_at', since.toISOString())
    if (error) throw error
    return count ?? 0
  },
  async latestScrapedAt(companyId: string): Promise<string | null> {
    const { data, error } = await client()
      .from('reviews')
      .select('scraped_at')
      .eq('company_id', companyId)
      .order('scraped_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return (data?.scraped_at as string | undefined) ?? null
  },

  async listAnalysisRuns(): Promise<AnalysisRun[]> {
    const { data, error } = await client().from('analysis_runs').select('*')
    if (error) throw error
    return (data ?? []).map((row) =>
      mapAnalysisRun(row as Record<string, unknown>),
    )
  },
  async getAnalysisRun(id: string): Promise<AnalysisRun | undefined> {
    const { data, error } = await client()
      .from('analysis_runs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
      ? mapAnalysisRun(data as Record<string, unknown>)
      : undefined
  },
  async createAnalysisRun(
    input: Omit<AnalysisRun, 'id' | 'created_at'>,
  ): Promise<AnalysisRun> {
    const { data, error } = await client()
      .from('analysis_runs')
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return mapAnalysisRun(data as Record<string, unknown>)
  },
  async updateAnalysisRun(
    id: string,
    patch: Partial<AnalysisRun>,
  ): Promise<AnalysisRun | undefined> {
    const { data, error } = await client()
      .from('analysis_runs')
      .update(patch)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data
      ? mapAnalysisRun(data as Record<string, unknown>)
      : undefined
  },
  async deleteAnalysisRun(id: string): Promise<boolean> {
    const { error, count } = await client()
      .from('analysis_runs')
      .delete({ count: 'exact' })
      .eq('id', id)
    if (error) throw error
    return (count ?? 0) > 0
  },
  async latestCompletedRun(
    companyId: string,
    runType: AnalysisRun['run_type'],
  ): Promise<AnalysisRun | undefined> {
    const { data, error } = await client()
      .from('analysis_runs')
      .select('*')
      .eq('company_id', companyId)
      .eq('run_type', runType)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
      ? mapAnalysisRun(data as Record<string, unknown>)
      : undefined
  },

  async listScrapeJobs(): Promise<ScrapeJob[]> {
    const { data, error } = await client()
      .from('scrape_jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as ScrapeJob[]
  },
  async getScrapeJob(id: string): Promise<ScrapeJob | undefined> {
    const { data, error } = await client()
      .from('scrape_jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return (data as ScrapeJob | null) ?? undefined
  },
  async createScrapeJob(input: {
    company_id: string
    platform: Platform | 'all'
  }): Promise<ScrapeJob> {
    const { data, error } = await client()
      .from('scrape_jobs')
      .insert({
        company_id: input.company_id,
        platform: input.platform,
        status: 'pending',
        reviews_scraped: 0,
      })
      .select()
      .single()
    if (error) throw error
    return data as ScrapeJob
  },
  async updateScrapeJob(
    id: string,
    patch: Partial<ScrapeJob>,
  ): Promise<ScrapeJob | undefined> {
    const { data, error } = await client()
      .from('scrape_jobs')
      .update(patch)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return (data as ScrapeJob | null) ?? undefined
  },

  async listDigests(): Promise<WeeklyDigest[]> {
    const { data, error } = await client()
      .from('weekly_digests')
      .select('*')
      .order('week_start', { ascending: false })
    if (error) throw error
    return (data ?? []) as WeeklyDigest[]
  },
  async latestDigest(): Promise<WeeklyDigest | undefined> {
    const { data, error } = await client()
      .from('weekly_digests')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return (data as WeeklyDigest | null) ?? undefined
  },
  async saveDigest(digest: WeeklyDigest): Promise<void> {
    const { error } = await client()
      .from('weekly_digests')
      .upsert(
        {
          id: digest.id,
          week_start: digest.week_start,
          data: digest.data,
          created_at: digest.created_at,
        },
        { onConflict: 'week_start' },
      )
    if (error) throw error
  },
}
