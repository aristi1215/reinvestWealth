import type { FeatureGap } from '../../types'
import { complexityClasses } from '../../lib/utils'

function opportunityColor(score: number): { bg: string; text: string } {
  if (score >= 8) return { bg: 'var(--green-light)', text: '#065F46' }
  if (score >= 5) return { bg: 'var(--amber-light)', text: '#92400E' }
  return { bg: 'var(--red-light)', text: '#991B1B' }
}

export function FeatureGapCard({ gap }: { gap: FeatureGap }) {
  const opp = opportunityColor(gap.opportunity_score)
  const complexity = complexityClasses(gap.complexity)
  const demandPct = Math.min(100, gap.demand_count * 5)

  return (
    <div
      className="bg-white rounded-[12px] p-5 flex flex-col"
      style={{
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">
          {gap.feature_name}
        </h3>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold tabular-nums shrink-0"
          style={{ background: opp.bg, color: opp.text }}
        >
          {gap.opportunity_score}
        </div>
      </div>

      <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
        {gap.description}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          Demand
        </span>
        <div
          className="flex-1 h-1 rounded-[2px]"
          style={{ background: 'var(--border-subtle)' }}
        >
          <div
            className="h-full rounded-[2px]"
            style={{
              width: `${demandPct}%`,
              background: 'var(--accent)',
            }}
          />
        </div>
        <span className="text-[12px] font-semibold text-[var(--text-muted)] tabular-nums">
          {gap.demand_count} reviews
        </span>
      </div>

      <div className="mt-4">
        <span
          className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded"
          style={{
            background: complexity.bg,
            color: complexity.text,
            border: `1px solid ${complexity.border}`,
          }}
        >
          {complexity.label}
        </span>
      </div>
    </div>
  )
}
