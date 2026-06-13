import type {
  AnalysisRun,
  CopySuggestionsResult,
  FeatureGap,
  PainTheme,
  SentimentResult,
} from '../types/index.js'

interface CompanyAnalysisSeed {
  pain_themes: PainTheme[]
  feature_gaps: FeatureGap[]
  sentiment: SentimentResult
  copy_suggestions: CopySuggestionsResult | null
}

export const SEED_ANALYSES: Record<string, CompanyAnalysisSeed> = {
  reinvestwealth: {
    pain_themes: [
      {
        label: 'Limited project tracking',
        description:
          'Power users want per-project or per-client P&L visibility for agency-style workflows.',
        frequency_pct: 32,
        verbatim_phrases: [
          'cannot easily see profit per client',
          'project tagging would be huge',
          'no per-project P&L view',
        ],
        severity: 5,
      },
      {
        label: 'Basic mobile experience',
        description:
          'iOS app feels minimal compared to web. Receipt scanning and dashboard widgets requested.',
        frequency_pct: 24,
        verbatim_phrases: [
          'mobile app is basic',
          'better receipt scanning on iOS',
          'mobile widget showing weekly cash position',
        ],
        severity: 4,
      },
      {
        label: 'Missing native integrations',
        description:
          'Specifically Shopify and class tracking are blockers for retail and multi-location SMBs.',
        frequency_pct: 18,
        verbatim_phrases: [
          'no native Shopify connector',
          'class tracking is the biggest gap',
          'limited integrations vs Xero',
        ],
        severity: 6,
      },
      {
        label: 'Reporting depth',
        description:
          'Advanced users want flexible reports including budgets, forecasts, and segment views.',
        frequency_pct: 16,
        verbatim_phrases: [
          'reporting could be more flexible',
          'wish there was a deeper budgeting module',
          'exporting to Sheets for forecasts',
        ],
        severity: 4,
      },
    ],
    feature_gaps: [
      {
        feature_name: 'Project / Client Tagging',
        description:
          'Tag transactions to a specific client or project for per-project P&L and profitability views.',
        demand_count: 18,
        opportunity_score: 9,
        complexity: 'medium',
      },
      {
        feature_name: 'Native Shopify Integration',
        description:
          'Direct sync of Shopify orders, refunds, and fees into the books with automatic GST handling.',
        demand_count: 11,
        opportunity_score: 8,
        complexity: 'medium',
      },
      {
        feature_name: 'Class / Location Tracking',
        description:
          'Track multiple locations or business segments within a single entity, mirroring QBO class tracking.',
        demand_count: 9,
        opportunity_score: 7,
        complexity: 'complex',
      },
      {
        feature_name: 'iOS Receipt Scanner v2',
        description:
          'Faster, more accurate OCR for receipts on iOS plus auto-attaching to matched transactions.',
        demand_count: 7,
        opportunity_score: 7,
        complexity: 'quick_win',
      },
      {
        feature_name: 'Budget vs Actual Module',
        description:
          'Native budgeting interface with monthly comparisons and variance highlights.',
        demand_count: 6,
        opportunity_score: 6,
        complexity: 'medium',
      },
    ],
    sentiment: {
      overall_sentiment: 'positive',
      nps_estimate: 62,
      positive_aspects: [
        { aspect: 'AI categorization', frequency_pct: 71 },
        { aspect: 'Affordable pricing', frequency_pct: 58 },
        { aspect: 'Fast onboarding', frequency_pct: 52 },
        { aspect: 'GST/HST e-filing', frequency_pct: 41 },
        { aspect: 'Responsive support', frequency_pct: 33 },
      ],
      negative_aspects: [
        { aspect: 'Limited integrations', frequency_pct: 22 },
        { aspect: 'Mobile app', frequency_pct: 19 },
        { aspect: 'Reporting depth', frequency_pct: 16 },
        { aspect: 'Project tracking', frequency_pct: 14 },
        { aspect: 'Budgeting module', frequency_pct: 9 },
      ],
      emotional_keywords: [
        'effortless',
        'finally',
        'reliable',
        'fast',
        'honest',
        'clean',
        'modern',
        'Canadian',
      ],
    },
    copy_suggestions: null,
  },
  quickbooks: {
    pain_themes: [
      {
        label: 'Pricing keeps climbing',
        description:
          'Repeated annual price hikes plus paid add-ons make total cost feel out of reach for SMBs.',
        frequency_pct: 47,
        verbatim_phrases: [
          'could not justify paying $75/month for features I do not use',
          'pricing keeps going up every year',
          'nickel-and-dimes on every feature',
        ],
        severity: 9,
      },
      {
        label: 'Confusing onboarding',
        description:
          'New users report multi-day setup struggles, especially around bank connections and tax configuration.',
        frequency_pct: 34,
        verbatim_phrases: [
          'took me 3 days to figure out',
          'onboarding is confusing and there is no guidance',
          "couldn't connect my RBC account on first try",
        ],
        severity: 8,
      },
      {
        label: 'Offshore support quality',
        description:
          'Customer support frequently described as scripted, slow, and unable to resolve real issues.',
        frequency_pct: 29,
        verbatim_phrases: [
          'customer support is offshore and reads from scripts',
          'support told me to clear my cache for 4 emails in a row',
          'offshore and unhelpful',
        ],
        severity: 8,
      },
      {
        label: 'Mobile app instability',
        description:
          'iOS users report frequent crashes and missing parity vs web, blocking on-the-go workflows.',
        frequency_pct: 21,
        verbatim_phrases: [
          'mobile app crashes on iOS 17',
          'mobile app crashes on iOS regularly',
          'app crashes on iOS',
        ],
        severity: 7,
      },
      {
        label: 'AI suggestions wrong',
        description:
          'Auto-categorization is inaccurate enough that users do not trust it and review every transaction.',
        frequency_pct: 19,
        verbatim_phrases: [
          'AI suggestions are wrong half the time',
          'AI categorization is wrong half the time',
        ],
        severity: 7,
      },
      {
        label: 'Bloated UI',
        description:
          'Long-time users describe the interface as cluttered and visually dated.',
        frequency_pct: 17,
        verbatim_phrases: [
          'interface is overwhelming',
          'UI looks like 2014',
        ],
        severity: 5,
      },
    ],
    feature_gaps: [
      {
        feature_name: 'Affordable Canadian-tax tier',
        description:
          'A streamlined plan with native GST/HST e-filing at a price that competes with $39 CAD/mo tools.',
        demand_count: 22,
        opportunity_score: 9,
        complexity: 'medium',
      },
      {
        feature_name: 'Reliable bank feeds',
        description:
          'Stop forcing re-authentication every few weeks; users want set-and-forget Plaid-style feeds.',
        demand_count: 17,
        opportunity_score: 8,
        complexity: 'medium',
      },
      {
        feature_name: 'Stable iOS app',
        description:
          'Crash-free iOS app with parity for receipts, reconciliation, and reports.',
        demand_count: 14,
        opportunity_score: 7,
        complexity: 'medium',
      },
      {
        feature_name: 'Bulk receipt upload (no add-on)',
        description:
          'Upload multiple receipts at once without paying for an upgraded tier.',
        demand_count: 9,
        opportunity_score: 7,
        complexity: 'quick_win',
      },
    ],
    sentiment: {
      overall_sentiment: 'mixed',
      nps_estimate: 18,
      positive_aspects: [
        { aspect: 'Brand recognition', frequency_pct: 38 },
        { aspect: 'Mature feature set', frequency_pct: 31 },
        { aspect: 'Accountant familiarity', frequency_pct: 28 },
        { aspect: 'Reporting depth', frequency_pct: 21 },
        { aspect: 'Multi-currency', frequency_pct: 14 },
      ],
      negative_aspects: [
        { aspect: 'Price', frequency_pct: 47 },
        { aspect: 'Onboarding', frequency_pct: 34 },
        { aspect: 'Support quality', frequency_pct: 29 },
        { aspect: 'Mobile app', frequency_pct: 21 },
        { aspect: 'AI accuracy', frequency_pct: 19 },
      ],
      emotional_keywords: [
        'frustrated',
        'expensive',
        'bloated',
        'confusing',
        'overwhelming',
        'dated',
        'scripted',
      ],
    },
    copy_suggestions: {
      ad_headlines: [
        'Tired of QuickBooks complexity? Your books in 5 minutes, not 5 days.',
        'The accounting software that actually makes sense — built in Canada, for Canadians.',
        'Stop paying $75/month for features you never use. Switch to ReInvestWealth at $39 CAD.',
        'AI that actually categorizes correctly. The first time.',
        'GST/HST e-filing in two clicks. No add-ons, no upsells.',
      ],
      value_propositions: [
        'Bookkeeping on autopilot for Canadian SMBs — set up in 12 minutes, not 12 hours.',
        'A flat $39 CAD/month. No paid add-ons, no annual price hikes, no surprises.',
        'Real humans, real Canadian support — replies in hours, not script-loops.',
      ],
      resonant_phrases: [
        'could not justify paying $75/month for features I do not use',
        'onboarding is confusing and there is no guidance',
        "couldn't connect my RBC account on first try",
        'support told me to clear my cache for 4 emails in a row',
      ],
      search_keywords: [
        'quickbooks alternative canada',
        'cheaper than quickbooks online',
        'easy gst hst filing software',
        'quickbooks too expensive',
      ],
    },
  },
  freshbooks: {
    pain_themes: [
      {
        label: 'Pricing per client gets brutal',
        description:
          'Billable-client based pricing scales painfully for agencies and consultants over 50 clients.',
        frequency_pct: 38,
        verbatim_phrases: [
          'pricing per billable client is brutal',
          'outgrew it within a year',
        ],
        severity: 8,
      },
      {
        label: 'Shallow accounting / GL',
        description:
          'Users hit a ceiling once they need real double-entry accounting and customizable chart of accounts.',
        frequency_pct: 33,
        verbatim_phrases: [
          'not a real double-entry accounting product',
          'cannot track project profitability properly',
          'no real chart of accounts customization',
        ],
        severity: 7,
      },
      {
        label: 'No GST/HST e-filing',
        description:
          'Canadian users complain that filings still require manual exports and calculations.',
        frequency_pct: 24,
        verbatim_phrases: [
          'no GST/HST e-filing',
          'not built for Canadian tax',
        ],
        severity: 7,
      },
      {
        label: 'Bank feed reliability',
        description:
          'Bank feeds reportedly drop or break weekly, requiring repeated re-authentication.',
        frequency_pct: 18,
        verbatim_phrases: [
          'bank reconciliation is buggy',
          'bank feeds break weekly',
        ],
        severity: 6,
      },
    ],
    feature_gaps: [
      {
        feature_name: 'Flat-fee pricing for agencies',
        description: 'A non-per-client tier for agencies and consultancies.',
        demand_count: 14,
        opportunity_score: 8,
        complexity: 'quick_win',
      },
      {
        feature_name: 'Real double-entry GL',
        description:
          'A proper general ledger with customizable chart of accounts for accountant workflows.',
        demand_count: 12,
        opportunity_score: 8,
        complexity: 'complex',
      },
      {
        feature_name: 'Canadian GST/HST e-filing',
        description: 'Native CRA-aligned e-filing for GST/HST.',
        demand_count: 10,
        opportunity_score: 9,
        complexity: 'medium',
      },
    ],
    sentiment: {
      overall_sentiment: 'mixed',
      nps_estimate: 32,
      positive_aspects: [
        { aspect: 'Invoicing UX', frequency_pct: 52 },
        { aspect: 'Time tracking', frequency_pct: 31 },
        { aspect: 'Mobile experience', frequency_pct: 26 },
        { aspect: 'Friendly UI', frequency_pct: 24 },
        { aspect: 'Recurring invoices', frequency_pct: 18 },
      ],
      negative_aspects: [
        { aspect: 'Per-client pricing', frequency_pct: 38 },
        { aspect: 'Shallow accounting', frequency_pct: 33 },
        { aspect: 'Canadian tax', frequency_pct: 24 },
        { aspect: 'Bank reconciliation', frequency_pct: 18 },
        { aspect: 'Reporting depth', frequency_pct: 14 },
      ],
      emotional_keywords: [
        'pretty',
        'friendly',
        'shallow',
        'outgrew',
        'expensive',
        'easy',
      ],
    },
    copy_suggestions: {
      ad_headlines: [
        'Outgrowing FreshBooks? Real Canadian books, no per-client penalty.',
        'Beautiful invoicing AND real double-entry accounting. Without the upgrade tax.',
        'FreshBooks for invoices, ReInvestWealth for everything else? Just use one.',
        'Native GST/HST e-filing — something FreshBooks still cannot do.',
        'Stop paying per client. Flat $39 CAD/month for unlimited clients.',
      ],
      value_propositions: [
        'A real general ledger built for Canadian SMBs — not just an invoicing tool with a books tab.',
        'Native GST/HST e-filing, included. No exports, no calculations, no surprises at year-end.',
        'Flat pricing that does not punish growth.',
      ],
      resonant_phrases: [
        'outgrew it within a year',
        'not a real double-entry accounting product',
        'no GST/HST e-filing',
        'pricing per billable client is brutal',
      ],
      search_keywords: [
        'freshbooks alternative canada',
        'freshbooks vs quickbooks canada',
        'freshbooks gst hst',
        'real accounting software for agencies',
      ],
    },
  },
  wave: {
    pain_themes: [
      {
        label: 'Bank feeds drop weekly',
        description:
          'Bank connection reliability is the loudest complaint, sometimes losing days of transactions.',
        frequency_pct: 41,
        verbatim_phrases: [
          'bank connections drop weekly',
          'bank feeds are unreliable',
          'lost a week of transactions',
        ],
        severity: 8,
      },
      {
        label: 'Almost no support',
        description:
          'Free tier users report no phone support and email replies often take 5+ days.',
        frequency_pct: 36,
        verbatim_phrases: [
          'cannot get a human on the phone',
          'no phone support',
          'customer support takes 5+ days to respond',
        ],
        severity: 8,
      },
      {
        label: 'Outgrows quickly',
        description:
          'Users incorporating or scaling beyond freelancing find Wave too thin for proper accounting.',
        frequency_pct: 26,
        verbatim_phrases: [
          'outgrowing it as soon as I incorporate',
          'not for serious businesses',
        ],
        severity: 7,
      },
      {
        label: 'No Canadian tax e-filing',
        description:
          'GST/HST and CRA-aligned reports require export and manual filing.',
        frequency_pct: 18,
        verbatim_phrases: ['no GST/HST e-filing in Canada'],
        severity: 6,
      },
    ],
    feature_gaps: [
      {
        feature_name: 'Reliable bank connections',
        description: 'Persistent, multi-month bank feeds without re-authentication.',
        demand_count: 18,
        opportunity_score: 9,
        complexity: 'medium',
      },
      {
        feature_name: 'Human support tier',
        description: 'Affordable plan that includes responsive Canadian support.',
        demand_count: 12,
        opportunity_score: 8,
        complexity: 'quick_win',
      },
      {
        feature_name: 'Project tagging',
        description: 'Tag income/expense to projects for sole props and freelancers.',
        demand_count: 7,
        opportunity_score: 6,
        complexity: 'medium',
      },
    ],
    sentiment: {
      overall_sentiment: 'mixed',
      nps_estimate: 24,
      positive_aspects: [
        { aspect: 'Free tier', frequency_pct: 64 },
        { aspect: 'Easy setup', frequency_pct: 39 },
        { aspect: 'Invoicing', frequency_pct: 27 },
        { aspect: 'Receipts', frequency_pct: 14 },
        { aspect: 'Sole-prop friendly', frequency_pct: 11 },
      ],
      negative_aspects: [
        { aspect: 'Bank feeds', frequency_pct: 41 },
        { aspect: 'Support', frequency_pct: 36 },
        { aspect: 'Outgrows quickly', frequency_pct: 26 },
        { aspect: 'No e-filing', frequency_pct: 18 },
        { aspect: 'Reporting', frequency_pct: 14 },
      ],
      emotional_keywords: [
        'free',
        'unreliable',
        'silent',
        'thin',
        'dated',
        'okay',
      ],
    },
    copy_suggestions: {
      ad_headlines: [
        'Outgrowing Wave? Real books with real Canadian support — $39/mo.',
        'Free is great until your bank feed breaks. Reliable feeds for a coffee a day.',
        'When your business gets serious, your accounting should too.',
        'Wave users: keep the simplicity, lose the broken bank feeds.',
        'Real humans answer your accounting questions. Not a forum.',
      ],
      value_propositions: [
        'For freelancers ready to incorporate — proper books, GST/HST e-filing, real support.',
        'Plaid-powered bank connections that stay connected for months, not days.',
        'Affordable enough to feel free, sturdy enough to grow with you.',
      ],
      resonant_phrases: [
        'bank connections drop weekly',
        'cannot get a human on the phone',
        'outgrowing it as soon as I incorporate',
        'lost a week of transactions',
      ],
      search_keywords: [
        'wave accounting alternative',
        'wave bank feed not working',
        'best accounting after wave',
        'cheap accounting with support',
      ],
    },
  },
  xero: {
    pain_themes: [
      {
        label: 'Canadian tax lags behind',
        description:
          'Canadian-specific tax features feel second-class compared to AU/NZ. GST e-filing not native.',
        frequency_pct: 31,
        verbatim_phrases: [
          'GST e-filing is not native',
          'Canadian sales tax handling is awkward',
          'CRA-aligned reports require workarounds',
        ],
        severity: 7,
      },
      {
        label: 'Confusing pricing tiers',
        description:
          'Cheap plan is too limited and the next tier is a steep jump; pricing has changed mid-year.',
        frequency_pct: 23,
        verbatim_phrases: [
          'confusing pricing tiers',
          'pricing tiers changed mid-year',
        ],
        severity: 6,
      },
      {
        label: 'Steep learning curve',
        description:
          'Non-accountant founders find Xero powerful but harder to learn than competing tools.',
        frequency_pct: 19,
        verbatim_phrases: [
          'steep learning curve for non-accountants',
        ],
        severity: 5,
      },
      {
        label: 'Support quality decline',
        description:
          'Long-time users mention slower and lower-quality support compared to a few years ago.',
        frequency_pct: 14,
        verbatim_phrases: [
          'customer support has degraded',
          'support is slow',
        ],
        severity: 5,
      },
    ],
    feature_gaps: [
      {
        feature_name: 'Native Canadian GST/HST e-filing',
        description:
          'CRA-direct e-filing for GST/HST without manual export or third-party plug-in.',
        demand_count: 13,
        opportunity_score: 9,
        complexity: 'medium',
      },
      {
        feature_name: 'Beginner mode',
        description:
          'Simplified UI for non-accountant founders that progressively reveals advanced features.',
        demand_count: 8,
        opportunity_score: 6,
        complexity: 'medium',
      },
      {
        feature_name: 'Predictable pricing',
        description:
          'Smaller jumps between tiers and a transparent fixed-price plan for solos.',
        demand_count: 6,
        opportunity_score: 6,
        complexity: 'quick_win',
      },
    ],
    sentiment: {
      overall_sentiment: 'positive',
      nps_estimate: 41,
      positive_aspects: [
        { aspect: 'UX & design', frequency_pct: 47 },
        { aspect: 'Integrations marketplace', frequency_pct: 41 },
        { aspect: 'Bank rules', frequency_pct: 28 },
        { aspect: 'Multi-currency', frequency_pct: 22 },
        { aspect: 'Reporting flexibility', frequency_pct: 18 },
      ],
      negative_aspects: [
        { aspect: 'Canadian tax', frequency_pct: 31 },
        { aspect: 'Pricing tiers', frequency_pct: 23 },
        { aspect: 'Learning curve', frequency_pct: 19 },
        { aspect: 'Support', frequency_pct: 14 },
        { aspect: 'Payroll add-on', frequency_pct: 11 },
      ],
      emotional_keywords: [
        'beautiful',
        'powerful',
        'capable',
        'pricey',
        'global',
        'awkward',
      ],
    },
    copy_suggestions: {
      ad_headlines: [
        'Xero is great. ReInvestWealth is great AND Canadian-first.',
        'GST/HST e-filing? Native, not a workaround.',
        'All the polish of Xero, none of the Canadian tax friction.',
        'Built for the CRA, not retro-fitted for it.',
        'Predictable $39 CAD/month — no mid-year tier shuffles.',
      ],
      value_propositions: [
        'Designed in Canada for Canadian SMBs — GST/HST e-filing is a button, not a project.',
        'AI bookkeeping that learns your chart of accounts in a week.',
        'Flat $39 CAD/month with no tier games and no add-on upsells.',
      ],
      resonant_phrases: [
        'GST e-filing is not native',
        'Canadian sales tax handling is awkward',
        'pricing tiers changed mid-year',
        'CRA-aligned reports require workarounds',
      ],
      search_keywords: [
        'xero alternative canada',
        'xero gst hst e filing',
        'canadian accounting software xero',
        'cheaper than xero canada',
      ],
    },
  },
}

