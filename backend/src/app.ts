import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 240,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
  app.use('/api', limiter)

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      mocks: {
        supabase: !env.ENABLE_SUPABASE,
        gemini: !env.ENABLE_GEMINI,
        playwright: !env.ENABLE_PLAYWRIGHT,
      },
    })
  })

  app.use('/api', apiRouter)

  app.use(errorHandler)

  return app
}
