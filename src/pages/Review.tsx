import { useAnalysis } from '../hooks/useAnalysis'
import { dateJa, pct, uid, yen } from '../lib/format'
import { CATEGORY_LABEL, type AssetCategory, type Snapshot } from '../lib/types'
import { useStore } from '../store'
import { Empty, Notice, Section } from '../components/ui'

export default function Review() {
  const a = useAnalysis()
  const { snapshots, addSnapshot, removeSnapshot } = useStore()

  function save() {
    const snap: Snapshot = {
      id: uid(),
      takenAt: new Date().toISOString(),
      totalAssets: a.total,
      investableAssets: a.investable,
      requiredReturn: a.requiredRate,
      projectedAtTarget: a.projected,
      byCategory: a.byCategory,
    }
    addSnapshot(snap)
  }

  const [latest, prev] = snapshots
  const diff = latest && prev ? latest.investableAssets - prev.investableAssets : null
  const diffRate = diff !== null && prev && prev.investableAssets > 0 ? diff / prev.investableAssets : null

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">年次見直し</h1>
          <p className="text-xs text-slate-500">年に1回、今の状態を保存して前回と比べます。予定通りか、上振れか、下振れか。</p>
        </div>
        <button className="btn-primary" onClick={save} disabled={a.assets.length === 0}>今の状態を保存</button>
      </div>

      {snapshots.length === 0 && (
        <div className="mt-4"><Empty>まだ保存がありません。資産と目標を入れたら「今の状態を保存」を押してください。</Empty></div>
      )}

      {latest && prev && (
        <Section title="前回との比較">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="card">
              <div className="text-xs text-slate-500">運用できる資産の増減</div>
              <div className={`mt-1 text-2xl font-bold ${diff! >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {diff! >= 0 ? '+' : ''}{yen(diff!)}
              </div>
              <div className="text-xs text-slate-500">{diffRate !== null && `${diffRate >= 0 ? '+' : ''}${pct(diffRate)}`}（{dateJa(prev.takenAt)} → {dateJa(latest.takenAt)}）</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-500">必要利回りの変化</div>
              <div className="mt-1 text-2xl font-bold">
                {prev.requiredReturn !== null ? pct(prev.requiredReturn) : '—'} → {latest.requiredReturn !== null ? pct(latest.requiredReturn) : '—'}
              </div>
              <div className="text-xs text-slate-500">下がっていれば順調です</div>
            </div>
            <div className="card">
              <div className="text-xs text-slate-500">判定</div>
              <div className="mt-1 text-lg font-bold">
                {latest.requiredReturn !== null && prev.requiredReturn !== null
                  ? latest.requiredReturn < prev.requiredReturn - 0.002
                    ? '予定より上振れ'
                    : latest.requiredReturn > prev.requiredReturn + 0.002
                      ? '予定より下振れ'
                      : 'ほぼ予定通り'
                  : '—'}
              </div>
              <div className="text-xs text-slate-500">必要利回りの変化で判定</div>
            </div>
          </div>
          {latest.requiredReturn !== null && prev.requiredReturn !== null && latest.requiredReturn > prev.requiredReturn + 0.002 && (
            <div className="mt-3"><Notice tone="warn">下振れしています。資産の組み替え・積立額の見直し・目標の再設定を検討するタイミングです。</Notice></div>
          )}
        </Section>
      )}

      {snapshots.length > 0 && (
        <Section title="保存履歴">
          <ul className="space-y-2">
            {snapshots.map((s) => (
              <li key={s.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{dateJa(s.takenAt)}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      総資産 {yen(s.totalAssets)}／運用できる資産 {yen(s.investableAssets)}／必要利回り {s.requiredReturn !== null ? pct(s.requiredReturn) : '—'}／到達見込み {yen(s.projectedAtTarget)}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                      {(Object.keys(s.byCategory) as AssetCategory[]).filter((k) => s.byCategory[k] > 0).map((k) => (
                        <span key={k}>{CATEGORY_LABEL[k]} {yen(s.byCategory[k])}</span>
                      ))}
                    </div>
                  </div>
                  <button className="btn-danger px-2 py-1 text-xs" onClick={() => confirm('この保存を削除しますか？') && removeSnapshot(s.id)}>削除</button>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
