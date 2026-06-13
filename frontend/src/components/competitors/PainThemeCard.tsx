import { Zap } from 'lucide-react'
import {
  companyColor,
  severityClasses,
  rgba,
} from '../../lib/utils'
import type { PainTheme } from '../../types'

interface PainThemeCardProps {
  theme: PainTheme
  companySlug: string
  showOpportunity?: boolean
}

export function PainThemeCard({
  theme,
  companySlug,
  showOpportunity,
}: PainThemeCardProps) {
  const colors = severityClasses(theme.severity)
  const barColor = companyColor(companySlug)
  return (
    <div
      className="bg-white rounded-[12px] p-5 mb-3"
      style={{
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">
          {theme.label}
        </h3>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded shrink-0"
          style={{
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          severity {theme.severity}/10
        </span>
      </div>
      <p className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
        {theme.description}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          Frequency
        </span>
        <div
          className="flex-1 h-1 rounded-[2px]"
          style={{ background: 'var(--border-subtle)' }}
        >
          <div
            className="h-full rounded-[2px]"
            style={{
              width: `${Math.min(100, theme.frequency_pct)}%`,
              background: barColor,
            }}
          />
        </div>
        <span className="text-[12px] font-semibold text-[var(--text-muted)] tabular-nums">
          {theme.frequency_pct}%
        </span>
      </div>

      {theme.verbatim_phrases.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5">
          {theme.verbatim_phrases.map((phrase, i) => (
            <span
              key={i}
              className="font-mono-sm px-2.5 py-1.5 rounded-md text-[var(--text-secondary)] inline-block"
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-default)',
              }}
            >
              "{phrase}"
            </span>
          ))}
        </div>
      )}

      {showOpportunity && (
        <div className="mt-4">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              border: `1px solid ${rgba('#6366F1', 0.2)}`,
            }}
          >
            <Zap size={12} /> ReInvestWealth Opportunity
          </span>
        </div>
      )}
    </div>
  )
}
