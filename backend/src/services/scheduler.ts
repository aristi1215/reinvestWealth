import cron from 'node-cron'
import { env } from '../config/env.js'
import { store } from '../db/store.js'
import { buildDigest } from './digest.js'
import { startAnalysisRun, startScrapeForCompany } from './jobs.js'

export function startScheduler() {
  if (!env.ENABLE_SCHEDULER) return

  cron.schedule('0 2 * * 0', async () => {
    console.log('[scheduler] weekly scrape running')
    for (const company of store.listCompanies()) {
      await startScrapeForCompany(company.id, 'all')
    }
  })

  cron.schedule('0 4 * * 0', async () => {
    console.log('[scheduler] weekly analysis running')
    for (const company of store.listCompanies()) {
      await startAnalysisRun(company.id, 'full')
    }
  })

  cron.schedule('0 6 * * 1', () => {
    console.log('[scheduler] weekly digest generating')
    buildDigest()
  })

  console.log('[scheduler] cron jobs registered')
}
