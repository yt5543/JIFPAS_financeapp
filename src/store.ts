import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, Goal, Prep, Snapshot } from './lib/types'
import { SAMPLES } from './lib/samples'
import { DEMO_PREP } from './lib/defaults'
import { isDemo } from './lib/ref'

interface State {
  assets: Asset[]
  goal: Goal
  snapshots: Snapshot[]
  /** v2: 準備モード（資産寿命）の入力。未診断なら null */
  prep: Prep | null
  addAsset: (a: Asset) => void
  updateAsset: (a: Asset) => void
  removeAsset: (id: string) => void
  setGoal: (g: Partial<Goal>) => void
  setPrep: (p: Partial<Prep> | Prep) => void
  clearPrep: () => void
  addSnapshot: (s: Snapshot) => void
  removeSnapshot: (id: string) => void
  loadSample: (key: string) => void
  importData: (data: { assets: Asset[]; goal: Goal; snapshots?: Snapshot[]; prep?: Prep | null }) => void
  reset: () => void
}

const DEFAULT_GOAL: Goal = { currentAge: 35, targetAge: 65, targetAmount: 50_000_000, monthlyContribution: 0 }

const creator =
  (initialPrep: Prep | null): StateCreator<State> =>
  (set) => ({
    assets: [],
    goal: DEFAULT_GOAL,
    snapshots: [],
    prep: initialPrep,
    addAsset: (a) => set((s) => ({ assets: [...s.assets, a] })),
    updateAsset: (a) => set((s) => ({ assets: s.assets.map((x) => (x.id === a.id ? a : x)) })),
    removeAsset: (id) => set((s) => ({ assets: s.assets.filter((x) => x.id !== id) })),
    setGoal: (g) => set((s) => ({ goal: { ...s.goal, ...g } })),
    setPrep: (p) => set((s) => ({ prep: s.prep ? { ...s.prep, ...p } : (p as Prep) })),
    clearPrep: () => set({ prep: null }),
    addSnapshot: (snap) => set((s) => ({ snapshots: [snap, ...s.snapshots] })),
    removeSnapshot: (id) => set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== id) })),
    loadSample: (key) => {
      const sample = SAMPLES.find((x) => x.key === key)
      if (!sample) return
      set({ assets: sample.assets.map((a) => ({ ...a })), goal: { ...sample.goal }, snapshots: [] })
    },
    importData: (data) => set({ assets: data.assets, goal: data.goal, snapshots: data.snapshots ?? [], prep: data.prep ?? null }),
    reset: () => set({ assets: [], goal: DEFAULT_GOAL, snapshots: [], prep: null }),
  })

/** デモモード（?demo=1）では保存しない。案内人の端末に家主のデータが残る経路を作らない */
export const DEMO = isDemo()

export const useStore = DEMO
  ? create<State>()(creator(DEMO_PREP))
  : create<State>()(persist(creator(null), { name: 'mieruka-v1' }))
