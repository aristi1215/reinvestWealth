import axios from 'axios'
import type {
  AnalysisRun,
  Company,
  CompanyDetail,
  DashboardSummary,
  Review,
  RunType,
  ScrapeJob,
  WeeklyDigest,
} from '../types'

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchCompanies(): Promise<Company[]> {
  const { data } = await api.get<{ companies: Company[] }>('/companies')
  return data.companies
}

export async function fetchCompany(slug: string): Promise<CompanyDetail> {
  const { data } = await api.get<CompanyDetail>(`/companies/${slug}`)
  return data
}

export interface ReviewQuery {
  company_slug?: string
  platform?: string
  rating_min?: number
  rating_max?: number
  date_from?: string
  date_to?: string
  has_pros?: boolean
  has_cons?: boolean
  switched_from?: string
  search?: string
  page?: number
  per_page?: number
  sort?: 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc'
}

export interface ReviewsResponse {
  reviews: Review[]
  total: number
  page: number
  per_page: number
  stats: {
    average_rating: number | null
    platform_counts: Record<string, number>
  }
}

export async function fetchReviews(query: ReviewQuery = {}): Promise<ReviewsResponse> {
  const params = Object.fromEntries(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== '' && v !== null)
      .map(([k, v]) => [k, typeof v === 'boolean' ? String(v) : v]),
  )
  const { data } = await api.get<ReviewsResponse>('/reviews', { params })
  return data
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary')
  return data
}

export async function fetchAnalysisRuns(filters: {
  company_slug?: string
  run_type?: string
  status?: string
} = {}): Promise<AnalysisRun[]> {
  const { data } = await api.get<{ runs: AnalysisRun[] }>('/analysis/runs', {
    params: filters,
  })
  return data.runs
}

export async function fetchAnalysisRun(id: string): Promise<AnalysisRun> {
  const { data } = await api.get<{ run: AnalysisRun }>(`/analysis/runs/${id}`)
  return data.run
}

export async function triggerAnalysis(input: {
  company_slug: string
  run_type: RunType
}): Promise<{ run?: AnalysisRun; runs?: AnalysisRun[] }> {
  const { data } = await api.post<{ run?: AnalysisRun; runs?: AnalysisRun[] }>(
    '/analysis',
    input,
  )
  return data
}

export async function deleteAnalysisRun(id: string): Promise<void> {
  await api.delete(`/analysis/runs/${id}`)
}

export async function fetchScrapeJobs(): Promise<ScrapeJob[]> {
  const { data } = await api.get<{ jobs: ScrapeJob[] }>('/scrape/jobs')
  return data.jobs
}

export async function fetchScrapeJob(id: string): Promise<ScrapeJob> {
  const { data } = await api.get<{ job: ScrapeJob }>(`/scrape/jobs/${id}`)
  return data.job
}

export async function triggerScrape(input: {
  company_slug: string
  platform: 'capterra' | 'g2' | 'all'
}): Promise<{ job?: ScrapeJob; jobs?: ScrapeJob[] }> {
  const { data } = await api.post<{ job?: ScrapeJob; jobs?: ScrapeJob[] }>(
    '/scrape',
    input,
  )
  return data
}

export async function fetchLatestDigest(): Promise<WeeklyDigest> {
  const { data } = await api.get<{ digest: WeeklyDigest }>('/digest/latest')
  return data.digest
}

export async function generateDigest(): Promise<WeeklyDigest> {
  const { data } = await api.post<{ digest: WeeklyDigest }>('/digest/generate')
  return data.digest
}
