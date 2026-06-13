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

export const store = {
  // Companies
  listCompanies(): Company[] {
    return [...db.companies]
  },
  getCompanyBySlug(slug: string): Company | undefined {
    return db.companies.find((c) => c.slug === slug)
  },
  getCompanyById(id: string): Company | undefined {
    return db.companies.find((c) => c.id === id)
  },

  // Reviews
  listReviews(): Review[] {
    return [...db.reviews]
  },
  getReviewsByCompanyId(companyId: string): Review[] {
    return db.reviews.filter((r) => r.company_id === companyId)
  },
  getReviewById(id: string): Review | undefined {
    return db.reviews.find((r) => r.id === id)
  },
  upsertReview(review: Review): Review {
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
  countReviewsSince(companyId: string, since: Date): number {
    return db.reviews.filter(
      (r) => r.company_id === companyId && new Date(r.scraped_at) >= since,
    ).length
  },
  latestScrapedAt(companyId: string): string | null {
    const rs = db.reviews.filter((r) => r.company_id === companyId)
    if (!rs.length) return null
    return rs
      .map((r) => r.scraped_at)
      .sort()
      .at(-1) ?? null
  },

  // Analysis runs
  listAnalysisRuns(): AnalysisRun[] {
    return [...db.analysisRuns]
  },
  getAnalysisRun(id: string): AnalysisRun | undefined {
    return db.analysisRuns.find((r) => r.id === id)
  },
  createAnalysisRun(input: Omit<AnalysisRun, 'id' | 'created_at'>): AnalysisRun {
    const run: AnalysisRun = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      ...input,
    }
    db.analysisRuns.unshift(run)
    return run
  },
  updateAnalysisRun(id: string, patch: Partial<AnalysisRun>): AnalysisRun | undefined {
    const idx = db.analysisRuns.findIndex((r) => r.id === id)
    if (idx < 0) return undefined
    db.analysisRuns[idx] = { ...db.analysisRuns[idx], ...patch }
    return db.analysisRuns[idx]
  },
  deleteAnalysisRun(id: string): boolean {
    const idx = db.analysisRuns.findIndex((r) => r.id === id)
    if (idx < 0) return false
    db.analysisRuns.splice(idx, 1)
    return true
  },
  latestCompletedRun(
    companyId: string,
    runType: AnalysisRun['run_type'],
  ): AnalysisRun | undefined {
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

  // Scrape jobs
  listScrapeJobs(): ScrapeJob[] {
    return [...db.scrapeJobs]
  },
  getScrapeJob(id: string): ScrapeJob | undefined {
    return db.scrapeJobs.find((j) => j.id === id)
  },
  createScrapeJob(input: {
    company_id: string
    platform: Platform | 'all'
  }): ScrapeJob {
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
  updateScrapeJob(id: string, patch: Partial<ScrapeJob>): ScrapeJob | undefined {
    const idx = db.scrapeJobs.findIndex((j) => j.id === id)
    if (idx < 0) return undefined
    db.scrapeJobs[idx] = { ...db.scrapeJobs[idx], ...patch }
    return db.scrapeJobs[idx]
  },

  // Digests
  listDigests(): WeeklyDigest[] {
    return [...db.digests]
  },
  latestDigest(): WeeklyDigest | undefined {
    return [...db.digests].sort((a, b) =>
      b.week_start.localeCompare(a.week_start),
    )[0]
  },
  saveDigest(digest: WeeklyDigest): void {
    const idx = db.digests.findIndex((d) => d.week_start === digest.week_start)
    if (idx >= 0) db.digests[idx] = digest
    else db.digests.unshift(digest)
  },
}
