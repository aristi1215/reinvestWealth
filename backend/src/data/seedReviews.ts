import type { Platform, Review } from '../types/index.js'

interface ReviewSeed {
  reviewer_name: string
  reviewer_role: string
  reviewer_company_size: string
  rating: number
  title: string
  pros_text: string
  cons_text: string
  switched_from?: string
  daysAgo: number
  platform?: Platform
}

const REINVESTWEALTH_REVIEWS: ReviewSeed[] = [
  {
    reviewer_name: 'Marie L.',
    reviewer_role: 'Founder',
    reviewer_company_size: '1-10 employees',
    rating: 5,
    title: 'Finally an accounting tool that just works for Canadian SMBs',
    pros_text:
      'The AI categorization is a game changer. I just connect my RBC account and it figures out 90% of transactions. GST/HST e-filing in two clicks. Setup took me 12 minutes.',
    cons_text:
      'Reporting could be more flexible. Would love a deeper P&L by project view.',
    switched_from: 'QuickBooks Online',
    daysAgo: 3,
  },
  {
    reviewer_name: 'David S.',
    reviewer_role: 'Solo Consultant',
    reviewer_company_size: 'Self-employed',
    rating: 5,
    title: 'Cheaper, simpler, and Canadian',
    pros_text:
      'At $39 CAD/mo it is a steal vs QuickBooks. The Plaid bank connections are solid and the support team responds in hours.',
    cons_text:
      'Mobile app is basic. Would like better receipt scanning on iOS.',
    switched_from: 'FreshBooks',
    daysAgo: 9,
  },
  {
    reviewer_name: 'Priya K.',
    reviewer_role: 'Bookkeeper',
    reviewer_company_size: '11-50 employees',
    rating: 4,
    title: 'Great for small Canadian clients',
    pros_text:
      'I onboarded 6 of my smaller clients in a week. The AI suggestions for vendor categorization are accurate. Multi-client view is helpful.',
    cons_text:
      'Limited integrations vs Xero. No native Shopify connector yet which is a blocker for some retail clients.',
    daysAgo: 15,
  },
  {
    reviewer_name: 'Alex M.',
    reviewer_role: 'Owner',
    reviewer_company_size: '1-10 employees',
    rating: 4,
    title: 'Onboarding is fast, learning curve low',
    pros_text:
      'Coming from QuickBooks the difference in setup time is night and day. GST filing alone saves me 2 hours a quarter.',
    cons_text:
      'Some advanced features I had in QBO are missing. Class tracking is the biggest gap.',
    switched_from: 'QuickBooks Online',
    daysAgo: 22,
  },
  {
    reviewer_name: 'Sophie B.',
    reviewer_role: 'CFO',
    reviewer_company_size: '11-50 employees',
    rating: 5,
    title: 'Bookkeeping on autopilot',
    pros_text:
      'The AI matching engine is honestly the most underrated feature. It learned my chart of accounts in a week and now reconciliation is a 10-minute weekly task.',
    cons_text:
      'I wish there was a deeper budgeting module. Currently exporting to Sheets for forecasts.',
    daysAgo: 28,
  },
  {
    reviewer_name: 'Tomás R.',
    reviewer_role: 'Agency Owner',
    reviewer_company_size: '1-10 employees',
    rating: 4,
    title: 'Clean UI, fast support',
    pros_text:
      'Interface is clean and uncluttered. Customer service is real humans who respond quickly. Pricing is honest.',
    cons_text:
      'Project tagging would be huge. Right now I cannot easily see profit per client.',
    daysAgo: 34,
  },
  {
    reviewer_name: 'Karen W.',
    reviewer_role: 'Founder',
    reviewer_company_size: '1-10 employees',
    rating: 5,
    title: 'Saved my Saturday',
    pros_text:
      'I used to spend Saturdays catching up on bookkeeping. Now the AI does the categorization in the background and I just review on Sunday morning.',
    cons_text: 'Would love a mobile widget showing weekly cash position.',
    daysAgo: 41,
  },
]

