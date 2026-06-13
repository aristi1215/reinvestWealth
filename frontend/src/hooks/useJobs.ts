import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchAnalysisRun,
  fetchScrapeJob,
  triggerAnalysis,
  triggerScrape,
} from '../lib/api'
import { useAppStore } from '../stores/appStore'
import type { ScrapeJob, AnalysisRun, RunType } from '../types'

const POLL_INTERVAL = 2500

export function useJobsPoller() {
  const activeJobs = useAppStore((s) => s.activeJobs)
  const updateJob = useAppStore((s) => s.updateJob)
  const removeJob = useAppStore((s) => s.removeJob)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (activeJobs.length === 0) return
    let cancelled = false

    const tick = async () => {
      for (const job of activeJobs) {
        try {
          if (job.type === 'scrape') {
            const data = await fetchScrapeJob(job.id)
            if (cancelled) return
            updateJob(job.id, { status: data.status })
            if (data.status === 'completed') {
              toast.success(
                `Scraped ${data.reviews_scraped} reviews from ${data.company?.display_name ?? job.companySlug}`,
              )
              removeJob(job.id)
              queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
              queryClient.invalidateQueries({ queryKey: ['companies'] })
              queryClient.invalidateQueries({ queryKey: ['reviews'] })
              queryClient.invalidateQueries({ queryKey: ['scrape-jobs'] })
            } else if (data.status === 'failed') {
              toast.error(
                `Scrape failed for ${data.company?.display_name ?? job.companySlug}: ${data.error_message ?? 'Unknown error'}`,
              )
              removeJob(job.id)
              queryClient.invalidateQueries({ queryKey: ['scrape-jobs'] })
            }
          } else {
            const data = await fetchAnalysisRun(job.id)
            if (cancelled) return
            updateJob(job.id, { status: data.status })
            if (data.status === 'completed') {
              toast.success(
                `Analysis ready for ${data.company?.display_name ?? job.companySlug}`,
              )
              removeJob(job.id)
              queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
              queryClient.invalidateQueries({ queryKey: ['analysis-runs'] })
              queryClient.invalidateQueries({ queryKey: ['company', data.company?.slug] })
            } else if (data.status === 'failed') {
              toast.error(
                `Analysis failed for ${data.company?.display_name ?? job.companySlug}: ${data.error_message ?? 'Unknown error'}`,
              )
              removeJob(job.id)
              queryClient.invalidateQueries({ queryKey: ['analysis-runs'] })
            }
          }
        } catch {
          // Network or fetch error — leave job in place; will retry on next tick
        }
      }
    }

    const handle = window.setInterval(tick, POLL_INTERVAL)
    void tick()
    return () => {
      cancelled = true
      window.clearInterval(handle)
    }
  }, [activeJobs, updateJob, removeJob, queryClient])
}

export function useScrapeTrigger() {
  const addJob = useAppStore((s) => s.addJob)
  const queryClient = useQueryClient()

  return async (input: {
    company_slug: string
    platform: 'capterra' | 'g2' | 'all'
    company_label?: string
  }) => {
    try {
      const data = await triggerScrape(input)
      const jobs: ScrapeJob[] = data.job
        ? [data.job]
        : data.jobs ?? []
      jobs.forEach((j) => {
        addJob({
          id: j.id,
          type: 'scrape',
          companySlug: j.company?.slug ?? input.company_slug,
          label: `${j.company?.display_name ?? input.company_label ?? 'Company'} · ${j.platform}`,
          status: j.status,
          startedAt: Date.now(),
        })
      })
      toast.message(
        input.company_slug === 'all'
          ? `Scraping all companies (${jobs.length} jobs)…`
          : `Scraping ${input.company_label ?? input.company_slug}…`,
      )
      queryClient.invalidateQueries({ queryKey: ['scrape-jobs'] })
      return jobs
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scrape trigger failed'
      toast.error(message)
      return []
    }
  }
}

export function useAnalysisTrigger() {
  const addJob = useAppStore((s) => s.addJob)
  const queryClient = useQueryClient()
  return async (input: {
    company_slug: string
    run_type: RunType
    company_label?: string
  }) => {
    try {
      const data = await triggerAnalysis(input)
      const runs: AnalysisRun[] = data.run ? [data.run] : data.runs ?? []
      runs.forEach((r) => {
        addJob({
          id: r.id,
          type: 'analysis',
          companySlug: r.company?.slug ?? input.company_slug,
          label: `${r.company?.display_name ?? input.company_label ?? 'Company'} · ${r.run_type}`,
          status: r.status,
          startedAt: Date.now(),
        })
      })
      toast.message(
        input.company_slug === 'all'
          ? `Running ${input.run_type} for all companies…`
          : `Running ${input.run_type} for ${input.company_label ?? input.company_slug}…`,
      )
      queryClient.invalidateQueries({ queryKey: ['analysis-runs'] })
      return runs
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis trigger failed'
      toast.error(message)
      return []
    }
  }
}
