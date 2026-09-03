import { useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'
import { pct } from '../lib/format'
import { PRODUCTS, RISK_LABEL, type Product } from '../lib/products'
import { Notice, Section } from '../components/ui'

const LEVEL_CLS = { 1: 'bg-emerald-100 text-emerald-800', 2: 'bg-amber-100 text-amber-800', 3: 'bg-red-100 text-red-800' } as const
const LEVEL_TXT = { 1: '低', 2: '中', 3: '高' } as const

export default function Products() {
  const a = useAnalysis()
  const [openId, setOpenId] = useState<string | null>(null)
  const target = a.requiredRate ?? 0

  const sorted = [...PRODUCTS].sort((x, y) => Math.abs(x.expectedReturn / 100 - target) - Math.abs(y.expectedReturn / 100 - target))

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold">参考商品と「見えないリスク」</h1>
        <span className="badge bg-slate-200 text-slate-700">β・プレビュー</span>
      </div>
      <p className="text-xs text-slate-500">必要利回り {a.requiredRate !== null ? pct(a.requiredRate) : '—'} に近い順に、商品タイプの「例」を並べています。</p>

      <div className="mt-3">
        <Notice tone="warn">
          <b>本画面は参考情報の提示であり、特定の金融商品の推奨・勧誘ではありません。</b>
          掲載内容は一般的な商品タイプの説明とデモ用の例で、一次資料と照合されていません。実際の投資判断は、ご自身の責任で、必要に応じて専門家にご相談ください。
        </Notice>
      </div>

      <Section title="必要利回りに近い順">
        <ul className="space-y-2">
          {sorted.map((p) => (
            <ProductCard key={p.id} p={p} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)} />
          ))}
        </ul>
      </Section>

      {a.level && (a.level === 'hard' || a.level === 'unrealistic') && (
        <Section title="高い利回りが必要な場合">
          <div className="card">
            <p className="text-sm text-slate-700">
              必要利回りが8%を超える場合、国内の一般的な商品だけでは届きにくく、値動きの大きい資産や海外の商品も含めた検討が必要になります。
              その分「見えないリスク」（発行体・為替・流動性）も増えます。まずは目標ページで積立・期間・目標額を動かし、それでも高い利回りが必要なら専門家に相談することをおすすめします。
            </p>
            <button className="btn-ghost mt-3" onClick={() => alert('デモ版のため、相談導線は未接続です。')}>専門家に相談する（デモ）</button>
          </div>
        </Section>
      )}
    </div>
  )
}

function ProductCard({ p, open, onToggle }: { p: Product; open: boolean; onToggle: () => void }) {
  const maxRisk = Math.max(...p.risks.map((r) => r.level)) as 1 | 2 | 3
  return (
    <li className="card p-0">
      <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={onToggle}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{p.name}</span>
            <span className="badge bg-slate-100 text-slate-600">{p.type}</span>
            {p.status === 'closed' && <span className="badge bg-slate-200 text-slate-600">募集終了・参考例</span>}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            想定 {p.expectedReturn}%／年 ・ {p.currency} ・ {p.termYears ? `${p.termYears}年` : '期間なし'} ・ 元本保護 {p.capitalProtected ? 'あり（発行体保証）' : 'なし'}
          </div>
        </div>
        <span className={`badge ${LEVEL_CLS[maxRisk]}`}>リスク {LEVEL_TXT[maxRisk]}</span>
        <span className="text-slate-400">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-700">{p.summary}</p>
          <div className="mt-3 text-xs font-semibold text-slate-600">見えにくいリスク</div>
          <ul className="mt-1 space-y-1.5">
            {p.risks.map((r) => (
              <li key={r.kind} className="flex items-start gap-2 text-sm">
                <span className={`badge shrink-0 ${LEVEL_CLS[r.level]}`}>{RISK_LABEL[r.kind]}・{LEVEL_TXT[r.level]}</span>
                <span className="text-slate-600">{r.note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-xs font-semibold text-slate-600">こういう人には向きません</div>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
            {p.notSuitedFor.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}
    </li>
  )
}