const QUICKBOOKS_REVIEWS: ReviewSeed[] = [
  {
    reviewer_name: 'James P.',
    reviewer_role: 'Small Business Owner',
    reviewer_company_size: '1-10 employees',
    rating: 2,
    title: 'Powerful but bloated and expensive',
    pros_text: 'Robust feature set, lots of integrations, every accountant knows it.',
    cons_text:
      'Could not justify paying $75/month for features I do not use. The interface is overwhelming and onboarding is confusing and there is no guidance. Customer support is offshore and reads from scripts.',
    daysAgo: 4,
  },
  {
    reviewer_name: 'Lily A.',
    reviewer_role: 'Bookkeeper',
    reviewer_company_size: '51-200 employees',
    rating: 3,
    title: 'Industry standard, but ageing',
    pros_text: 'Standard tool that every CPA accepts. Bank feeds are reliable when they work.',
    cons_text:
      'Bank feeds break constantly and force me to re-authenticate. Pricing keeps going up every year. The AI suggestions are wrong half the time.',
    daysAgo: 6,
  },
  {
    reviewer_name: 'Greg M.',
    reviewer_role: 'Solo Consultant',
    reviewer_company_size: 'Self-employed',
    rating: 1,
    title: 'Migrating away',
    pros_text: 'It does technically work.',
    cons_text:
      'Took me 3 days to figure out how to set up GST. Couldn\'t connect my RBC account on first try. Mobile app crashes on iOS 17. Support told me to clear my cache for 4 emails in a row.',
    daysAgo: 11,
  },
  {
    reviewer_name: 'Hannah K.',
    reviewer_role: 'Operations Lead',
    reviewer_company_size: '51-200 employees',
    rating: 2,
    title: 'Overpriced for what you get',
    pros_text: 'Multi-currency works. Reporting is decent.',
    cons_text:
      'Pricing is brutal for Canadian SMBs. Every quarter Intuit adds another paid add-on. Payroll is basically a separate product. CRA-related features feel bolted on.',
    daysAgo: 14,
  },
  {
    reviewer_name: 'Carlos D.',
    reviewer_role: 'CFO',
    reviewer_company_size: '11-50 employees',
    rating: 4,
    title: 'Mature and reliable, if pricey',
    pros_text: 'Mature and reliable. Reports work for our auditor.',
    cons_text: 'Onboarding new staff onto QBO is painful. UI looks like 2014.',
    daysAgo: 19,
  },
  {
    reviewer_name: 'Ella V.',
    reviewer_role: 'Accountant',
    reviewer_company_size: '1-10 employees',
    rating: 2,
    title: 'Constant upsell pressure',
    pros_text: 'Comprehensive once configured.',
    cons_text:
      'Nickel-and-dimes on every feature. Cannot upload receipts in bulk without paying more. Customer support is offshore and unhelpful.',
    daysAgo: 25,
  },
  {
    reviewer_name: 'Marcus J.',
    reviewer_role: 'Founder',
    reviewer_company_size: '1-10 employees',
    rating: 3,
    title: 'Works but feels heavy',
    pros_text: 'Lots of accountants accept it.',
    cons_text:
      'The mobile app crashes on iOS regularly. Bank reconciliation takes hours. AI categorization is wrong half the time.',
    daysAgo: 31,
  },
  {
    reviewer_name: 'Beatriz N.',
    reviewer_role: 'Owner',
    reviewer_company_size: '1-10 employees',
    rating: 1,
    title: 'Switching to anything else',
    pros_text: 'Brand recognition.',
    cons_text:
      'The price hike this year was the last straw. Onboarding is confusing and there is no guidance. They keep removing features from the lower tier.',
    daysAgo: 38,
  },
]

