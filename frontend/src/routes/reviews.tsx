import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronUp,
  Search,
  Sliders,
  X,
} from 'lucide-react'
import {
  fetchCompanies,
  fetchReviews,
  type ReviewQuery,
} from '../lib/api'
import { Skeleton } from '../components/shared/Skeleton'
import { EmptyState } from '../components/shared/EmptyState'
import { CompanyAvatar } from '../components/shared/CompanyAvatar'
import { Button } from '../components/shared/Button'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/reviews')({
  component: ReviewsPage,
})

const PLATFORMS = ['capterra', 'g2'] as const
const PER_PAGE = 20

function ReviewsPage() {
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  })

  const [filters, setFilters] = useState<{
    companies: string[]
    platforms: string[]
    rating: [number, number]
    hasPros: boolean
    hasCons: boolean
    switchedFrom: string
    search: string
  }>({
    companies: [],
    platforms: [],
    rating: [1, 5],
    hasPros: false,
    hasCons: false,
    switchedFrom: '',
    search: '',
  })
  const [sort, setSort] = useState<ReviewQuery['sort']>('date_desc')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtersActive =
    filters.companies.length > 0 ||
    filters.platforms.length > 0 ||
    filters.rating[0] !== 1 ||
    filters.rating[1] !== 5 ||
    filters.hasPros ||
    filters.hasCons ||
    filters.switchedFrom !== '' ||
    filters.search !== ''

  const query: ReviewQuery = useMemo(
    () => ({
      company_slug: filters.companies.join(',') || undefined,
      platform: filters.platforms.join(',') || undefined,
      rating_min: filters.rating[0],
      rating_max: filters.rating[1],
      has_pros: filters.hasPros || undefined,
      has_cons: filters.hasCons || undefined,
      switched_from: filters.switchedFrom || undefined,
      search: filters.search || undefined,
      sort,
      page,
      per_page: PER_PAGE,
    }),
    [filters, sort, page],
  )

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', query],
    queryFn: () => fetchReviews(query),
    staleTime: 30_000,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">
            Reviews
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            All scraped reviews across companies and platforms.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <aside
          className="w-[260px] shrink-0 bg-white rounded-[12px]"
          style={{
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              <Sliders size={12} /> Filters
              {filtersActive && (
                <span
                  className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                  }}
                >
                  active
                </span>
              )}
            </span>
            {filtersActive && (
              <button
                type="button"
                className="text-[12px] font-semibold text-[var(--accent)]"
                onClick={() =>
                  setFilters({
                    companies: [],
                    platforms: [],
                    rating: [1, 5],
                    hasPros: false,
                    hasCons: false,
                    switchedFrom: '',
                    search: '',
                  })
                }
              >
                Clear all
              </button>
            )}
          </div>

          <FilterGroup label="Search">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                placeholder="Find phrases…"
                className="w-full text-[13px] pl-7 pr-2 py-1.5 rounded-md bg-[var(--bg-page)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                style={{ border: '1px solid var(--border-default)' }}
              />
            </div>
          </FilterGroup>

          <FilterGroup label="Companies">
            <div className="flex flex-col gap-1.5">
              {companies?.map((c) => {
                const checked = filters.companies.includes(c.slug)
                return (
                  <label
                    key={c.slug}
                    className="flex items-center gap-2 text-[13px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setFilters((f) => ({
                          ...f,
                          companies: checked
                            ? f.companies.filter((s) => s !== c.slug)
                            : [...f.companies, c.slug],
                        }))
                      }
                      className="accent-[var(--accent)]"
                    />
                    <CompanyAvatar
                      slug={c.slug}
                      name={c.display_name}
                      size={20}
                    />
                    <span className="text-[var(--text-secondary)]">
                      {c.display_name}
                    </span>
                  </label>
                )
              })}
            </div>
          </FilterGroup>

          <FilterGroup label="Platforms">
            <div className="flex flex-col gap-1.5">
              {PLATFORMS.map((p) => {
                const checked = filters.platforms.includes(p)
                return (
                  <label key={p} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setFilters((f) => ({
                          ...f,
                          platforms: checked
                            ? f.platforms.filter((x) => x !== p)
                            : [...f.platforms, p],
                        }))
                      }
                      className="accent-[var(--accent)]"
                    />
                    <span className="capitalize text-[var(--text-secondary)]">
                      {p}
                    </span>
                  </label>
                )
              })}
            </div>
          </FilterGroup>

          <FilterGroup label={`Rating: ${filters.rating[0]}–${filters.rating[1]}`}>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={5}
                value={filters.rating[0]}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    rating: [
                      Math.min(Number(e.target.value), f.rating[1]),
                      f.rating[1],
                    ],
                  }))
                }
                className="flex-1 accent-[var(--accent)]"
              />
              <input
                type="range"
                min={1}
                max={5}
                value={filters.rating[1]}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    rating: [
                      f.rating[0],
                      Math.max(Number(e.target.value), f.rating[0]),
                    ],
                  }))
                }
                className="flex-1 accent-[var(--accent)]"
              />
            </div>
          </FilterGroup>

          <FilterGroup label="Has text">
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={filters.hasPros}
                onChange={() =>
                  setFilters((f) => ({ ...f, hasPros: !f.hasPros }))
                }
                className="accent-[var(--accent)]"
              />
              <span className="text-[var(--text-secondary)]">Has pros text</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] mt-1.5">
              <input
                type="checkbox"
                checked={filters.hasCons}
                onChange={() =>
                  setFilters((f) => ({ ...f, hasCons: !f.hasCons }))
                }
                className="accent-[var(--accent)]"
              />
              <span className="text-[var(--text-secondary)]">Has cons text</span>
            </label>
          </FilterGroup>

          <FilterGroup label="Switched from">
            <input
              value={filters.switchedFrom}
              onChange={(e) =>
                setFilters((f) => ({ ...f, switchedFrom: e.target.value }))
              }
              placeholder="QuickBooks…"
              className="w-full text-[13px] px-2 py-1.5 rounded-md bg-[var(--bg-page)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{ border: '1px solid var(--border-default)' }}
            />
          </FilterGroup>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[12px] mb-4 px-5 py-3 flex items-center justify-between"
            style={{
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center gap-4 text-[13px] text-[var(--text-secondary)]">
              <span>
                <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                  {data?.total ?? 0}
                </span>{' '}
                reviews
              </span>
              <span>
                Avg rating{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  {data?.stats.average_rating?.toFixed(1) ?? '—'}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                {Object.entries(data?.stats.platform_counts ?? {}).map(([p, c]) => (
                  <span
                    key={p}
                    className="text-[11px] uppercase font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--bg-page)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {p} {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] overflow-hidden"
            style={{
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <table className="w-full">
              <thead>
                <tr style={{
                  background: 'var(--bg-page)',
                  borderBottom: '2px solid var(--border-default)',
                }}>
                  <Th label="Company" sortable={false} />
                  <Th label="Platform" sortable={false} />
                  <Th
                    label="Date"
                    sortable
                    active={sort === 'date_desc' || sort === 'date_asc'}
                    direction={sort === 'date_desc' ? 'desc' : 'asc'}
                    onClick={() =>
                      setSort(sort === 'date_desc' ? 'date_asc' : 'date_desc')
                    }
                  />
                  <Th
                    label="Rating"
                    sortable
                    active={sort === 'rating_desc' || sort === 'rating_asc'}
                    direction={sort === 'rating_desc' ? 'desc' : 'asc'}
                    onClick={() =>
                      setSort(sort === 'rating_desc' ? 'rating_asc' : 'rating_desc')
                    }
                  />
                  <Th label="Reviewer" sortable={false} />
                  <Th label="Title" sortable={false} />
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-5 py-3">
                          <Skeleton width="100%" height={32} />
                        </td>
                      </tr>
                    ))
                  : data?.reviews.length === 0
                    ? (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState
                            icon={Search}
                            title="No reviews match"
                            description="Try clearing some filters or syncing fresh data."
                          />
                        </td>
                      </tr>
                    )
                    : data?.reviews.map((review) => (
                        <ReviewRow
                          key={review.id}
                          review={review}
                          expanded={expandedId === review.id}
                          onToggle={() =>
                            setExpandedId((c) =>
                              c === review.id ? null : review.id,
                            )
                          }
                        />
                      ))}
              </tbody>
            </table>
          </div>

          {data && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-[13px] text-[var(--text-muted)]">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      className="px-4 py-4"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
        {label}
      </p>
      {children}
    </div>
  )
}

function Th({
  label,
  sortable,
  active,
  direction,
  onClick,
}: {
  label: string
  sortable: boolean
  active?: boolean
  direction?: 'asc' | 'desc'
  onClick?: () => void
}) {
  return (
    <th
      className={cn(
        'text-left px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold',
        sortable && 'cursor-pointer select-none',
      )}
      onClick={sortable ? onClick : undefined}
      style={{
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
      }}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortable &&
          (direction === 'desc' ? (
            <ChevronDown size={12} />
          ) : (
            <ChevronUp size={12} />
          ))}
      </span>
    </th>
  )
}

function dotsForRating(rating: number | null): string {
  const r = Math.round(rating ?? 0)
  return '●'.repeat(r) + '○'.repeat(5 - r)
}

function ReviewRow({
  review,
  expanded,
  onToggle,
}: {
  review: import('../types').Review
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr
        className="cursor-pointer transition-colors"
        onClick={onToggle}
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <td className="px-4 py-3 align-middle">
          <div className="flex items-center gap-2">
            <CompanyAvatar
              slug={review.company?.slug}
              name={review.company?.display_name ?? '?'}
              size={24}
            />
            <span className="text-[13px] font-semibold text-[var(--text-primary)]">
              {review.company?.display_name}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 align-middle">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
            {review.platform}
          </span>
        </td>
        <td className="px-4 py-3 align-middle text-[13px] text-[var(--text-secondary)] tabular-nums whitespace-nowrap">
          {review.review_date ?? '—'}
        </td>
        <td className="px-4 py-3 align-middle">
          <span
            className="font-mono-sm text-[13px]"
            style={{ color: 'var(--accent)' }}
          >
            {dotsForRating(review.rating)}
          </span>
          <span className="ml-2 text-[12px] text-[var(--text-muted)]">
            {review.rating?.toFixed(1) ?? '—'}
          </span>
        </td>
        <td className="px-4 py-3 align-middle text-[13px] text-[var(--text-secondary)]">
          {review.reviewer_role ?? '—'}
        </td>
        <td className="px-4 py-3 align-middle">
          <p className="text-[13px] text-[var(--text-primary)] truncate max-w-[420px]">
            {review.title}
          </p>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: 'var(--bg-page)' }}>
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
                  Pros
                </p>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  {review.pros_text ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
                  Cons
                </p>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  {review.cons_text ?? '—'}
                </p>
              </div>
            </div>
            {review.switched_from && (
              <div className="mt-3 text-[12px] text-[var(--text-muted)] flex items-center gap-1.5">
                Switched from{' '}
                <span className="font-semibold text-[var(--text-secondary)]">
                  {review.switched_from}
                </span>
                <span className="opacity-50">·</span>
                <button
                  type="button"
                  className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  onClick={onToggle}
                >
                  <X size={12} className="mr-0.5" />
                  Close
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
