import { create } from 'zustand'

type AppState = {
  // Add shared app state here
}

export const useAppStore = create<AppState>()(() => ({}))
