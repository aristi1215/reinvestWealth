import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../config/env.js'
import { SEED_ANALYSES } from '../data/seedAnalyses.js'
import type {
  AnalysisResult,
  CopySuggestionsResult,
  FeatureGap,
  PainTheme,
  RunType,
  Review,
  SentimentResult,
} from '../types/index.js'

const MIN_GEMINI_INTERVAL_MS = 5_000
let lastGeminiCall = 0

async function rateLimit() {
  const now = Date.now()
  const wait = lastGeminiCall + MIN_GEMINI_INTERVAL_MS - now
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait))
  }
  lastGeminiCall = Date.now()
}

let geminiClient: GoogleGenerativeAI | null = null
function getGemini() {
  if (!env.ENABLE_GEMINI) return null
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  }
  return geminiClient
}

function selectReviewSample(reviews: Review[], max = 80): Review[] {
  if (reviews.length <= max) return reviews
  const sorted = [...reviews].sort((a, b) =>
    (b.review_date ?? '').localeCompare(a.review_date ?? ''),
  )
  const recent = sorted.slice(0, max / 2)
  const extremes = [...reviews]
    .filter((r) => r.rating !== null)
    .sort((a, b) => Math.abs((b.rating ?? 3) - 3) - Math.abs((a.rating ?? 3) - 3))
    .slice(0, max / 2)
  const seen = new Set<string>()
  const result: Review[] = []
  for (const r of [...recent, ...extremes]) {
    if (!seen.has(r.id)) {
      seen.add(r.id)
      result.push(r)
      if (result.length >= max) break
    }
  }
  return result
}

function reviewsToText(reviews: Review[]): string {
  return reviews
    .map((r, i) => {
      const pros = r.pros_text?.trim() ?? ''
      const cons = r.cons_text?.trim() ?? ''
      const rating = r.rating ?? '?'
      return `Review ${i + 1} (rating ${rating}/5):\nPros: ${pros}\nCons: ${cons}`
    })
    .join('\n\n')
}

function buildPainPrompt(name: string, count: number, reviewsText: string) {
  return `You are a product analyst. Below are ${count} user reviews for ${name} accounting software.

Identify the top 8 most frequently mentioned pain points, complaints, or frustrations.
For each pain theme:
- Give it a short label (max 5 words)
- Write a 1-2 sentence description of what users are actually experiencing
- Estimate the percentage of reviews that mention this theme
- List 2-3 exact short phrases users actually used (verbatim, under 10 words each)
- Assign a severity score from 1-10 (10 = major churn risk)

Return ONLY valid JSON with this exact structure:
{
  "themes": [
    { "label": "string", "description": "string", "frequency_pct": number, "verbatim_phrases": ["string"], "severity": number }
  ]
}

Reviews:
${reviewsText}`
}

function buildGapsPrompt(name: string, count: number, reviewsText: string) {
  return `You are a product manager. Below are ${count} user reviews for ${name} accounting software.

Identify features, integrations, or capabilities that users explicitly request or complain are missing.
For each gap:
- Name the missing feature
- Describe what users want it to do
- Estimate demand (how many reviews mention it)
- Rate the business opportunity from 1-10 (10 = high-impact, clearly requested)
- Indicate if this is likely a quick win or complex build

Return ONLY valid JSON:
{
  "gaps": [
    { "feature_name": "string", "description": "string", "demand_count": number, "opportunity_score": number, "complexity": "quick_win" | "medium" | "complex" }
  ]
}

Reviews:
${reviewsText}`
}

function buildSentimentPrompt(name: string, count: number, reviewsText: string) {
  return `Analyze the following ${count} reviews for ${name} and return sentiment data.

Classify the reviews' overall sentiment. Then identify:
- Top 5 most praised aspects (with frequency)
- Top 5 most criticized aspects (with frequency)
- NPS estimate (0-100)
- Key emotional words users associate with this product

Return ONLY valid JSON:
{
  "overall_sentiment": "positive" | "mixed" | "negative",
  "nps_estimate": number,
  "positive_aspects": [{"aspect": "string", "frequency_pct": number}],
  "negative_aspects": [{"aspect": "string", "frequency_pct": number}],
  "emotional_keywords": ["string"]
}

Reviews:
${reviewsText}`
}

