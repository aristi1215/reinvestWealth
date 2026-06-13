import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { store } from '../db/store.js'
import type { Company, Platform, Review } from '../types/index.js'

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
]

function pickUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function scrapeWithPlaywright(
  company: Company,
  platform: Platform,
): Promise<Review[]> {
  // Lazy import — only load Playwright if explicitly enabled, since it requires
  // a separately installed browser binary that may not be available.
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const collected: Review[] = []
  try {
    const context = await browser.newContext({ userAgent: pickUA() })
    const page = await context.newPage()
    const url =
      platform === 'capterra'
        ? company.capterra_url
        : platform === 'g2' && company.g2_slug
          ? `https://www.g2.com/products/${company.g2_slug}/reviews`
          : null
    if (!url) return []

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await delay(2000 + Math.random() * 3000)

    const cards = await page
      .locator('[data-testid="review-card"], article, .review-card')
      .all()
      .catch(() => [])

    for (const card of cards.slice(0, 100)) {
      const html = await card.innerHTML().catch(() => '')
      const text = await card.innerText().catch(() => '')
      const ratingMatch = text.match(/([0-5](?:\.\d)?)\s*(?:\/\s*5|stars?)/i)
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null
      const titleMatch = text.split('\n').find((l) => l.length > 5 && l.length < 120)
      const review: Review = {
        id: randomUUID(),
        company_id: company.id,
        platform,
        external_id: null,
        reviewer_name: null,
        reviewer_role: null,
        reviewer_company_size: null,
        rating,
        review_date: new Date().toISOString().slice(0, 10),
        title: titleMatch ?? null,
        pros_text: text.match(/Pros[\s\S]{0,500}/)?.[0] ?? null,
        cons_text: text.match(/Cons[\s\S]{0,500}/)?.[0] ?? null,
        full_text: text,
        switched_from: null,
        raw_html: html,
        scraped_at: new Date().toISOString(),
      }
      collected.push(review)
    }
  } finally {
    await browser.close().catch(() => {})
  }
  return collected
}

function buildMockNewReviews(
  company: Company,
  platform: Platform,
  count: number,
): Review[] {
  const now = Date.now()
  const out: Review[] = []
  for (let i = 0; i < count; i++) {
    const dayMs = 24 * 60 * 60 * 1000
    const reviewDate = new Date(now - Math.random() * 7 * dayMs)
    const rating = Math.round((2 + Math.random() * 3) * 2) / 2
    out.push({
      id: randomUUID(),
      company_id: company.id,
      platform,
      external_id: `mock-${platform}-${now}-${i}`,
      reviewer_name: `New Reviewer ${i + 1}`,
      reviewer_role: 'Founder',
      reviewer_company_size: '1-10 employees',
      rating,
      review_date: reviewDate.toISOString().slice(0, 10),
      title: `Fresh take on ${company.display_name}`,
      pros_text:
        rating >= 4
          ? 'Setup was painless and the AI categorization is sharp.'
          : 'It does what it says.',
      cons_text:
        rating <= 3
          ? 'Pricing is creeping up and bank feeds occasionally drop.'
          : 'Reporting depth could improve.',
      full_text: 'Synthetic refresh review generated for demo purposes.',
      switched_from: null,
      raw_html: null,
      scraped_at: new Date().toISOString(),
    })
  }
  return out
}

export async function runScrape(
  company: Company,
  platform: Platform,
): Promise<{ count: number; mocked: boolean }> {
  if (env.ENABLE_PLAYWRIGHT) {
    try {
      const reviews = await scrapeWithPlaywright(company, platform)
      reviews.forEach((r) => store.upsertReview(r))
      return { count: reviews.length, mocked: false }
    } catch (err) {
      console.warn(
        '[scraper] Playwright run failed, falling back to mock data:',
        err instanceof Error ? err.message : String(err),
      )
    }
  }
  // Mock path: simulate finding a small batch of new reviews.
  const count = 3 + Math.floor(Math.random() * 6)
  const reviews = buildMockNewReviews(company, platform, count)
  for (const r of reviews) await store.upsertReview(r)
  await delay(800 + Math.random() * 1200)
  return { count, mocked: true }
}
