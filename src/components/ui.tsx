import type { ReactNode } from 'react'
import type { ReturnLevel } from '../lib/calc'

export function StatCard({ label, value, sub, tone = 'default' }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'default' | 'brand' | 'warn' | 'danger' }) {
  const toneCls = {
    default: '',
    brand: 'ring-brand-100 bg-brand-50/40',
    warn: 'ring-amber-200 bg-amber-50/60',
    danger: 'ring-red-200 bg-red-50/60',
  }[tone]
  return (
    <div className={`card ${toneCls}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight md:text-2xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

export const LEVEL_META: Record<ReturnLevel, { label: string; cls: string; desc: string }> = {
  easy: { label: '無理なく到達可能', cls: 'bg-emerald-100 text-emerald-800', desc: '預金や債券中心でも届く水準です。' },
  moderate: { label: '分散投資で現実的', cls: 'bg-brand-100 text-brand-700', desc: '世界株インデックス等の長期分散で狙える水準です。' },
  hard: { label: '高いリスクが必要', cls: 'bg-amber-100 text-amber-800', desc: '国内の一般的な商品では届きにくい水準です。値動きの大きい資産が必要になります。' },
  unrealistic: { label: '非現実的', cls: 'bg-red-100 text-red-800', desc: 'この利回りを長期で続けることは現実的ではありません。前提の見直しをおすすめします。' },
}

export function LevelBadge({ level }: { level: ReturnLevel }) {
  const m = LEVEL_META[level]
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'danger'; children: ReactNode }) {
  const cls = {
    info: 'border-slate-200 bg-slate-50 text-slate-700',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
  }[tone]
  const icon = { info: 'ℹ', warn: '⚠', danger: '⚠' }[tone]
  return (
    <div className={`flex gap-2 rounded-lg border p-3 text-sm ${cls}`}>
      <span aria-hidden>{icon}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card text-center text-sm text-slate-500">{children}</div>
}
