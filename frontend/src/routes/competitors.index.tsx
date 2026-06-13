import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchDashboardSummary } from '../lib/api'
import { CompetitorCard } from '../components/competitors/CompetitorCard'
import { Skeleton } from '../components/shared/Skeleton'

export const Route = createFileRoute('/competitors/')({
  component: CompetitorsPage,
})

function CompetitorsPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60_000,
  })

  return (
    <div className="flex flex-col gap-6 max-w-[1280px]">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">
          Competitors
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          ReInvestWealth and 4 core competitors. Click a card for the full
          analysis.
        </p>
      </div>

      {isLoading || !summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={220} rounded="lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.per_company.map((entry) => (
            <CompetitorCard
              key={entry.company.id}
              company={{
                ...entry.company,
                review_count: entry.review_count,
                average_rating: entry.average_rating,
              }}
              painThemesRun={entry.latest_runs.pain_themes}
              latestRunsByType={entry.latest_runs}
              platforms={['capterra', 'g2'].filter(
                (p) =>
                  entry.company.slug !== 'reinvestwealth' || p === 'capterra' || p === 'g2',
              )}
              lastScrapedAt={entry.last_scraped_at}
            />
          ))}
        </div>
      )}
    </div>
  )
}
