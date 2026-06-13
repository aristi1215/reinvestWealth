import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ChevronRight,
  Filter,
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
} from 'lucide-react'
import { fetchCompany } from '../lib/api'
import { Button } from '../components/shared/Button'
import { CompanyAvatar } from '../components/shared/CompanyAvatar'
import { EmptyState } from '../components/shared/EmptyState'
import { PainThemeCard } from '../components/competitors/PainThemeCard'
import { FeatureGapCard } from '../components/competitors/FeatureGapCard'
import { SentimentBreakdown } from '../components/competitors/SentimentBreakdown'
import { CopySuggestionsPanel } from '../components/competitors/CopySuggestionsPanel'
import { useAnalysisTrigger, useScrapeTrigger } from '../hooks/useJobs'
import { formatRelative, isStale } from '../lib/utils'
import type {
  CopySuggestionsResult,
  FeatureGap,
  PainTheme,
  SentimentResult,
} from '../types'

export const Route = createFileRoute('/competitors/$slug')({
  component: CompetitorDetailPage,
})

type Tab = 'pain_themes' | 'feature_gaps' | 'sentiment' | 'copy_suggestions'

function CompetitorDetailPage() {
  const { slug } = Route.useParams()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => fetchCompany(slug),
    staleTime: 60_000,
  })

  const [activeTab, setActiveTab] = useState<Tab>('pain_themes')
  const [complexityFilter, setComplexityFilter] = useState<
    'all' | 'quick_win' | 'medium' | 'complex'
  >('all')
  const triggerScrape = useScrapeTrigger()
  const triggerAnalysis = useAnalysisTrigger()
  const [scraping, setScraping] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  if (isLoading || !data)
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[var(--text-muted)]" size={20} />
      </div>
    )

  const { company, average_rating, review_count, platform_counts, last_scraped_at, latest_runs } = data
  const stale = isStale(last_scraped_at)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pain_themes', label: 'Pain Themes' },
    { id: 'feature_gaps', label: 'Feature Gaps' },
    { id: 'sentiment', label: 'Sentiment' },
    {
      id: 'copy_suggestions',
      label: company.is_own_product ? 'Your Reviews' : 'Copy Suggestions',
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1280px]">
      <div
        className="bg-white rounded-[12px] p-5 flex flex-col gap-4"
        style={{
          border: company.is_own_product
            ? '2px solid var(--accent)'
            : '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-start gap-4">
          <CompanyAvatar slug={company.slug} name={company.display_name} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-semibold text-[var(--text-primary)] truncate">
                {company.display_name}
              </h1>
              {company.is_own_product && (
                <span
                  className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                  }}
                >
                  You
                </span>
              )}
              {stale && (
                <span
                  className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--amber-light)',
                    color: '#92400E',
                  }}
                >
                  Stale data
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[13px] text-[var(--text-muted)]">
              <span className="inline-flex items-center text-[var(--accent)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(average_rating ?? 0) ? 'currentColor' : 'transparent'}
                    stroke="currentColor"
                  />
                ))}
              </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {(average_rating ?? 0).toFixed(1)}
              </span>
              <span>·</span>
              <span>{review_count} reviews</span>
              {Object.entries(platform_counts).map(([platform, count]) => (
                <span
                  key={platform}
                  className="text-[11px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--bg-page)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {platform} ({count})
                </span>
              ))}
              <span>·</span>
              <span>Last scraped {formatRelative(last_scraped_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={scraping}
              onClick={async () => {
                setScraping(true)
                await triggerScrape({
                  company_slug: company.slug,
                  platform: 'all',
                  company_label: company.display_name,
                })
                setScraping(false)
                void refetch()
              }}
            >
              {scraping ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Re-scrape
            </Button>
            <Button
              variant="primary"
              disabled={analyzing}
              onClick={async () => {
                setAnalyzing(true)
                await triggerAnalysis({
                  company_slug: company.slug,
                  run_type: 'full',
                  company_label: company.display_name,
                })
                setAnalyzing(false)
                void refetch()
              }}
            >
              {analyzing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Re-analyze
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--border-default)]">
        <nav className="flex items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="text-[13px] font-semibold py-2.5 px-3 transition-colors duration-[80ms]"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="tab-content" key={activeTab}>
        {activeTab === 'pain_themes' && (
          <PainThemesTab
            run={latest_runs.pain_themes}
            companySlug={company.slug}
            isOwn={company.is_own_product}
            onRunAnalysis={async () => {
              await triggerAnalysis({
                company_slug: company.slug,
                run_type: 'pain_themes',
                company_label: company.display_name,
              })
            }}
          />
        )}
        {activeTab === 'feature_gaps' && (
          <FeatureGapsTab
            run={latest_runs.feature_gaps}
            complexityFilter={complexityFilter}
            setComplexityFilter={setComplexityFilter}
            onRunAnalysis={async () => {
              await triggerAnalysis({
                company_slug: company.slug,
                run_type: 'feature_gaps',
                company_label: company.display_name,
              })
            }}
          />
        )}
        {activeTab === 'sentiment' && (
          <SentimentTab
            run={latest_runs.sentiment}
            companySlug={company.slug}
            onRunAnalysis={async () => {
              await triggerAnalysis({
                company_slug: company.slug,
                run_type: 'sentiment',
                company_label: company.display_name,
              })
            }}
          />
        )}
        {activeTab === 'copy_suggestions' && (
          <CopyTab
            run={latest_runs.copy_suggestions}
            isOwn={company.is_own_product}
            companyName={company.display_name}
            onRunAnalysis={async () => {
              await triggerAnalysis({
                company_slug: company.slug,
                run_type: 'copy_suggestions',
                company_label: company.display_name,
              })
            }}
          />
        )}
      </div>
    </div>
  )
}

