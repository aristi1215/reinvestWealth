import type { LucideIcon } from 'lucide-react'
import {
  MessageSquareText,
  Building2,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import type { DashboardSummary } from '../../types'
import { Skeleton } from '../shared/Skeleton'
import { formatRelative } from '../../lib/utils'

interface CardSpec {
  label: string
  value: string
  icon: LucideIcon
  trend?: { text: string; positive?: boolean }
}

export function SummaryCards({
  summary,
  isLoading,
}: {
  summary?: DashboardSummary
  isLoading?: boolean
}) {
  const cards: CardSpec[] = summary
    ? [
        {
          label: 'Total Reviews Tracked',
          value: summary.totals.total_reviews.toLocaleString(),
          icon: MessageSquareText,
          trend:
            summary.totals.new_reviews_7d > 0
              ? {
                  text: `+${summary.totals.new_reviews_7d} this week`,
                  positive: true,
                }
              : undefined,
        },
        {
          label: 'Companies Monitored',
          value: String(summary.totals.companies),
          icon: Building2,
          trend: { text: `${summary.totals.platforms.length} platforms`, positive: true },
        },
        {
          label: 'New Reviews This Week',
          value: String(summary.totals.new_reviews_7d),
          icon: TrendingUp,
          trend:
            summary.totals.new_reviews_7d > 0
              ? { text: 'fresh signal', positive: true }
              : { text: 'stale', positive: false },
        },
        {
          label: 'Last Analysis Run',
          value: summary.last_analysis_run?.completed_at
            ? formatRelative(summary.last_analysis_run.completed_at)
            : '—',
          icon: Sparkles,
          trend: summary.last_analysis_run?.company
            ? {
                text: summary.last_analysis_run.company.display_name,
                positive: true,
              }
            : undefined,
        },
      ]
    : []

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {(isLoading || !summary
        ? Array.from({ length: 4 }).map((_, i) => ({ label: '', value: '', icon: MessageSquareText, key: i }))
        : cards
      ).map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={'key' in card ? `s-${card.key}` : card.label || idx}
            className="bg-white rounded-[12px] p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between">
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <Icon size={16} color="var(--accent)" />
              </div>
              {!isLoading && summary && 'trend' in card && card.trend && (
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    color: card.trend.positive
                      ? 'var(--green)'
                      : 'var(--text-muted)',
                  }}
                >
                  {card.trend.text}
                </span>
              )}
            </div>
            <div className="mt-3">
              {isLoading || !summary ? (
                <Skeleton width={120} height={28} />
              ) : (
                <div className="text-[28px] font-semibold leading-none text-[var(--text-primary)]">
                  {card.value}
                </div>
              )}
              {isLoading || !summary ? (
                <div className="mt-1.5">
                  <Skeleton width={140} height={12} />
                </div>
              ) : (
                <div className="text-[12px] text-[var(--text-muted)] mt-1">
                  {card.label}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