const FRESHBOOKS_REVIEWS: ReviewSeed[] = [
  {
    reviewer_name: 'Ravi S.',
    reviewer_role: 'Freelance Designer',
    reviewer_company_size: 'Self-employed',
    rating: 4,
    title: 'Great invoicing, weak accounting',
    pros_text: 'Best-in-class invoicing UX. Time tracking and proposals are clean. Clients pay faster.',
    cons_text:
      'Limited reporting. No real general ledger. Cannot file GST/HST natively in Canada.',
    daysAgo: 2,
  },
  {
    reviewer_name: 'Nora F.',
    reviewer_role: 'Agency Owner',
    reviewer_company_size: '1-10 employees',
    rating: 3,
    title: 'Pricing per client gets expensive fast',
    pros_text: 'UI is friendly. Mobile app actually works.',
    cons_text:
      'Pricing per billable client is brutal once you cross 50. Bank reconciliation is buggy. Outgrew it within a year.',
    daysAgo: 7,
  },
  {
    reviewer_name: 'Trevor B.',
    reviewer_role: 'Consultant',
    reviewer_company_size: '1-10 employees',
    rating: 2,
    title: 'Outgrew it quickly',
    pros_text: 'Invoicing was easy.',
    cons_text:
      'Reporting is shallow. Cannot track project profitability properly. Migrated to QuickBooks for the depth.',
    daysAgo: 12,
  },
  {
    reviewer_name: 'Anika P.',
    reviewer_role: 'Solo Consultant',
    reviewer_company_size: 'Self-employed',
    rating: 5,
    title: 'Perfect for solos',
    pros_text: 'For solo freelancers it is perfect. Time tracking, invoicing, expense capture in one place.',
    cons_text: 'No real chart of accounts customization.',
    daysAgo: 18,
  },
  {
    reviewer_name: 'Daniel C.',
    reviewer_role: 'Founder',
    reviewer_company_size: '1-10 employees',
    rating: 3,
    title: 'Nice UI, weak GL',
    pros_text: 'Pretty interface. Recurring invoices are great.',
    cons_text:
      'Not a real double-entry accounting product. Accountant complains every time. Bank feeds break weekly.',
    daysAgo: 24,
  },
  {
    reviewer_name: 'Yuki H.',
    reviewer_role: 'Bookkeeper',
    reviewer_company_size: '1-10 employees',
    rating: 2,
    title: 'Not built for Canadian tax',
    pros_text: 'Easy to onboard clients on the invoicing side.',
    cons_text:
      'No GST/HST e-filing. Customer support takes days to respond. Reports do not match what my CRA filings need.',
    daysAgo: 33,
  },
]

const WAVE_REVIEWS: ReviewSeed[] = [
  {
    reviewer_name: 'Patricia O.',
    reviewer_role: 'Founder',
    reviewer_company_size: '1-10 employees',
    rating: 4,
    title: 'Free is great until it is not',
    pros_text: 'Genuinely free for invoicing and basic accounting. Fine for a side hustle.',
    cons_text:
      'Bank connections drop weekly. Customer support is borderline non-existent. Payments fees are high.',
    daysAgo: 5,
  },
  {
    reviewer_name: 'Liam K.',
    reviewer_role: 'Solo Consultant',
    reviewer_company_size: 'Self-employed',
    rating: 3,
    title: 'Decent for free',
    pros_text: 'Free tier covers invoicing and basic books for a freelancer.',
    cons_text:
      'No phone support. Cannot file taxes. App is slow and dated. Reconciliation tools are weak.',
    daysAgo: 9,
  },
  {
    reviewer_name: 'Esme W.',
    reviewer_role: 'Owner',
    reviewer_company_size: '1-10 employees',
    rating: 2,
    title: 'You get what you pay for',
    pros_text: 'Free.',
    cons_text:
      'Bank feeds are unreliable. Lost a week of transactions when integration broke. Cannot get a human on the phone.',
    daysAgo: 16,
  },
  {
    reviewer_name: 'Bao N.',
    reviewer_role: 'Freelance Photographer',
    reviewer_company_size: 'Self-employed',
    rating: 4,
    title: 'Good enough for a sole prop',
    pros_text: 'Invoicing is clean. Receipts feature works in a pinch.',
    cons_text:
      'No project tagging. No GST/HST e-filing in Canada. Outgrowing it as soon as I incorporate.',
    daysAgo: 22,
  },
  {
    reviewer_name: 'Olive R.',
    reviewer_role: 'Bookkeeper',
    reviewer_company_size: '11-50 employees',
    rating: 2,
    title: 'Not for serious businesses',
    pros_text: 'Easy to set up.',
    cons_text:
      'Reports are extremely limited. Cannot do multi-currency well. Customer support takes 5+ days to respond.',
    daysAgo: 30,
  },
]