export function buildSeedAnalysisRuns(
  companies: { id: string; slug: string }[],
): AnalysisRun[] {
  const runs: AnalysisRun[] = []
  const now = Date.now()
  const fourHoursAgo = new Date(now - 4 * 60 * 60 * 1000).toISOString()

  for (const company of companies) {
    const seed = SEED_ANALYSES[company.slug]
    if (!seed) continue

    const baseStarted = new Date(now - 4 * 60 * 60 * 1000)
    const completed = new Date(baseStarted.getTime() + 90_000)

    runs.push({
      id: `ar-${company.slug}-pain`,
      company_id: company.id,
      run_type: 'pain_themes',
      status: 'completed',
      model_used: 'gemini-2.0-flash',
      reviews_analyzed: 8,
      result: { themes: seed.pain_themes },
      error_message: null,
      started_at: baseStarted.toISOString(),
      completed_at: completed.toISOString(),
      created_at: fourHoursAgo,
    })

    runs.push({
      id: `ar-${company.slug}-gaps`,
      company_id: company.id,
      run_type: 'feature_gaps',
      status: 'completed',
      model_used: 'gemini-2.0-flash',
      reviews_analyzed: 8,
      result: { gaps: seed.feature_gaps },
      error_message: null,
      started_at: new Date(completed.getTime() + 1000).toISOString(),
      completed_at: new Date(completed.getTime() + 60_000).toISOString(),
      created_at: fourHoursAgo,
    })

    runs.push({
      id: `ar-${company.slug}-sentiment`,
      company_id: company.id,
      run_type: 'sentiment',
      status: 'completed',
      model_used: 'gemini-2.0-flash',
      reviews_analyzed: 8,
      result: seed.sentiment,
      error_message: null,
      started_at: new Date(completed.getTime() + 60_000).toISOString(),
      completed_at: new Date(completed.getTime() + 120_000).toISOString(),
      created_at: fourHoursAgo,
    })

    if (seed.copy_suggestions) {
      runs.push({
        id: `ar-${company.slug}-copy`,
        company_id: company.id,
        run_type: 'copy_suggestions',
        status: 'completed',
        model_used: 'gemini-2.0-flash',
        reviews_analyzed: 8,
        result: seed.copy_suggestions,
        error_message: null,
        started_at: new Date(completed.getTime() + 120_000).toISOString(),
        completed_at: new Date(completed.getTime() + 180_000).toISOString(),
        created_at: fourHoursAgo,
      })
    }
  }

  return runs
}
