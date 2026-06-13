import { randomUUID } from 'node:crypto'
import { SEED_COMPANIES } from '../data/seedCompanies.js'
import { buildSeedReviews } from '../data/seedReviews.js'
import { buildSeedAnalysisRuns } from '../data/seedAnalyses.js'
import type {
  AnalysisRun,
  Company,
  Platform,
  Review,
  ScrapeJob,
  WeeklyDigest,
} from '../types/index.js'

interface MemoryDB {
  companies: Company[]
  reviews: Review[]
  analysisRuns: AnalysisRun[]
  scrapeJobs: ScrapeJob[]
  digests: WeeklyDigest[]
}

const db: MemoryDB = {
  companies: [...SEED_COMPANIES],
  reviews: buildSeedReviews(SEED_COMPANIES),
  analysisRuns: buildSeedAnalysisRuns(SEED_COMPANIES),
  scrapeJobs: [],
  digests: [],
}

export const memoryStore = {
  async listCompanies(): Promise<Company[]> {
    return [...db.companies]
  },
  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    return db.companies.find((c) => c.slug === slug)
  },
  async getCompanyById(id: string): Promise<Company | undefined> {
    return db.companies.find((c) => c.id === id)
  },

  async listReviews(): Promise<Review[]> {
    return [...db.reviews]
  },
  async getReviewsByCompanyId(companyId: string): Promise<Review[]> {
    return db.reviews.filter((r) => r.company_id === companyId)
  },
  async getReviewById(id: string): Promise<Review | undefined> {
    return db.reviews.find((r) => r.id === id)
  },
  async upsertReview(review: Review): Promise<Review> {
    const idx = db.reviews.findIndex(
      (r) =>
        r.company_id === review.company_id &&
        r.platform === review.platform &&
        r.external_id === review.external_id,
    )
    if (idx >= 0) {
      db.reviews[idx] = review
      return review
    }
    db.reviews.push(review)
    return review
  },
  async countReviewsSince(companyId: string, since: Date): Promise<number> {
    return db.reviews.filter(
      (r) => r.company_id === companyId && new Date(r.scraped_at) >= since,
    ).length
  },
  async latestScrapedAt(companyId: string): Promise<string | null> {
    const rs = db.reviews.filter((r) => r.company_id === companyId)
    if (!rs.length) return null
    return rs
      .map((r) => r.scraped_at)
      .sort()
      .at(-1) ?? null
  },

  async listAnalysisRuns(): Promise<AnalysisRun[]> {
    return [...db.analysisRuns]
  },
  async getAnalysisRun(id: string): Promise<AnalysisRun | undefined> {
    return db.analysisRuns.find((r) => r.id === id)
  },
  async createAnalysisRun(
    input: Omit<AnalysisRun, 'id' | 'created_at'>,
  ): Promise<AnalysisRun> {
    const run: AnalysisRun = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      ...input,
    }
    db.analysisRuns.unshift(run)
    return run
  },
  async updateAnalysisRun(
    id: string,
    patch: Partial<AnalysisRun>,
  ): Promise<AnalysisRun | undefined> {
    const idx = db.analysisRuns.findIndex((r) => r.id === id)
    if (idx < 0) return undefined
    db.analysisRuns[idx] = { ...db.analysisRuns[idx], ...patch }
    return db.analysisRuns[idx]
  },
  async deleteAnalysisRun(id: string): Promise<boolean> {
    const idx = db.analysisRuns.findIndex((r) => r.id === id)
    if (idx < 0) return false
    db.analysisRuns.splice(idx, 1)
    return true
  },
  async latestCompletedRun(
    companyId: string,
    runType: AnalysisRun['run_type'],
  ): Promise<AnalysisRun | undefined> {
    return db.analysisRuns
      .filter(
        (r) =>
          r.company_id === companyId &&
          r.run_type === runType &&
          r.status === 'completed',
      )
      .sort((a, b) =>
        (b.completed_at ?? b.created_at).localeCompare(
          a.completed_at ?? a.created_at,
        ),
      )[0]
  },

  async listScrapeJobs(): Promise<ScrapeJob[]> {
    return [...db.scrapeJobs]
  },
  async getScrapeJob(id: string): Promise<ScrapeJob | undefined> {
    return db.scrapeJobs.find((j) => j.id === id)
  },
  async createScrapeJob(input: {
    company_id: string
    platform: Platform | 'all'
  }): Promise<ScrapeJob> {
    const job: ScrapeJob = {
      id: randomUUID(),
      company_id: input.company_id,
      platform: input.platform,
      status: 'pending',
      reviews_scraped: 0,
      error_message: null,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    }
    db.scrapeJobs.unshift(job)
    return job
  },
  async updateScrapeJob(
    id: string,
    patch: Partial<ScrapeJob>,
  ): Promise<ScrapeJob | undefined> {
    const idx = db.scrapeJobs.findIndex((j) => j.id === id)
    if (idx < 0) return undefined
    db.scrapeJobs[idx] = { ...db.scrapeJobs[idx], ...patch }
    return db.scrapeJobs[idx]
  },

  async listDigests(): Promise<WeeklyDigest[]> {
    return [...db.digests]
  },
  async latestDigest(): Promise<WeeklyDigest | undefined> {
    return [...db.digests].sort((a, b) =>
      b.week_start.localeCompare(a.week_start),
    )[0]
  },
  async saveDigest(digest: WeeklyDigest): Promise<void> {
    const idx = db.digests.findIndex((d) => d.week_start === digest.week_start)
    if (idx >= 0) db.digests[idx] = digest
    else db.digests.unshift(digest)
  },
}