function buildCopyPrompt(name: string, reviewsText: string) {
  return `You are a growth marketer. Below are reviews from users of ${name}, a competitor to ReInvestWealth AI accounting software.

ReInvestWealth's key strengths: AI bookkeeping, Canadian-built, affordable ($39 CAD/mo), easy setup, GST/HST e-filing, Plaid bank connections.

Based on what ${name} users complain about, suggest:
1. Five ad headline variations ReInvestWealth could use targeting these frustrated users
2. Three landing page value propositions
3. Exact words and phrases from reviews that resonate and could be used in copy (verbatim)
4. The top 3 search intent keywords these frustrated users would Google

Return ONLY valid JSON:
{
  "ad_headlines": ["string"],
  "value_propositions": ["string"],
  "resonant_phrases": ["string"],
  "search_keywords": ["string"]
}

Reviews:
${reviewsText}`
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenced) {
      try {
        return JSON.parse(fenced[1]) as T
      } catch {
        return null
      }
    }
    const firstBrace = raw.indexOf('{')
    const lastBrace = raw.lastIndexOf('}')
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as T
      } catch {
        return null
      }
    }
    return null
  }
}

async function callGemini<T>(prompt: string): Promise<T | null> {
  const client = getGemini()
  if (!client) return null
  await rateLimit()
  const model = client.getGenerativeModel({ model: env.GEMINI_MODEL })

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const fullPrompt =
        attempt === 0
          ? prompt
          : `${prompt}\n\nYou MUST return only raw JSON with no markdown, no backticks, no explanation.`
      const result = await model.generateContent(fullPrompt)
      const text = result.response.text()
      const parsed = safeJsonParse<T>(text)
      if (parsed) return parsed
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (/429|quota|rate/i.test(message)) {
        await new Promise((r) => setTimeout(r, 10_000 * (attempt + 1)))
        continue
      }
      console.error('[gemini] error', message)
      if (attempt === 2) throw err
    }
  }
  return null
}

export async function runAnalysis(
  runType: Exclude<RunType, 'full'>,
  companyName: string,
  companySlug: string,
  reviews: Review[],
): Promise<{ result: AnalysisResult; reviewsAnalyzed: number; mocked: boolean }> {
  const sample = selectReviewSample(reviews)
  const reviewsText = reviewsToText(sample)
  const useMock = !env.ENABLE_GEMINI || sample.length === 0
  const seed = SEED_ANALYSES[companySlug]

  if (useMock) {
    if (!seed) {
      const empty: AnalysisResult =
        runType === 'pain_themes'
          ? { themes: [] as PainTheme[] }
          : runType === 'feature_gaps'
            ? { gaps: [] as FeatureGap[] }
            : runType === 'sentiment'
              ? ({
                  overall_sentiment: 'mixed',
                  nps_estimate: 0,
                  positive_aspects: [],
                  negative_aspects: [],
                  emotional_keywords: [],
                } satisfies SentimentResult)
              : ({
                  ad_headlines: [],
                  value_propositions: [],
                  resonant_phrases: [],
                  search_keywords: [],
                } satisfies CopySuggestionsResult)
      return { result: empty, reviewsAnalyzed: sample.length, mocked: true }
    }
    let result: AnalysisResult
    if (runType === 'pain_themes') result = { themes: seed.pain_themes }
    else if (runType === 'feature_gaps') result = { gaps: seed.feature_gaps }
    else if (runType === 'sentiment') result = seed.sentiment
    else
      result =
        seed.copy_suggestions ?? {
          ad_headlines: [],
          value_propositions: [],
          resonant_phrases: [],
          search_keywords: [],
        }
    return { result, reviewsAnalyzed: sample.length, mocked: true }
  }

  let parsed: AnalysisResult | null = null
  if (runType === 'pain_themes') {
    parsed = await callGemini<{ themes: PainTheme[] }>(
      buildPainPrompt(companyName, sample.length, reviewsText),
    )
  } else if (runType === 'feature_gaps') {
    parsed = await callGemini<{ gaps: FeatureGap[] }>(
      buildGapsPrompt(companyName, sample.length, reviewsText),
    )
  } else if (runType === 'sentiment') {
    parsed = await callGemini<SentimentResult>(
      buildSentimentPrompt(companyName, sample.length, reviewsText),
    )
  } else {
    parsed = await callGemini<CopySuggestionsResult>(
      buildCopyPrompt(companyName, reviewsText),
    )
  }

  if (!parsed) {
    throw new Error(`Gemini returned no parseable JSON for ${runType}`)
  }
  return { result: parsed, reviewsAnalyzed: sample.length, mocked: false }
}
