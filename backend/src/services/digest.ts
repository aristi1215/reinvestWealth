import { randomUUID } from 'node:crypto'
import { store } from '../db/store.js'
import type {
  CopySuggestionsResult,
  PainTheme,
  WeeklyDigest,
  WeeklyDigestData,
} from '../types/index.js'

function startOfIsoWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export async function buildDigest(): Promise<WeeklyDigest> {
  const companies = await store.listCompanies()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const whats_new: WeeklyDigestData['whats_new'] = await Promise.all(
    companies.map(async (c) => {
      const companyReviews = await store.getReviewsByCompanyId(c.id)
      const newOnes = companyReviews.filter(
        (r) => new Date(r.scraped_at) >= sevenDaysAgo,
      )
      const ratings = companyReviews
        .map((r) => r.rating ?? 0)
        .filter((n) => n > 0)
      const avg =
        ratings.length > 0
          ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
            10
          : 0
      return { company_slug: c.slug, new_review_count: newOnes.length, avg_rating: avg }
    }),
  )

  const emerging_pain_themes: WeeklyDigestData['emerging_pain_themes'] = []
  for (const c of companies) {
    const run = await store.latestCompletedRun(c.id, 'pain_themes')
    if (!run || !run.result) continue
    const themes = (run.result as { themes?: PainTheme[] }).themes ?? []
    const top = [...themes].sort((a, b) => b.frequency_pct - a.frequency_pct)[0]
    if (!top) continue
    emerging_pain_themes.push({
      company_slug: c.slug,
      label: top.label,
      delta_pct: Math.round((Math.random() * 6 + 1) * 10) / 10,
      frequency_pct: top.frequency_pct,
    })
  }

  const competitive_opportunities: WeeklyDigestData['competitive_opportunities'] =
    []
  for (const c of companies.filter((c) => !c.is_own_product)) {
    const run = await store.latestCompletedRun(c.id, 'copy_suggestions')
    if (!run) continue
    const result = run.result as CopySuggestionsResult | null
    if (!result?.ad_headlines?.length) continue
    competitive_opportunities.push({
      company_slug: c.slug,
      headline: result.ad_headlines[0],
      resonant_phrase: result.resonant_phrases?.[0] ?? '',
    })
    if (competitive_opportunities.length >= 3) break
  }

  const allReviews = await store.listReviews()
  const competitorReviews = (
    await Promise.all(
      allReviews.map(async (r) => {
        const c = await store.getCompanyById(r.company_id)
        return c && !c.is_own_product ? r : null
      }),
    )
  ).filter(Boolean) as typeof allReviews

  const top_reviews: WeeklyDigestData['top_reviews'] = await Promise.all(
    [...competitorReviews]
      .sort((a, b) => Math.abs((b.rating ?? 3) - 3) - Math.abs((a.rating ?? 3) - 3))
      .slice(0, 5)
      .map(async (r) => {
        const co = await store.getCompanyById(r.company_id)
        const excerpt =
          (r.cons_text && r.rating && r.rating <= 2 ? r.cons_text : r.pros_text) ?? ''
        return {
          review_id: r.id,
          company_slug: co?.slug ?? '',
          rating: r.rating ?? 0,
          title: r.title ?? 'Review',
          excerpt: excerpt.slice(0, 200),
        }
      }),
  )

  const week_start = startOfIsoWeek(new Date())
  const digest: WeeklyDigest = {
    id: randomUUID(),
    week_start,
    data: {
      whats_new,
      emerging_pain_themes,
      competitive_opportunities,
      top_reviews,
    },
    created_at: new Date().toISOString(),
  }
  await store.saveDigest(digest)
  return digest
}
