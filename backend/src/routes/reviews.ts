import { Router } from 'express'
import { z } from 'zod'
import { store } from '../db/store.js'
import { AppError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import type { Review } from '../types/index.js'

export const reviewsRouter = Router()

const sortOptions = [
  'date_desc',
  'date_asc',
  'rating_desc',
  'rating_asc',
] as const

const querySchema = z.object({
  platform: z.string().optional(),
  rating_min: z.coerce.number().min(0).max(5).optional(),
  rating_max: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(sortOptions).default('date_desc'),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  has_pros: z.enum(['true', 'false']).optional(),
  has_cons: z.enum(['true', 'false']).optional(),
  switched_from: z.string().optional(),
  search: z.string().optional(),
  company_slug: z.string().optional(),
})

function applySort(reviews: Review[], sort: (typeof sortOptions)[number]) {
  const sorted = [...reviews]
  switch (sort) {
    case 'date_asc':
      sorted.sort((a, b) =>
        (a.review_date ?? '').localeCompare(b.review_date ?? ''),
      )
      break
    case 'date_desc':
      sorted.sort((a, b) =>
        (b.review_date ?? '').localeCompare(a.review_date ?? ''),
      )
      break
    case 'rating_asc':
      sorted.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0))
      break
    case 'rating_desc':
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
  }
  return sorted
}

reviewsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const params = querySchema.parse(req.query)
    let reviews = await store.listReviews()

    if (params.company_slug) {
      const slugs = params.company_slug.split(',')
      const companyIds = (
        await Promise.all(slugs.map((s) => store.getCompanyBySlug(s.trim())))
      )
        .map((c) => c?.id)
        .filter(Boolean) as string[]
      reviews = reviews.filter((r) => companyIds.includes(r.company_id))
    }
    if (params.platform) {
      const platforms = params.platform.split(',').map((p) => p.trim())
      reviews = reviews.filter((r) => platforms.includes(r.platform))
    }
    if (params.rating_min !== undefined)
      reviews = reviews.filter((r) => (r.rating ?? 0) >= params.rating_min!)
    if (params.rating_max !== undefined)
      reviews = reviews.filter((r) => (r.rating ?? 0) <= params.rating_max!)
    if (params.date_from)
      reviews = reviews.filter(
        (r) => (r.review_date ?? '') >= params.date_from!,
      )
    if (params.date_to)
      reviews = reviews.filter((r) => (r.review_date ?? '') <= params.date_to!)
    if (params.has_pros === 'true')
      reviews = reviews.filter((r) => Boolean(r.pros_text))
    if (params.has_cons === 'true')
      reviews = reviews.filter((r) => Boolean(r.cons_text))
    if (params.switched_from) {
      const term = params.switched_from.toLowerCase()
      reviews = reviews.filter((r) =>
        (r.switched_from ?? '').toLowerCase().includes(term),
      )
    }
    if (params.search) {
      const term = params.search.toLowerCase()
      reviews = reviews.filter((r) =>
        [r.title, r.pros_text, r.cons_text, r.full_text]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term)),
      )
    }

    const sorted = applySort(reviews, params.sort)
    const total = sorted.length
    const start = (params.page - 1) * params.per_page
    const end = start + params.per_page
    const items = await Promise.all(
      sorted.slice(start, end).map(async (r) => ({
        ...r,
        company: (await store.getCompanyById(r.company_id)) ?? null,
      })),
    )
    const ratings = sorted.map((r) => r.rating ?? 0).filter((n) => n > 0)
    const avg =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
          10
        : null
    const platformCounts = sorted.reduce<Record<string, number>>((acc, r) => {
      acc[r.platform] = (acc[r.platform] ?? 0) + 1
      return acc
    }, {})

    res.json({
      reviews: items,
      total,
      page: params.page,
      per_page: params.per_page,
      stats: { average_rating: avg, platform_counts: platformCounts },
    })
  }),
)

reviewsRouter.get(
  '/companies/:slug',
  asyncHandler(async (req, res) => {
    const company = await store.getCompanyBySlug(req.params.slug as string)
    if (!company) throw new AppError('Company not found', 404, 'NOT_FOUND')
    const params = querySchema.parse(req.query)
    let reviews = await store.getReviewsByCompanyId(company.id)
    if (params.platform) {
      const platforms = params.platform.split(',')
      reviews = reviews.filter((r) => platforms.includes(r.platform))
    }
    if (params.rating_min !== undefined)
      reviews = reviews.filter((r) => (r.rating ?? 0) >= params.rating_min!)
    if (params.rating_max !== undefined)
      reviews = reviews.filter((r) => (r.rating ?? 0) <= params.rating_max!)
    const sorted = applySort(reviews, params.sort)
    const total = sorted.length
    const start = (params.page - 1) * params.per_page
    const end = start + params.per_page
    res.json({
      reviews: sorted.slice(start, end),
      total,
      page: params.page,
      per_page: params.per_page,
    })
  }),
)
