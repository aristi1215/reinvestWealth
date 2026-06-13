import { Router } from 'express'
import { store } from '../db/store.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { buildDigest } from '../services/digest.js'

export const digestRouter = Router()

digestRouter.get(
  '/latest',
  asyncHandler(async (_req, res) => {
    let digest = await store.latestDigest()
    if (!digest) digest = await buildDigest()
    res.json({ digest })
  }),
)

digestRouter.get(
  '/history',
  asyncHandler(async (_req, res) => {
    res.json({ digests: await store.listDigests() })
  }),
)

digestRouter.post(
  '/generate',
  asyncHandler(async (_req, res) => {
    const digest = await buildDigest()
    res.json({ digest })
  }),
)
