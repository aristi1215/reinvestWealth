import { Router } from 'express'
import { store } from '../db/store.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import type { Company, RunType } from '../types/index.js'

export const dashboardRouter = Router()

const RUN_TYPES: Exclude<RunType, 'full'>[] = [
  'pain_themes',
  'feature_gaps',
  'sentiment',
  'copy_suggestions',
]

dashboardRouter.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const companies = await store.listCompanies()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const perCompany = await Promise.all(
      companies.map(async (c: Company) => {
        const reviews = await store.getReviewsByCompanyId(c.id)
        const ratings = reviews.map((r) => r.rating ?? 0).filter((n) => n > 0)
        const avg =
          ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
              10
            : null
        const newReviews = reviews.filter(
          (r) => new Date(r.scraped_at) >= sevenDaysAgo,
        ).length
        const latest_runs = Object.fromEntries(
          await Promise.all(
            RUN_TYPES.map(async (rt) => {
              if (rt === 'copy_suggestions' && c.is_own_product) {
                return [rt, null] as const
              }
              return [
                rt,
                (await store.latestCompletedRun(c.id, rt)) ?? null,
              ] as const
            }),
          ),
        )

        return {
          company: c,
          review_count: reviews.length,
          average_rating: avg,
          new_reviews_7d: newReviews,
          last_scraped_at: await store.latestScrapedAt(c.id),
          latest_runs,
        }
      }),
    )

    const allReviews = await store.listReviews()
    const allRuns = await store.listAnalysisRuns()
    const scrapeJobs = await store.listScrapeJobs()

    const totals = {
      total_reviews: allReviews.length,
      companies: companies.length,
      new_reviews_7d: perCompany.reduce((a, b) => a + b.new_reviews_7d, 0),
      platforms: ['capterra', 'g2'],
    }

    const lastAnalysisRun = [...allRuns]
      .filter((r) => r.status === 'completed' && r.completed_at)
      .sort((a, b) =>
        (b.completed_at ?? '').localeCompare(a.completed_at ?? ''),
      )[0]

    const recentReviews = await Promise.all(
      [...allReviews]
        .sort((a, b) => b.scraped_at.localeCompare(a.scraped_at))
        .slice(0, 12)
        .map(async (r) => ({
          ...r,
          company: (await store.getCompanyById(r.company_id)) ?? null,
        })),
    )

    const activeJobs = scrapeJobs.filter(
      (j) => j.status === 'running' || j.status === 'pending',
    )

    res.json({
      totals,
      per_company: perCompany,
      last_analysis_run: lastAnalysisRun ?? null,
      recent_reviews: recentReviews,
      active_scrape_jobs: activeJobs,
    })
  }),
)
