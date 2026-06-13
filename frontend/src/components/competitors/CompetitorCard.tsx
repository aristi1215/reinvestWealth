import { Star } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { CompanyAvatar } from '../shared/CompanyAvatar'
import {
  formatRelative,
  isStale,
  severityClasses,
} from '../../lib/utils'
import type { AnalysisRun, Company, PainTheme, RunType } from '../../types'

interface CompetitorCardProps {
  company: Company & { review_count: number; average_rating: number | null }
  painThemesRun?: AnalysisRun | null
  platforms: string[]
  lastScrapedAt: string | null
  latestRunsByType: Partial<Record<Exclude<RunType, 'full'>, AnalysisRun | null>>
}

export function CompetitorCard({
  company,
  painThemesRun,
  platforms,
  lastScrapedAt,
  latestRunsByType: _latestRunsByType,
}: CompetitorCardProps) {
  const themes =
    (painThemesRun?.result as { themes?: PainTheme[] } | null)?.themes ?? []
  const topThemes = [...themes]
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)

  const stale = isStale(lastScrapedAt)
  const rating = company.average_rating ?? 0

  return (
    <Link
      to="/competitors/$slug"
      params={{ slug: company.slug }}
      className="group"
      style={{ display: 'block' }}
    >
      <div
        className="bg-white rounded-[12px] p-5 transition-shadow duration-[120ms] group-hover:shadow-[var(--shadow-card-hover)] relative"
        style={{
          border: company.is_own_product
            ? '2px solid var(--accent)'
            : '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {company.is_own_product && (
          <span
            className="absolute top-3 right-3 text-[11px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
            }}
          >
            You
          </span>
        )}

        <div className="flex items-start gap-3">
          <CompanyAvatar
            slug={company.slug}
            name={company.display_name}
            size={48}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
              {company.display_name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[13px] text-[var(--text-muted)]">
              <span className="inline-flex items-center text-[var(--accent)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < Math.round(rating) ? 'currentColor' : 'transparent'}
                    stroke="currentColor"
                  />
                ))}
              </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {rating.toFixed(1)}
              </span>
              <span>·</span>
              <span>{company.review_count} reviews</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] my-4" />

        <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
          Top pain themes
        </p>
        {topThemes.length === 0 ? (
          <p className="text-[12px] text-[var(--text-muted)]">
            No analysis available yet.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {topThemes.map((theme) => {
              const colors = severityClasses(theme.severity)
              return (
                <span
                  key={theme.label}
                  className="inline-flex items-center text-[12px] font-semibold px-2 py-1 rounded-md w-fit max-w-full truncate"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                  title={theme.label}
                >
                  {theme.label}
                </span>
              )
            })}
          </div>
        )}

        <div className="border-t border-[var(--border-subtle)] my-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {platforms.map((p) => (
              <span
                key={p}
                className="text-[11px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--bg-page)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {p}
              </span>
            ))}
            {stale && (
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--amber-light)',
                  color: '#92400E',
                }}
              >
                Stale
              </span>
            )}
          </div>
          <span className="text-[12px] font-semibold text-[var(--accent)] group-hover:text-[var(--accent-hover)]">
            View details →
          </span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-2">
          Last scraped {formatRelative(lastScrapedAt)}
        </div>
      </div>
    </Link>
  )
}
