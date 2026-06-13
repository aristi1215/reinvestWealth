import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { useJobsPoller } from '../hooks/useJobs'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  useJobsPoller()
  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
