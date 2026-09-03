import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, Goal, Snapshot } from './lib/types'
import { SAMPLES } from './lib/samples'

interface State {
  assets: Asset[]
  goal: Goal
  snapshots: Snapshot[]
  addAsset: (a: Asset) => void
  updateAsset: (a: Asset) => void
  removeAsset: (id: string) => void
  setGoal: (g: Partial<Goal>) => void
  addSnapshot: (s: Snapshot) => void
  removeSnapshot: (id: string) => void
  loadSample: (key: string) => void
  importData: (data: { assets: Asset[]; goal: Goal; snapshots?: Snapshot[] }) => void
  reset: () => void
}

const DEFAULT_GOAL: Goal = { currentAge: 35, targetAge: 65, targetAmount: 50_000_000, monthlyContribution: 0 }

export const useStore = create<State>()(
  persist(
    (set) => ({
      assets: [],
      goal: DEFAULT_GOAL,
      snapshots: [],
      addAsset: (a) => set((s) => ({ assets: [...s.assets, a] })),
      updateAsset: (a) => set((s) => ({ assets: s.assets.map((x) => (x.id === a.id ? a : x)) })),
      removeAsset: (id) => set((s) => ({ assets: s.assets.filter((x) => x.id !== id) })),
      setGoal: (g) => set((s) => ({ goal: { ...s.goal, ...g } })),
      addSnapshot: (snap) => set((s) => ({ snapshots: [snap, ...s.snapshots] })),
      removeSnapshot: (id) => set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== id) })),
      loadSample: (key) => {
        const sample = SAMPLES.find((x) => x.key === key)
        if (!sample) return
        set({ assets: sample.assets.map((a) => ({ ...a })), goal: { ...sample.goal }, snapshots: [] })
      },
      importData: (data) => set({ assets: data.assets, goal: data.goal, snapshots: data.snapshots ?? [] }),
      reset: () => set({ assets: [], goal: DEFAULT_GOAL, snapshots: [] }),
    }),
    { name: 'mieruka-v1' },
  ),
)
