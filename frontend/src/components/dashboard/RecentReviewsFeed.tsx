import { useState } from 'react'
import { Star, ExternalLink, X } from 'lucide-react'
import type { Review } from '../../types'
import { CompanyAvatar } from '../shared/CompanyAvatar'
import { formatRelative } from '../../lib/utils'

function StarRow({ rating }: { rating: number | null }) {
  const r = rating ?? 0
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--accent)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < Math.round(r) ? 'currentColor' : 'transparent'}
          stroke="currentColor"
        />
      ))}
      <span className="ml-1 text-[var(--text-muted)] text-[11px]">
        {r.toFixed(1)}
      </span>
    </span>
  )
}

export function RecentReviewsFeed({ reviews }: { reviews: Review[] }) {
  const [open, setOpen] = useState<Review | null>(null)
  return (
    <>
      <ul className="flex flex-col">
        {reviews.slice(0, 10).map((review) => (
          <li
            key={review.id}
            className="flex flex-col gap-1.5 px-5 py-3 cursor-pointer hover:bg-[var(--bg-page)] transition-colors duration-[120ms] border-b border-[var(--border-subtle)] last:border-b-0"
            onClick={() => setOpen(review)}
          >
            <div className="flex items-center gap-2">
              <CompanyAvatar
                slug={review.company?.slug}
                name={review.company?.display_name ?? '?'}
                size={20}
              />
              <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                {review.company?.display_name ?? 'Unknown'}
              </span>
              <span
                className="text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
                style={{
                  background: 'var(--bg-page)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                }}
              >
                {review.platform}
              </span>
              <StarRow rating={review.rating} />
              <span className="ml-auto text-[11px] text-[var(--text-muted)]">
                {formatRelative(review.scraped_at)}
              </span>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">
              {review.title ? `${review.title} — ` : ''}
              {review.cons_text || review.pros_text || review.full_text}
            </p>
          </li>
        ))}
      </ul>
      {open && <ReviewModal review={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function ReviewModal({
  review,
  onClose,
}: {
  review: Review
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[12px] max-w-[640px] w-full shadow-[var(--shadow-modal)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CompanyAvatar
              slug={review.company?.slug}
              name={review.company?.display_name ?? '?'}
              size={32}
            />
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                {review.company?.display_name}
              </p>
              <p className="text-[12px] text-[var(--text-muted)]">
                {review.reviewer_name} · {review.reviewer_role} ·{' '}
                {review.review_date}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {review.title && (
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">
              {review.title}
            </h3>
          )}
          <StarRow rating={review.rating} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-[11px] uppercase font-semibold tracking-wide text-[var(--text-muted)] mb-1">
                Pros
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {review.pros_text ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase font-semibold tracking-wide text-[var(--text-muted)] mb-1">
                Cons
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {review.cons_text ?? '—'}
              </p>
            </div>
          </div>
          {review.switched_from && (
            <div className="mt-4 text-[12px] text-[var(--text-muted)] flex items-center gap-1">
              <ExternalLink size={12} />
              Switched from {review.switched_from}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
