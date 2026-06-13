import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  width?: number | string
  height?: number | string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

const radiusMap: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '10px',
  full: '999px',
}

export function Skeleton({
  className,
  width,
  height = 14,
  rounded = 'md',
}: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{
        width,
        height,
        borderRadius: radiusMap[rounded],
      }}
    />
  )
}
