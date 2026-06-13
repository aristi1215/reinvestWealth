import { store } from '../db/store.js'
import { runAnalysis } from './gemini.js'
import { runScrape } from './scraper.js'
import type {
  AnalysisRun,
  FullAnalysisResult,
  Platform,
  RunType,
  ScrapeJob,
} from '../types/index.js'

const PLATFORMS: Platform[] = ['capterra', 'g2']

export async function processScrapeJob(jobId: string): Promise<void> {
  const job = await store.getScrapeJob(jobId)
  if (!job) return
  await store.updateScrapeJob(jobId, {
    status: 'running',
    started_at: new Date().toISOString(),
  })

  try {
    const company = await store.getCompanyById(job.company_id)
    if (!company) throw new Error('Company not found')

    const platforms: Platform[] = job.platform === 'all' ? PLATFORMS : [job.platform]
    let totalScraped = 0
    for (const platform of platforms) {
      const { count } = await runScrape(company, platform)
      totalScraped += count
    }

    await store.updateScrapeJob(jobId, {
      status: 'completed',
      reviews_scraped: totalScraped,
      completed_at: new Date().toISOString(),
    })
  } catch (err) {
    await store.updateScrapeJob(jobId, {
      status: 'failed',
      error_message: err instanceof Error ? err.message : String(err),
      completed_at: new Date().toISOString(),
    })
  }
}

export async function startScrapeForCompany(
  companyId: string,
  platform: Platform | 'all',
): Promise<ScrapeJob> {
  const job = await store.createScrapeJob({ company_id: companyId, platform })
  void processScrapeJob(job.id)
  return job
}

const SUBTYPES: Exclude<RunType, 'full'>[] = [
  'pain_themes',
  'feature_gaps',
  'sentiment',
  'copy_suggestions',
]

export async function processAnalysisRun(runId: string): Promise<void> {
  const run = await store.getAnalysisRun(runId)
  if (!run) return

  await store.updateAnalysisRun(runId, {
    status: 'running',
    started_at: new Date().toISOString(),
  })

  try {
    const company = await store.getCompanyById(run.company_id)
    if (!company) throw new Error('Company not found')

    const reviews = await store.getReviewsByCompanyId(company.id)

    if (run.run_type === 'full') {
      const aggregate: FullAnalysisResult = {
        pain_themes: { themes: [] },
        feature_gaps: { gaps: [] },
        sentiment: {
          overall_sentiment: 'mixed',
          nps_estimate: 0,
          positive_aspects: [],
          negative_aspects: [],
          emotional_keywords: [],
        },
        copy_suggestions: null,
      }
      let analyzedCount = 0
      for (const subtype of SUBTYPES) {
        if (subtype === 'copy_suggestions' && company.is_own_product) continue
        const sub = await runAnalysis(subtype, company.display_name, company.slug, reviews)
        analyzedCount = sub.reviewsAnalyzed
        if (subtype === 'pain_themes')
          aggregate.pain_themes = sub.result as FullAnalysisResult['pain_themes']
        else if (subtype === 'feature_gaps')
          aggregate.feature_gaps = sub.result as FullAnalysisResult['feature_gaps']
        else if (subtype === 'sentiment')
          aggregate.sentiment = sub.result as FullAnalysisResult['sentiment']
        else if (subtype === 'copy_suggestions')
          aggregate.copy_suggestions = sub.result as FullAnalysisResult['copy_suggestions']

        await store.createAnalysisRun({
          company_id: company.id,
          run_type: subtype,
          status: 'completed',
          model_used: run.model_used,
          reviews_analyzed: sub.reviewsAnalyzed,
          result: sub.result,
          error_message: null,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
      }
      await store.updateAnalysisRun(runId, {
        status: 'completed',
        reviews_analyzed: analyzedCount,
        result: aggregate,
        completed_at: new Date().toISOString(),
      })
      return
    }

    if (run.run_type === 'copy_suggestions' && company.is_own_product) {
      throw new Error('Copy suggestions are only generated for competitors')
    }

    const sub = await runAnalysis(
      run.run_type,
      company.display_name,
      company.slug,
      reviews,
    )

    await store.updateAnalysisRun(runId, {
      status: 'completed',
      reviews_analyzed: sub.reviewsAnalyzed,
      result: sub.result,
      completed_at: new Date().toISOString(),
    })
  } catch (err) {
    await store.updateAnalysisRun(runId, {
      status: 'failed',
      error_message: err instanceof Error ? err.message : String(err),
      completed_at: new Date().toISOString(),
    })
  }
}

export async function startAnalysisRun(
  companyId: string,
  runType: RunType,
): Promise<AnalysisRun> {
  const run = await store.createAnalysisRun({
    company_id: companyId,
    run_type: runType,
    status: 'pending',
    model_used: 'gemini-2.0-flash',
    reviews_analyzed: null,
    result: null,
    error_message: null,
    started_at: null,
    completed_at: null,
  })
  void processAnalysisRun(run.id)
  return run
}
