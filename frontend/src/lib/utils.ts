import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const COMPANY_COLORS: Record<string, string> = {
  reinvestwealth: '#6366F1',
  quickbooks: '#2CA01C',
  freshbooks: '#1CAFF0',
  wave: '#0A2C6D',
  xero: '#1AB4D7',
}

const FALLBACK_COLOR = '#6B7280'

export function companyColor(slug?: string | null): string {
  if (!slug) return FALLBACK_COLOR
  return COMPANY_COLORS[slug] ?? FALLBACK_COLOR
}

export function rgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '')
  const bigint = parseInt(cleaned, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function companyInitials(name: string): string {
  if (!name) return '?'
  const parts = name.split(/[\s-]+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const diff = Date.now() - then
  const min = 60_000
  const hour = 60 * min
  const day = 24 * hour
  if (diff < min) return 'just now'
  if (diff < hour) return `${Math.round(diff / min)}m ago`
  if (diff < day) return `${Math.round(diff / hour)}h ago`
  if (diff < 30 * day) return `${Math.round(diff / day)}d ago`
  const months = Math.round(diff / (30 * day))
  if (months < 12) return `${months}mo ago`
  return `${Math.round(months / 12)}y ago`
}

export function isStale(iso: string | null | undefined, days = 7): boolean {
  if (!iso) return true
  return Date.now() - new Date(iso).getTime() > days * 24 * 60 * 60 * 1000
}

export function severityBucket(severity: number): 'high' | 'medium' | 'low' {
  if (severity >= 8) return 'high'
  if (severity >= 5) return 'medium'
  return 'low'
}

export function severityClasses(severity: number): {
  bg: string
  text: string
  border: string
} {
  const bucket = severityBucket(severity)
  if (bucket === 'high')
    return {
      bg: 'rgba(239, 68, 68, 0.10)',
      text: '#991B1B',
      border: 'rgba(239, 68, 68, 0.20)',
    }
  if (bucket === 'medium')
    return {
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#92400E',
      border: 'rgba(245, 158, 11, 0.25)',
    }
  return {
    bg: 'rgba(16, 185, 129, 0.10)',
    text: '#065F46',
    border: 'rgba(16, 185, 129, 0.20)',
  }
}

export function complexityClasses(
  complexity: 'quick_win' | 'medium' | 'complex',
): { bg: string; text: string; border: string; label: string } {
  if (complexity === 'quick_win')
    return {
      bg: 'rgba(16,185,129,0.10)',
      text: '#065F46',
      border: 'rgba(16,185,129,0.25)',
      label: 'Quick Win',
    }
  if (complexity === 'complex')
    return {
      bg: 'rgba(239,68,68,0.10)',
      text: '#991B1B',
      border: 'rgba(239,68,68,0.25)',
      label: 'Complex',
    }
  return {
    bg: 'rgba(245,158,11,0.12)',
    text: '#92400E',
    border: 'rgba(245,158,11,0.25)',
    label: 'Medium',
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
