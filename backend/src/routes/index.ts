import { Router } from 'express'
import { analysisRouter } from './analysis.js'
import { companiesRouter } from './companies.js'
import { dashboardRouter } from './dashboard.js'
import { digestRouter } from './digest.js'
import { reviewsRouter } from './reviews.js'
import { scrapeRouter } from './scrape.js'

export const apiRouter = Router()

const v1 = Router()
v1.use('/companies', companiesRouter)
v1.use('/reviews', reviewsRouter)
v1.use('/scrape', scrapeRouter)
v1.use('/analysis', analysisRouter)
v1.use('/digest', digestRouter)
v1.use('/dashboard', dashboardRouter)

apiRouter.use('/v1', v1)
