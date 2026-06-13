import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { RefreshCw, Sparkles, Activity, X, Loader2 } from 'lucide-react'
import { Button } from '../shared/Button'
import { useAppStore } from '../../stores/appStore'
import { useAnalysisTrigger, useScrapeTrigger } from '../../hooks/useJobs'

const NAV_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/competitors': 'Competitors',
  '/reviews': 'Reviews',
  '/analysis': 'Analysis',
  '/digest': 'Digest',
}

function getBreadcrumb(pathname: string): { parent: string; current: string } {
  if (NAV_LABELS[pathname]) {
    return { parent: 'Rival IQ', current: NAV_LABELS[pathname] }
  }
  if (pathname.startsWith('/competitors/')) {
    return { parent: 'Competitors', current: 'Detail' }
  }
  return { parent: 'Rival IQ', current: 'Page' }
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const breadcrumb = getBreadcrumb(pathname)
  const activeJobs = useAppStore((s) => s.activeJobs)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const triggerScrape = useScrapeTrigger()
  const triggerAnalysis = useAnalysisTrigger()
  const [scraping, setScraping] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  return (
    <header
      className="h-[56px] flex items-center justify-between px-6 bg-white sticky top-0 z-10"
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[var(--text-muted)]">{breadcrumb.parent}</span>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="text-[var(--text-primary)] font-semibold">
          {breadcrumb.current}
        </span>
      </div>

      <div className="flex items-center gap-3 relative">
        {activeJobs.length > 0 && (
          <button
            type="button"
            onClick={() => setPopoverOpen((v) => !v)}
            className="flex items-center gap-2 h-8 px-2.5 rounded-md text-[12px] btn-press"
            style={{ background: 'var(--amber-light)', color: '#92400E' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--amber)',
                animation: 'status-pulse 1.2s ease-in-out infinite',
              }}
            />
            {activeJobs.length} running
          </button>
        )}
        {popoverOpen && (
          <div
            className="absolute right-[180px] top-12 w-[300px] z-20"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)]">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Active Jobs
              </span>
              <button
                type="button"
                onClick={() => setPopoverOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <ul className="max-h-[300px] overflow-y-auto">
              {activeJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between px-3 py-2 text-[12px] border-b border-[var(--border-subtle)] last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="text-[var(--text-primary)] font-semibold">
                      {job.label}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {job.type === 'scrape' ? 'Scrape' : 'Analysis'} · {job.status}
                    </span>
                  </div>
                  <Loader2
                    size={14}
                    className="animate-spin text-[var(--text-muted)]"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button
          size="md"
          variant="secondary"
          disabled={scraping}
          onClick={async () => {
            setScraping(true)
            try {
              await triggerScrape({ company_slug: 'all', platform: 'all' })
            } finally {
              setScraping(false)
            }
          }}
        >
          {scraping ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Sync
        </Button>
        <Button
          size="md"
          variant="primary"
          disabled={analyzing}
          onClick={async () => {
            setAnalyzing(true)
            try {
              await triggerAnalysis({ company_slug: 'all', run_type: 'full' })
            } finally {
              setAnalyzing(false)
            }
          }}
        >
          {analyzing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Sparkles size={14} />
            </>
          )}
          Analyze All
        </Button>
        {activeJobs.length === 0 && (
          <span className="hidden md:flex items-center gap-1 text-[11px] text-[var(--text-muted)] ml-1">
            <Activity size={12} />
            Idle
          </span>
        )}
      </div>
    </header>
  )
}
