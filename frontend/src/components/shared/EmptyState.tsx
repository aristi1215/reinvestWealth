import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      <Icon size={48} color="var(--border-default)" strokeWidth={1.5} />
      <p className="mt-3 text-[14px] font-semibold text-[var(--text-primary)]">
        {title}
      </p>
      {description && (
        <p
          className="mt-1 text-[12px] text-[var(--text-muted)] max-w-[260px] leading-snug"
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
