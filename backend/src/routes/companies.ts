import { Router } from 'express'
import { store } from '../db/store.js'
import { AppError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

export const companiesRouter = Router()

companiesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const companies = await store.listCompanies()
    const enriched = await Promise.all(
      companies.map(async (c) => {
        const reviews = await store.getReviewsByCompanyId(c.id)
        const ratings = reviews.map((r) => r.rating ?? 0).filter((n) => n > 0)
        const avg =
          ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
              10
            : null
        return {
          ...c,
          review_count: reviews.length,
          average_rating: avg,
          last_scraped_at: await store.latestScrapedAt(c.id),
        }
      }),
    )
    res.json({ companies: enriched })
  }),
)

companiesRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const company = await store.getCompanyBySlug(req.params.slug as string)
    if (!company) throw new AppError('Company not found', 404, 'NOT_FOUND')
    const reviews = await store.getReviewsByCompanyId(company.id)
    const ratings = reviews.map((r) => r.rating ?? 0).filter((n) => n > 0)
    const avg =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
          10
        : null
    const platformCounts = reviews.reduce<Record<string, number>>((acc, r) => {
      acc[r.platform] = (acc[r.platform] ?? 0) + 1
      return acc
    }, {})

    const latestRuns = {
      pain_themes:
        (await store.latestCompletedRun(company.id, 'pain_themes')) ?? null,
      feature_gaps:
        (await store.latestCompletedRun(company.id, 'feature_gaps')) ?? null,
      sentiment:
        (await store.latestCompletedRun(company.id, 'sentiment')) ?? null,
      copy_suggestions: company.is_own_product
        ? null
        : ((await store.latestCompletedRun(company.id, 'copy_suggestions')) ??
          null),
    }

    res.json({
      company,
      review_count: reviews.length,
      average_rating: avg,
      platform_counts: platformCounts,
      last_scraped_at: await store.latestScrapedAt(company.id),
      latest_runs: latestRuns,
    })
  }),
)
