import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  noBorder?: boolean
}

export function Card({
  className,
  interactive,
  noBorder,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-card)] rounded-[12px]',
        !noBorder && 'border border-[var(--border-default)]',
        interactive && 'transition-shadow duration-[120ms] hover:shadow-[var(--shadow-card-hover)]',
        'shadow-[var(--shadow-card)]',
        className,
      )}
      {...props}
    />
  )
}

interface CardHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  divider?: boolean
  className?: string
}

export function CardHeader({
  title,
  subtitle,
  action,
  divider,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between px-5 pt-4 pb-3',
        divider && 'border-b border-[var(--border-subtle)] mb-3',
        className,
      )}
    >
      <div>
        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}
