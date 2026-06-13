import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import type { DashboardSummary, SentimentResult } from '../../types'
import { CompanyAvatar } from '../shared/CompanyAvatar'
import { companyColor } from '../../lib/utils'

const DIMENSIONS = [
  'Ease of Use',
  'Value for Money',
  'Customer Support',
  'Features',
  'Reliability',
] as const

function pickAspectScore(
  positive: SentimentResult['positive_aspects'],
  negative: SentimentResult['negative_aspects'],
  keywords: string[],
): number {
  const ratio =
    (positive.reduce((a, b) => a + b.frequency_pct, 0) +
      keywords.length * 5) /
    Math.max(
      1,
      negative.reduce((a, b) => a + b.frequency_pct, 0) + 1,
    )
  return Math.min(100, Math.max(20, ratio * 6))
}

function buildScores(
  sentiment: SentimentResult | undefined,
): Record<(typeof DIMENSIONS)[number], number> {
  const base = pickAspectScore(
    sentiment?.positive_aspects ?? [],
    sentiment?.negative_aspects ?? [],
    sentiment?.emotional_keywords ?? [],
  )
  const score = (label: string): number => {
    const positive =
      sentiment?.positive_aspects.find((a) =>
        a.aspect.toLowerCase().includes(label.toLowerCase().split(' ')[0]),
      )?.frequency_pct ?? 0
    const negative =
      sentiment?.negative_aspects.find((a) =>
        a.aspect.toLowerCase().includes(label.toLowerCase().split(' ')[0]),
      )?.frequency_pct ?? 0
    return Math.max(15, Math.min(100, base + positive - negative * 1.6))
  }

  return {
    'Ease of Use': score('Ease'),
    'Value for Money': score('Value') || score('Pricing'),
    'Customer Support': score('Support'),
    Features: score('Features'),
    Reliability: score('Reliability') || score('reliable'),
  } as Record<(typeof DIMENSIONS)[number], number>
}

export function SentimentRadar({ summary }: { summary?: DashboardSummary }) {
  const own = summary?.per_company.find((p) => p.company.is_own_product)
  const competitor = summary?.per_company.find(
    (p) => p.company.slug === 'quickbooks',
  )
  const ownSentiment = own?.latest_runs.sentiment?.result as
    | SentimentResult
    | undefined
  const compSentiment = competitor?.latest_runs.sentiment?.result as
    | SentimentResult
    | undefined

  const ownScores = buildScores(ownSentiment)
  const compScores = buildScores(compSentiment)

  const data = DIMENSIONS.map((dim) => ({
    dimension: dim,
    own: ownScores[dim],
    competitor: compScores[dim],
  }))

  return (
    <div className="flex flex-col" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} outerRadius={70}>
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            axisLine={false}
            tick={false}
          />
          <Radar
            name={own?.company.display_name ?? 'You'}
            dataKey="own"
            stroke={companyColor('reinvestwealth')}
            fill={companyColor('reinvestwealth')}
            fillOpacity={0.3}
            strokeWidth={1.5}
          />
          <Radar
            name={competitor?.company.display_name ?? 'Top Competitor'}
            dataKey="competitor"
            stroke="#6B7280"
            fill="#6B7280"
            fillOpacity={0.18}
            strokeWidth={1.2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-5 text-[12px] mt-2">
        {own && (
          <div className="flex items-center gap-1.5">
            <CompanyAvatar
              slug={own.company.slug}
              name={own.company.display_name}
              size={20}
            />
            <span className="text-[var(--text-secondary)]">
              {own.company.display_name}
            </span>
          </div>
        )}
        {competitor && (
          <div className="flex items-center gap-1.5">
            <CompanyAvatar
              slug={competitor.company.slug}
              name={competitor.company.display_name}
              size={20}
            />
            <span className="text-[var(--text-secondary)]">
              {competitor.company.display_name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
