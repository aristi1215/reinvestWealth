import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import {
  deleteAnalysisRun,
  fetchAnalysisRuns,
  fetchCompanies,
} from '../lib/api'
import { Button } from '../components/shared/Button'
import { CompanyAvatar } from '../components/shared/CompanyAvatar'
import { StatusBadge, type StatusKind } from '../components/shared/StatusBadge'
import { useAnalysisTrigger } from '../hooks/useJobs'
import { formatRelative } from '../lib/utils'
import { PainThemeCard } from '../components/competitors/PainThemeCard'
import { FeatureGapCard } from '../components/competitors/FeatureGapCard'
import { SentimentBreakdown } from '../components/competitors/SentimentBreakdown'
import { CopySuggestionsPanel } from '../components/competitors/CopySuggestionsPanel'
import type {
  AnalysisRun,
  CopySuggestionsResult,
  FeatureGap,
  FullAnalysisResult,
  PainTheme,
  RunType,
  SentimentResult,
} from '../types'
import { toast } from 'sonner'

export const Route = createFileRoute('/analysis')({
  component: AnalysisPage,
})

function AnalysisPage() {
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  })
  const queryClient = useQueryClient()

  const [companySlug, setCompanySlug] = useState('all')
  const [runType, setRunType] = useState<RunType>('full')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [triggering, setTriggering] = useState(false)
  const triggerAnalysis = useAnalysisTrigger()

  const { data: runs } = useQuery({
    queryKey: ['analysis-runs', { status: statusFilter }],
    queryFn: () =>
      fetchAnalysisRuns({
        status: statusFilter || undefined,
      }),
    refetchInterval: 5_000,
  })

  const selectedRun = useMemo(
    () => runs?.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId],
  )

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAnalysisRun(id),
    onSuccess: () => {
      toast.success('Analysis run deleted')
      queryClient.invalidateQueries({ queryKey: ['analysis-runs'] })
      if (selectedRunId) setSelectedRunId(null)
    },
  })

  const totalSelectedRunCount =
    companySlug === 'all'
      ? runType === 'copy_suggestions'
        ? (companies ?? []).filter((c) => !c.is_own_product).length
        : (companies ?? []).length
      : 1

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">
          Analysis
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          Trigger AI analysis runs and inspect their results.
        </p>
      </div>

      <div
        className="bg-white rounded-[12px] p-5"
        style={{
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
          Trigger Analysis
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Company">
            <select
              value={companySlug}
              onChange={(e) => setCompanySlug(e.target.value)}
              className="text-[13px] px-2.5 py-1.5 rounded-md bg-white"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <option value="all">All Companies</option>
              {companies?.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.display_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select
              value={runType}
              onChange={(e) => setRunType(e.target.value as RunType)}
              className="text-[13px] px-2.5 py-1.5 rounded-md bg-white"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <option value="full">Full (all 4)</option>
              <option value="pain_themes">Pain Themes</option>
              <option value="feature_gaps">Feature Gaps</option>
              <option value="sentiment">Sentiment</option>
              <option value="copy_suggestions">Copy Suggestions</option>
            </select>
          </Field>
          <Button
            variant="primary"
            disabled={triggering}
            onClick={async () => {
              setTriggering(true)
              await triggerAnalysis({
                company_slug: companySlug,
                run_type: runType,
                company_label:
                  companySlug === 'all'
                    ? 'All Companies'
                    : companies?.find((c) => c.slug === companySlug)
                        ?.display_name,
              })
              setTriggering(false)
            }}
          >
            {triggering ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            Run Analysis
          </Button>
          <span className="text-[12px] text-[var(--text-muted)] ml-1">
            {runType === 'full' && companySlug === 'all'
              ? 'Full analysis across all companies takes ~3–5 minutes.'
              : `${totalSelectedRunCount} run${totalSelectedRunCount === 1 ? '' : 's'} will be queued.`}
          </span>
        </div>
      </div>

      <div
        className="bg-white rounded-[12px] overflow-hidden"
        style={{
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">
            Runs ({runs?.length ?? 0})
          </p>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[var(--text-muted)] uppercase text-[11px] tracking-wider font-semibold">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[13px] px-2 py-1 rounded-md bg-white"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr
              style={{
                background: 'var(--bg-page)',
                borderBottom: '2px solid var(--border-default)',
              }}
            >
              <Th>Company</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Reviews</Th>
              <Th>Started</Th>
              <Th>Duration</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {runs?.map((run) => (
              <tr
                key={run.id}
                className="cursor-pointer hover:bg-[var(--bg-page)]"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
                onClick={() => setSelectedRunId(run.id)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CompanyAvatar
                      slug={run.company?.slug}
                      name={run.company?.display_name ?? '?'}
                      size={22}
                    />
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                      {run.company?.display_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] capitalize">
                  {run.run_type.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={run.status as StatusKind} />
                </td>
                <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] tabular-nums">
                  {run.reviews_analyzed ?? '—'}
                </td>
                <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] tabular-nums">
                  {formatRelative(run.started_at ?? run.created_at)}
                </td>
                <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] tabular-nums">
                  {durationLabel(run)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRunId(run.id)
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (!run.company) return
                        await triggerAnalysis({
                          company_slug: run.company.slug,
                          run_type: run.run_type,
                          company_label: run.company.display_name,
                        })
                      }}
                    >
                      Re-run
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMut.mutate(run.id)
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {runs?.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-[13px] text-[var(--text-muted)]"
                >
                  No analysis runs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRun && (
        <ResultsDrawer
          run={selectedRun}
          onClose={() => setSelectedRunId(null)}
        />
      )}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
      {children}
    </th>
  )
}

function durationLabel(run: AnalysisRun): string {
  if (run.started_at && run.completed_at) {
    const ms =
      new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()
    return `${Math.round(ms / 100) / 10}s`
  }
  if (run.status === 'running') return 'running…'
  return '—'
}

function ResultsDrawer({
  run,
  onClose,
}: {
  run: AnalysisRun
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-y-0 right-0 w-full md:w-[640px] z-30 bg-white flex flex-col shadow-[var(--shadow-modal)]"
      style={{ borderLeft: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <CompanyAvatar
            slug={run.company?.slug}
            name={run.company?.display_name ?? '?'}
            size={28}
          />
          <div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">
              {run.company?.display_name}
            </p>
            <p className="text-[12px] text-[var(--text-muted)] capitalize">
              {run.run_type.replace(/_/g, ' ')} · {run.model_used}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const blob = new Blob([JSON.stringify(run.result, null, 2)], {
                type: 'application/json',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `analysis-${run.id}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            disabled={!run.result}
          >
            <Download size={12} /> Export JSON
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="overflow-y-auto p-5">
        {run.status !== 'completed' || !run.result ? (
          <div className="text-[13px] text-[var(--text-muted)]">
            {run.status === 'running'
              ? 'Run is in progress…'
              : run.status === 'failed'
                ? `Run failed: ${run.error_message ?? 'unknown error'}`
                : 'No result yet.'}
          </div>
        ) : run.run_type === 'full' ? (
          <FullResults result={run.result as FullAnalysisResult} run={run} />
        ) : run.run_type === 'pain_themes' ? (
          <div>
            {((run.result as { themes: PainTheme[] }).themes ?? []).map((t) => (
              <PainThemeCard
                key={t.label}
                theme={t}
                companySlug={run.company?.slug ?? ''}
              />
            ))}
          </div>
        ) : run.run_type === 'feature_gaps' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {((run.result as { gaps: FeatureGap[] }).gaps ?? []).map((g) => (
              <FeatureGapCard key={g.feature_name} gap={g} />
            ))}
          </div>
        ) : run.run_type === 'sentiment' ? (
          <SentimentBreakdown
            sentiment={run.result as SentimentResult}
            companySlug={run.company?.slug ?? ''}
          />
        ) : (
          <CopySuggestionsPanel result={run.result as CopySuggestionsResult} />
        )}
      </div>
    </div>
  )
}

function FullResults({
  result,
  run,
}: {
  result: FullAnalysisResult
  run: AnalysisRun
}) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Pain Themes">
        {result.pain_themes.themes.map((t) => (
          <PainThemeCard
            key={t.label}
            theme={t}
            companySlug={run.company?.slug ?? ''}
          />
        ))}
      </Section>
      <Section title="Feature Gaps">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.feature_gaps.gaps.map((g) => (
            <FeatureGapCard key={g.feature_name} gap={g} />
          ))}
        </div>
      </Section>
      <Section title="Sentiment">
        <SentimentBreakdown
          sentiment={result.sentiment}
          companySlug={run.company?.slug ?? ''}
        />
      </Section>
      {result.copy_suggestions && (
        <Section title="Copy Suggestions">
          <CopySuggestionsPanel result={result.copy_suggestions} />
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}
