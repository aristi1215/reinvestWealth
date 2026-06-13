import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts'
import { companyColor } from '../../lib/utils'
import type { DashboardSummary } from '../../types'

export function CompanyRatingChart({ summary }: { summary?: DashboardSummary }) {
  if (!summary) return null
  const data = summary.per_company
    .map((entry) => ({
      slug: entry.company.slug,
      name: entry.company.display_name,
      rating: entry.average_rating ?? 0,
      isOwn: entry.company.is_own_product,
    }))
    .sort((a, b) => b.rating - a.rating)

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 32, left: 0, bottom: 0 }}
          barCategoryGap={12}
        >
          <CartesianGrid horizontal={false} stroke="var(--border-subtle)" />
          <XAxis
            type="number"
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            stroke="var(--text-muted)"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={140}
            stroke="var(--text-muted)"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="rating" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.slug}
                fill={companyColor(entry.slug)}
                fillOpacity={entry.isOwn ? 1 : 0.7}
              />
            ))}
            <LabelList
              dataKey="rating"
              position="right"
              formatter={(v: unknown) => (typeof v === 'number' ? v.toFixed(1) : '')}
              style={{
                fill: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
