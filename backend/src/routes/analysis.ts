import { Router } from 'express'
import { z } from 'zod'
import { store } from '../db/store.js'
import { AppError } from '../middleware/errorHandler.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { startAnalysisRun } from '../services/jobs.js'

export const analysisRouter = Router()

const triggerSchema = z.object({
  company_slug: z.string(),
  run_type: z.enum([
    'pain_themes',
    'feature_gaps',
    'sentiment',
    'copy_suggestions',
    'full',
  ]),
})

analysisRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = triggerSchema.parse(req.body)
    if (body.company_slug === 'all') {
      const runs = []
      for (const c of await store.listCompanies()) {
        if (body.run_type === 'copy_suggestions' && c.is_own_product) continue
        runs.push(await startAnalysisRun(c.id, body.run_type))
      }
      res.json({ runs })
      return
    }
    const company = await store.getCompanyBySlug(body.company_slug)
    if (!company) throw new AppError('Company not found', 404, 'NOT_FOUND')
    if (body.run_type === 'copy_suggestions' && company.is_own_product) {
      throw new AppError(
        'Copy suggestions are only available for competitors',
        400,
        'INVALID',
      )
    }
    const run = await startAnalysisRun(company.id, body.run_type)
    res.json({ run })
  }),
)

const listQuery = z.object({
  company_slug: z.string().optional(),
  run_type: z.string().optional(),
  status: z.string().optional(),
})

analysisRouter.get(
  '/runs',
  asyncHandler(async (req, res) => {
    const params = listQuery.parse(req.query)
    let runs = await store.listAnalysisRuns()
    if (params.company_slug) {
      const c = await store.getCompanyBySlug(params.company_slug)
      if (c) runs = runs.filter((r) => r.company_id === c.id)
      else runs = []
    }
    if (params.run_type) runs = runs.filter((r) => r.run_type === params.run_type)
    if (params.status) runs = runs.filter((r) => r.status === params.status)
    const enriched = await Promise.all(
      runs
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(async (r) => ({
          ...r,
          company: (await store.getCompanyById(r.company_id)) ?? null,
        })),
    )
    res.json({ runs: enriched })
  }),
)

analysisRouter.get(
  '/runs/:id',
  asyncHandler(async (req, res) => {
    const run = await store.getAnalysisRun(req.params.id as string)
    if (!run) throw new AppError('Run not found', 404, 'NOT_FOUND')
    res.json({
      run: {
        ...run,
        company: (await store.getCompanyById(run.company_id)) ?? null,
      },
    })
  }),
)

analysisRouter.delete(
  '/runs/:id',
  asyncHandler(async (req, res) => {
    const ok = await store.deleteAnalysisRun(req.params.id as string)
    if (!ok) throw new AppError('Run not found', 404, 'NOT_FOUND')
    res.json({ success: true })
  }),
)
