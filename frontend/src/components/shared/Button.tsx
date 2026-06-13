import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border border-transparent',
  secondary:
    'bg-white text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-page)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-page)] border border-transparent',
  danger:
    'bg-[var(--red)] hover:bg-[#dc2626] text-white border border-transparent',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-[12px] rounded-[6px] gap-1',
  md: 'h-9 px-3 text-[13px] rounded-[8px] gap-1.5',
  lg: 'h-10 px-4 text-[13px] rounded-[8px] gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'secondary', size = 'md', children, ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        'btn-press inline-flex items-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