function PainThemesTab({
  run,
  companySlug,
  isOwn,
  onRunAnalysis,
}: {
  run: import('../types').AnalysisRun | null
  companySlug: string
  isOwn: boolean
  onRunAnalysis: () => Promise<void>
}) {
  const themes = (run?.result as { themes?: PainTheme[] } | null)?.themes ?? []
  if (!themes.length) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No pain theme analysis yet"
        description="Run a pain theme analysis to surface what users complain about most."
        action={
          <Button variant="primary" onClick={onRunAnalysis}>
            <Sparkles size={14} /> Run analysis
          </Button>
        }
      />
    )
  }
  const sorted = [...themes].sort((a, b) => b.severity - a.severity)
  return (
    <div className="flex flex-col">
      {sorted.map((theme) => (
        <PainThemeCard
          key={theme.label}
          theme={theme}
          companySlug={companySlug}
          showOpportunity={!isOwn && theme.severity >= 7}
        />
      ))}
    </div>
  )
}

function FeatureGapsTab({
  run,
  complexityFilter,
  setComplexityFilter,
  onRunAnalysis,
}: {
  run: import('../types').AnalysisRun | null
  complexityFilter: 'all' | 'quick_win' | 'medium' | 'complex'
  setComplexityFilter: (
    v: 'all' | 'quick_win' | 'medium' | 'complex',
  ) => void
  onRunAnalysis: () => Promise<void>
}) {
  const gaps = (run?.result as { gaps?: FeatureGap[] } | null)?.gaps ?? []
  if (!gaps.length) {
    return (
      <EmptyState
        icon={ChevronRight}
        title="No feature gap analysis yet"
        description="Surface the most-requested features and integrations users complain are missing."
        action={
          <Button variant="primary" onClick={onRunAnalysis}>
            <Sparkles size={14} /> Run analysis
          </Button>
        }
      />
    )
  }
  const filtered =
    complexityFilter === 'all'
      ? gaps
      : gaps.filter((g) => g.complexity === complexityFilter)
  const sorted = [...filtered].sort(
    (a, b) => b.opportunity_score - a.opportunity_score,
  )

  const filters: { id: typeof complexityFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'quick_win', label: 'Quick Win' },
    { id: 'medium', label: 'Medium' },
    { id: 'complex', label: 'Complex' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[12px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          <Filter size={12} /> Complexity
        </span>
        <div className="flex items-center gap-1">
          {filters.map((f) => {
            const active = complexityFilter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setComplexityFilter(f.id)}
                className="text-[12px] font-semibold px-2.5 py-1 rounded-md"
                style={{
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border-default)'}`,
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((gap) => (
          <FeatureGapCard key={gap.feature_name} gap={gap} />
        ))}
      </div>
    </div>
  )
}

function SentimentTab({
  run,
  companySlug,
  onRunAnalysis,
}: {
  run: import('../types').AnalysisRun | null
  companySlug: string
  onRunAnalysis: () => Promise<void>
}) {
  const sentiment = run?.result as SentimentResult | null
  if (!sentiment) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No sentiment analysis yet"
        description="Run sentiment to estimate NPS and surface what users praise vs criticize."
        action={
          <Button variant="primary" onClick={onRunAnalysis}>
            <Sparkles size={14} /> Run analysis
          </Button>
        }
      />
    )
  }
  return <SentimentBreakdown sentiment={sentiment} companySlug={companySlug} />
}

function CopyTab({
  run,
  isOwn,
  companyName,
  onRunAnalysis,
}: {
  run: import('../types').AnalysisRun | null
  isOwn: boolean
  companyName: string
  onRunAnalysis: () => Promise<void>
}) {
  if (isOwn) {
    return (
      <div className="bg-white rounded-[12px] p-6 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
          What users praise about {companyName}
        </h3>
        <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
          The "Copy Suggestions" tab is reserved for competitor pages — it
          surfaces marketing intelligence ReInvestWealth can use against
          competitors.
        </p>
        <p className="mt-3 text-[13px] text-[var(--text-secondary)] leading-relaxed">
          For your own reviews, look at the Sentiment tab to see what users
          love about ReInvestWealth and the Pain Themes tab for areas to
          improve.
        </p>
      </div>
    )
  }
  const result = run?.result as CopySuggestionsResult | null
  if (!result) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No copy suggestions yet"
        description="Generate ad headlines, value props, and resonant phrases ReInvestWealth can target frustrated users with."
        action={
          <Button variant="primary" onClick={onRunAnalysis}>
            <Sparkles size={14} /> Generate copy
          </Button>
        }
      />
    )
  }
  return <CopySuggestionsPanel result={result} />
}
