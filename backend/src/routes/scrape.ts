import { Router } from 'express'
import { z } from 'zod'
import { store } from '../db/store.js'
import { AppError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { startScrapeForCompany } from '../services/jobs.js'

export const scrapeRouter = Router()

const triggerSchema = z.object({
  company_slug: z.string(),
  platform: z.enum(['capterra', 'g2', 'all']).default('all'),
})

scrapeRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = triggerSchema.parse(req.body)
    if (body.company_slug === 'all') {
      const jobs = []
      for (const c of await store.listCompanies()) {
        jobs.push(await startScrapeForCompany(c.id, body.platform))
      }
      res.json({ jobs })
      return
    }
    const company = await store.getCompanyBySlug(body.company_slug)
    if (!company) throw new AppError('Company not found', 404, 'NOT_FOUND')
    const job = await startScrapeForCompany(company.id, body.platform)
    res.json({ job })
  }),
)

scrapeRouter.get(
  '/jobs',
  asyncHandler(async (_req, res) => {
    const jobs = await Promise.all(
      (await store.listScrapeJobs()).map(async (j) => ({
        ...j,
        company: (await store.getCompanyById(j.company_id)) ?? null,
      })),
    )
    res.json({ jobs })
  }),
)

scrapeRouter.get(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    const job = await store.getScrapeJob(req.params.id as string)
    if (!job) throw new AppError('Job not found', 404, 'NOT_FOUND')
    res.json({
      job: {
        ...job,
        company: (await store.getCompanyById(job.company_id)) ?? null,
      },
    })
  }),
)
