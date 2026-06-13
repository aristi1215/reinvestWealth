import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarRange,
  ChevronRight,
  Loader2,
  Printer,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import { fetchCompanies, fetchLatestDigest, generateDigest } from '../lib/api'
import { Button } from '../components/shared/Button'
import { CompanyAvatar } from '../components/shared/CompanyAvatar'
import { formatRelative } from '../lib/utils'
import { toast } from 'sonner'

export const Route = createFileRoute('/digest')({
  component: DigestPage,
})

function DigestPage() {
  const queryClient = useQueryClient()
  const { data: digest, isLoading } = useQuery({
    queryKey: ['digest-latest'],
    queryFn: fetchLatestDigest,
  })
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  })
  const [busy, setBusy] = useState(false)

  const genMut = useMutation({
    mutationFn: generateDigest,
    onSuccess: () => {
      toast.success('New digest generated')
      queryClient.invalidateQueries({ queryKey: ['digest-latest'] })
    },
  })

  const companyBySlug = (slug: string) =>
    companies?.find((c) => c.slug === slug)

  if (isLoading || !digest) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[var(--text-muted)]" size={20} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1100px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <CalendarRange size={20} className="text-[var(--accent)]" />
            Week of {digest.week_start}
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            Generated {formatRelative(digest.created_at)} · ReInvestWealth
            competitive intelligence digest
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer size={14} /> Download PDF
          </Button>
          <Button
            variant="primary"
            disabled={busy || genMut.isPending}
            onClick={async () => {
              setBusy(true)
              await genMut.mutateAsync()
              setBusy(false)
            }}
          >
            {genMut.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Generate New Digest
          </Button>
        </div>
      </div>

      <Section title="What's new this week" icon={TrendingUp}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {digest.data.whats_new.map((entry) => {
            const c = companyBySlug(entry.company_slug)
            return (
              <div
                key={entry.company_slug}
                className="bg-white rounded-[12px] p-4 flex flex-col gap-2"
                style={{
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-center gap-2">
                  <CompanyAvatar
                    slug={entry.company_slug}
                    name={c?.display_name ?? entry.company_slug}
                    size={28}
                  />
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                    {c?.display_name ?? entry.company_slug}
                  </span>
                </div>
                <div>
                  <span className="text-[24px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {entry.new_review_count}
                  </span>
                  <span className="text-[12px] text-[var(--text-muted)] ml-1">
                    new reviews
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                  <span className="inline-flex items-center text-[var(--accent)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        fill={
                          i < Math.round(entry.avg_rating)
                            ? 'currentColor'
                            : 'transparent'
                        }
                        stroke="currentColor"
                      />
                    ))}
                  </span>
                  <span className="ml-0.5 font-semibold text-[var(--text-secondary)]">
                    {entry.avg_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Emerging pain themes" icon={Sparkles}>
        <div className="bg-white rounded-[12px] overflow-hidden"
          style={{
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {digest.data.emerging_pain_themes.map((entry, i) => {
            const c = companyBySlug(entry.company_slug)
            return (
              <div
                key={entry.company_slug}
                className="flex items-center gap-4 px-5 py-3"
                style={{
                  borderBottom:
                    i < digest.data.emerging_pain_themes.length - 1
                      ? '1px solid var(--border-subtle)'
                      : undefined,
                }}
              >
                <CompanyAvatar
                  slug={entry.company_slug}
                  name={c?.display_name ?? entry.company_slug}
                  size={28}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                    {entry.label}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {c?.display_name ?? entry.company_slug} ·{' '}
                    {entry.frequency_pct}% of reviews mention this
                  </p>
                </div>
                <span
                  className="text-[12px] font-semibold tabular-nums px-2 py-0.5 rounded"
                  style={{
                    background:
                      entry.delta_pct >= 3 ? 'var(--red-light)' : 'var(--amber-light)',
                    color:
                      entry.delta_pct >= 3 ? '#991B1B' : '#92400E',
                  }}
                >
                  +{entry.delta_pct.toFixed(1)}% vs last week
                </span>
              </div>
            )
          })}
          {digest.data.emerging_pain_themes.length === 0 && (
            <div className="px-5 py-6 text-center text-[13px] text-[var(--text-muted)]">
              No themes computed yet — run an analysis first.
            </div>
          )}
        </div>
      </Section>

      <Section title="Competitive opportunities" icon={ChevronRight}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {digest.data.competitive_opportunities.map((opp) => {
            const c = companyBySlug(opp.company_slug)
            return (
              <div
                key={opp.company_slug + opp.headline}
                className="bg-white rounded-[12px] p-4"
                style={{
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CompanyAvatar
                    slug={opp.company_slug}
                    name={c?.display_name ?? opp.company_slug}
                    size={22}
                  />
                  <span className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Target {c?.display_name ?? opp.company_slug}
                  </span>
                </div>
                <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">
                  {opp.headline}
                </p>
                {opp.resonant_phrase && (
                  <p
                    className="font-mono-sm mt-3 px-2.5 py-1.5 rounded-md"
                    style={{
                      background: 'var(--accent-light)',
                      borderLeft: '3px solid var(--accent)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    "{opp.resonant_phrase}"
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Top reviews to read" icon={Star}>
        <div className="bg-white rounded-[12px] overflow-hidden"
          style={{
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {digest.data.top_reviews.map((tr, i) => {
            const c = companyBySlug(tr.company_slug)
            return (
              <div
                key={tr.review_id}
                className="px-5 py-3 flex items-start gap-3"
                style={{
                  borderBottom:
                    i < digest.data.top_reviews.length - 1
                      ? '1px solid var(--border-subtle)'
                      : undefined,
                }}
              >
                <CompanyAvatar
                  slug={tr.company_slug}
                  name={c?.display_name ?? tr.company_slug}
                  size={26}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                      {c?.display_name ?? tr.company_slug}
                    </span>
                    <span className="inline-flex items-center text-[var(--accent)]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          size={11}
                          fill={
                            j < Math.round(tr.rating)
                              ? 'currentColor'
                              : 'transparent'
                          }
                          stroke="currentColor"
                        />
                      ))}
                    </span>
                    <span className="text-[12px] text-[var(--text-muted)]">
                      {tr.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--text-primary)] mt-0.5">
                    {tr.title}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">
                    {tr.excerpt}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-[14px] font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
        <Icon size={16} className="text-[var(--text-muted)]" />
        {title}
      </h2>
      {children}
    </section>
  )
}
