import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Building2,
  MessageSquareText,
  Sparkles,
  CalendarRange,
  Hexagon,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCompanies } from '../../lib/api'
import { useAppStore } from '../../stores/appStore'
import { formatRelative } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/competitors', label: 'Competitors', icon: Building2 },
  { to: '/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/analysis', label: 'Analysis', icon: Sparkles },
  { to: '/digest', label: 'Digest', icon: CalendarRange },
] as const

export function Sidebar() {
  const router = useRouterState()
  const pathname = router.location.pathname
  const activeJobs = useAppStore((s) => s.activeJobs)

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    staleTime: 60_000,
  })

  const lastSync = companies
    ?.map((c) => c.last_scraped_at)
    .filter((s): s is string => Boolean(s))
    .sort()
    .at(-1)

  return (
    <aside
      className="w-[240px] shrink-0 h-screen sticky top-0 flex flex-col"
      style={{
        background: 'var(--bg-sidebar)',
        color: 'var(--text-sidebar)',
        borderRight: '1px solid var(--border-sidebar)',
      }}
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <Hexagon
          size={22}
          className="text-white"
          fill="var(--accent)"
          strokeWidth={1.5}
        />
        <span className="text-white text-[16px] font-semibold tracking-tight">
          Rival IQ
        </span>
      </div>

      <SectionLabel>Intelligence</SectionLabel>
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.to === '/'
              ? pathname === '/'
              : pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center text-[13px] h-9 pl-4 pr-3 transition-colors duration-[80ms]"
              style={{
                background: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = 'var(--bg-sidebar-hover)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <item.icon
                size={16}
                className="mr-2.5 shrink-0"
                strokeWidth={1.8}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <SectionLabel>Monitoring</SectionLabel>
      <div
        className="px-5 mt-auto pt-3 pb-5 flex flex-col gap-2 text-[12px]"
        style={{ borderTop: '1px solid var(--border-sidebar)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--green)' }}
          />
          <span>{companies?.length ?? 5} companies</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] opacity-80">
          <RefreshCw size={12} />
          <span>Synced {lastSync ? formatRelative(lastSync) : '—'}</span>
        </div>
        {activeJobs.length > 0 && (
          <div
            className="mt-1 inline-flex items-center gap-2 px-2 py-1 rounded-md"
            style={{ background: 'var(--bg-sidebar-active)' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--amber)',
                animation: 'status-pulse 1.2s ease-in-out infinite',
              }}
            />
            <Activity size={12} className="text-white" />
            <span className="text-white">
              {activeJobs.length} job{activeJobs.length === 1 ? '' : 's'} running
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      className="text-[10px] font-semibold tracking-widest uppercase opacity-40 text-white px-4 mt-6 mb-1"
    >
      {children}
    </div>
  )
}
