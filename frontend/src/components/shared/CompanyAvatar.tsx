import { companyColor, companyInitials, rgba } from '../../lib/utils'

interface CompanyAvatarProps {
  slug?: string | null
  name: string
  size?: number
  className?: string
}

export function CompanyAvatar({
  slug,
  name,
  size = 24,
  className,
}: CompanyAvatarProps) {
  const color = companyColor(slug)
  const fontSize = size <= 28 ? 11 : size <= 40 ? 13 : 16
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: rgba(color, 0.15),
        color,
        fontSize,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {companyInitials(name)}
    </span>
  )
}
