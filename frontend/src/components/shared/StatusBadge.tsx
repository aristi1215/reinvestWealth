import { cn } from '../../lib/utils'

export type StatusKind =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'stale'

const STYLES: Record<StatusKind, { bg: string; text: string; dot?: string }> = {
  pending: { bg: '#F3F4F6', text: '#6B7280' },
  running: { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  completed: { bg: 'var(--green-light)', text: '#065F46' },
  failed: { bg: 'var(--red-light)', text: '#991B1B' },
  stale: { bg: 'var(--amber-light)', text: '#92400E' },
}

const LABELS: Record<StatusKind, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  stale: 'Stale',
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: StatusKind
  label?: string
  className?: string
}) {
  const style = STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold rounded px-2 py-0.5',
        className,
      )}
      style={{ background: style.bg, color: style.text }}
    >
      {style.dot && (
        <span
          className="block w-[6px] h-[6px] rounded-full"
          style={{
            background: style.dot,
            animation: 'status-pulse 1.2s ease-in-out infinite',
          }}
        />
      )}
      {label ?? LABELS[status]}
    </span>
  )
}