const XERO_REVIEWS: ReviewSeed[] = [
  {
    reviewer_name: 'Henry G.',
    reviewer_role: 'Accountant',
    reviewer_company_size: '11-50 employees',
    rating: 4,
    title: 'My favourite for client work',
    pros_text:
      'Beautiful UI. Best-in-class bank feeds in most regions. Massive marketplace of integrations.',
    cons_text:
      'Canadian-specific tax features lag the AU/NZ versions. GST e-filing is not native. Pricing has crept up.',
    daysAgo: 3,
  },
  {
    reviewer_name: 'Mei T.',
    reviewer_role: 'CFO',
    reviewer_company_size: '11-50 employees',
    rating: 4,
    title: 'Strong for multi-entity',
    pros_text:
      'Multi-currency, multi-entity reporting is excellent. Clean UX. Solid third-party app ecosystem.',
    cons_text:
      'Customer support has degraded. Pricing is no longer the friendly underdog it was. Payroll add-on is expensive.',
    daysAgo: 8,
  },
  {
    reviewer_name: 'Jordan A.',
    reviewer_role: 'Owner',
    reviewer_company_size: '1-10 employees',
    rating: 3,
    title: 'Powerful but overkill for solos',
    pros_text: 'Powerful reporting. Reliable.',
    cons_text:
      'Confusing pricing tiers, the cheap plan is too limited and the next tier is a big jump. Canadian sales tax handling is awkward.',
    daysAgo: 14,
  },
  {
    reviewer_name: 'Riya S.',
    reviewer_role: 'Bookkeeper',
    reviewer_company_size: '51-200 employees',
    rating: 5,
    title: 'Love the integrations',
    pros_text:
      'Hundreds of apps integrate. Bank rules are powerful. Reporting flexibility is great.',
    cons_text: 'Steep learning curve for non-accountants. GST e-filing in Canada still requires manual export.',
    daysAgo: 19,
  },
  {
    reviewer_name: 'Felix Q.',
    reviewer_role: 'Founder',
    reviewer_company_size: '1-10 employees',
    rating: 2,
    title: 'Confusing pricing changes',
    pros_text: 'When configured, runs well.',
    cons_text:
      'Pricing tiers changed mid-year and cost me $20 more per month. Setting up payroll requires a third-party. Support is slow.',
    daysAgo: 27,
  },
  {
    reviewer_name: 'Adetola B.',
    reviewer_role: 'Operations Lead',
    reviewer_company_size: '11-50 employees',
    rating: 3,
    title: 'Decent, not magic',
    pros_text: 'Looks good in board reports.',
    cons_text:
      'AI categorization is not as smart as the marketing implies. CRA-aligned reports require workarounds.',
    daysAgo: 35,
  },
]

const REVIEWS_BY_COMPANY: Record<string, ReviewSeed[]> = {
  reinvestwealth: REINVESTWEALTH_REVIEWS,
  quickbooks: QUICKBOOKS_REVIEWS,
  freshbooks: FRESHBOOKS_REVIEWS,
  wave: WAVE_REVIEWS,
  xero: XERO_REVIEWS,
}

export function buildSeedReviews(
  companies: { id: string; slug: string }[],
): Review[] {
  const reviews: Review[] = []
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (const company of companies) {
    const seeds = REVIEWS_BY_COMPANY[company.slug] ?? []
    seeds.forEach((seed, idx) => {
      const platform: Platform = seed.platform ?? (idx % 2 === 0 ? 'capterra' : 'g2')
      const reviewDate = new Date(now - seed.daysAgo * dayMs)
      reviews.push({
        id: `r-${company.slug}-${idx}`,
        company_id: company.id,
        platform,
        external_id: `${company.slug}-${platform}-${idx}`,
        reviewer_name: seed.reviewer_name,
        reviewer_role: seed.reviewer_role,
        reviewer_company_size: seed.reviewer_company_size,
        rating: seed.rating,
        review_date: reviewDate.toISOString().slice(0, 10),
        title: seed.title,
        pros_text: seed.pros_text,
        cons_text: seed.cons_text,
        full_text: `${seed.title}\n\nPros: ${seed.pros_text}\n\nCons: ${seed.cons_text}`,
        switched_from: seed.switched_from ?? null,
        raw_html: null,
        scraped_at: new Date(now - seed.daysAgo * dayMs + 1000).toISOString(),
      })
    })
  }

  return reviews
}
