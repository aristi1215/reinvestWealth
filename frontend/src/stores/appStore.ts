import { create } from 'zustand'

export type ActiveJobType = 'scrape' | 'analysis'

export interface ActiveJob {
  id: string
  type: ActiveJobType
  companySlug: string
  label: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: number
}

interface AppState {
  activeJobs: ActiveJob[]
  selectedCompanySlug: string | null
  addJob: (job: ActiveJob) => void
  updateJob: (id: string, patch: Partial<ActiveJob>) => void
  removeJob: (id: string) => void
  setSelectedCompany: (slug: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeJobs: [],
  selectedCompanySlug: null,
  addJob: (job) =>
    set((state) =>
      state.activeJobs.find((j) => j.id === job.id)
        ? state
        : { activeJobs: [...state.activeJobs, job] },
    ),
  updateJob: (id, patch) =>
    set((state) => ({
      activeJobs: state.activeJobs.map((j) =>
        j.id === id ? { ...j, ...patch } : j,
      ),
    })),
  removeJob: (id) =>
    set((state) => ({ activeJobs: state.activeJobs.filter((j) => j.id !== id) })),
  setSelectedCompany: (slug) => set({ selectedCompanySlug: slug }),
}))
