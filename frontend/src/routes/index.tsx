import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardBody, CardHeader } from '../components/shared/Card'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { CompanyRatingChart } from '../components/dashboard/CompanyRatingChart'
import { SentimentRadar } from '../components/dashboard/SentimentRadar'
import { RecentReviewsFeed } from '../components/dashboard/RecentReviewsFeed'
import { fetchDashboardSummary } from '../lib/api'
import { Skeleton } from '../components/shared/Skeleton'
import { Sparkles, TrendingUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60_000,
  })

  return (
    <div className="flex flex-col gap-6 max-w-[1280px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">
            Competitive Intelligence
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            Live signal across ReInvestWealth and the four core competitors.
          </p>
        </div>
        <Link
          to="/digest"
          className="text-[13px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
        >
          View weekly digest →
        </Link>
      </div>

      <SummaryCards summary={summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" interactive={false}>
          <CardHeader
            title="Average rating by company"
            subtitle="Across Capterra and G2"
            divider
            action={
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] flex items-center gap-1">
                <TrendingUp size={12} /> Live
              </span>
            }
          />
          <CardBody>
            {isLoading ? (
              <Skeleton width="100%" height={220} />
            ) : (
              <CompanyRatingChart summary={summary} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Sentiment radar"
            subtitle="ReInvestWealth vs QuickBooks"
            divider
            action={
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] flex items-center gap-1">
                <Sparkles size={12} /> AI
              </span>
            }
          />
          <CardBody>
            {isLoading ? (
              <Skeleton width="100%" height={220} />
            ) : (
              <SentimentRadar summary={summary} />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent reviews"
          subtitle="Most recently scraped across all platforms"
          divider
        />
        {isLoading ? (
          <div className="px-5 pb-5 flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width="100%" height={48} />
            ))}
          </div>
        ) : (
          <RecentReviewsFeed reviews={summary?.recent_reviews ?? []} />
        )}
      </Card>
    </div>
  )
}
