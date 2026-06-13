import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts'
import type { SentimentResult } from '../../types'

export function SentimentBreakdown({
  sentiment,
  companySlug: _companySlug,
}: {
  sentiment: SentimentResult
  companySlug: string
}) {
  const score = sentiment.nps_estimate
  const positivePct = Math.round(
    sentiment.positive_aspects.reduce((a, b) => a + b.frequency_pct, 0),
  )
  const negativePct = Math.round(
    sentiment.negative_aspects.reduce((a, b) => a + b.frequency_pct, 0),
  )
  const total = Math.max(1, positivePct + negativePct)
  const positiveShare = Math.round((positivePct / total) * 100)
  const negativeShare = Math.round((negativePct / total) * 100)
  const mixedShare = Math.max(0, 100 - positiveShare - negativeShare)

  const data = [
    { name: 'Positive', value: positiveShare, color: 'var(--green)' },
    { name: 'Mixed', value: mixedShare, color: 'var(--amber)' },
    { name: 'Negative', value: negativeShare, color: 'var(--red)' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-[12px] p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">
          Sentiment distribution
        </h3>
        <div style={{ width: '100%', height: 220, position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={2}
                stroke="white"
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ transform: 'translateY(-2px)' }}
          >
            <div className="text-[24px] font-semibold text-[var(--text-primary)] tabular-nums leading-none">
              {score}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">
              Est. NPS
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-[12px] mt-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-sm"
                style={{ background: d.color }}
              />
              <span className="text-[var(--text-secondary)]">{d.name}</span>
            </div>
          ))}
        </div>
        <NpsGauge value={score} />
      </div>

      <div className="grid grid-rows-2 gap-4">
        <AspectList
          title="Users love"
          aspects={sentiment.positive_aspects}
          color="var(--green)"
        />
        <AspectList
          title="Users hate"
          aspects={sentiment.negative_aspects}
          color="var(--red)"
        />
      </div>

      <div className="md:col-span-2 bg-white rounded-[12px] p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">
          Emotional keywords
        </h3>
        <div className="flex flex-wrap gap-2 items-baseline">
          {sentiment.emotional_keywords.map((kw, i) => {
            const size = 13 + ((sentiment.emotional_keywords.length - i) * 2)
            return (
              <span
                key={kw}
                style={{
                  fontSize: Math.max(13, Math.min(28, size)),
                  color: i % 2 === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: i < 3 ? 600 : 500,
                }}
              >
                {kw}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AspectList({
  title,
  aspects,
  color,
}: {
  title: string
  aspects: { aspect: string; frequency_pct: number }[]
  color: string
}) {
  return (
    <div className="bg-white rounded-[12px] p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)] flex flex-col">
      <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-3">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {aspects.map((a) => (
          <li key={a.aspect} className="flex items-center gap-3">
            <span className="text-[13px] text-[var(--text-secondary)] flex-1 min-w-0 truncate">
              {a.aspect}
            </span>
            <div
              className="h-1 rounded-[2px] w-[120px]"
              style={{ background: 'var(--border-subtle)' }}
            >
              <div
                className="h-full rounded-[2px]"
                style={{
                  width: `${Math.min(100, a.frequency_pct)}%`,
                  background: color,
                }}
              />
            </div>
            <span className="text-[12px] font-semibold text-[var(--text-muted)] tabular-nums w-9 text-right">
              {a.frequency_pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NpsGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  const angle = (clamped / 100) * 180 - 90
  const color =
    clamped > 50 ? 'var(--green)' : clamped >= 30 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="mt-2 flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 251.3}, 1000`}
        />
        <line
          x1="90"
          y1="90"
          x2={90 + Math.cos((angle * Math.PI) / 180) * 70}
          y2={90 + Math.sin((angle * Math.PI) / 180) * 70}
          stroke="var(--text-primary)"
          strokeWidth="2"
        />
        <circle cx="90" cy="90" r="4" fill="var(--text-primary)" />
      </svg>
    </div>
  )
}
