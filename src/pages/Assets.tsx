import { useState } from 'react'
import { useStore } from '../store'
import { CATEGORY_LABEL, REALESTATE_USE_LABEL, type Asset, type AssetCategory, type RealEstateUse } from '../lib/types'
import { pct, uid, yen } from '../lib/format'
import { investableTotal, totalAssets } from '../lib/calc'
import { Empty, Notice, Section } from '../components/ui'

const MAN = 10_000
const EMPTY: Omit<Asset, 'id'> = { name: '', category: 'cash', value: 0, investable: true, expectedReturn: undefined }

export default function Assets() {
  const { assets, addAsset, updateAsset, removeAsset } = useStore()
  const [editing, setEditing] = useState<Asset | null>(null)
  const [showForm, setShowForm] = useState(false)

  const investable = assets.filter((a) => a.investable)
  const nonInvestable = assets.filter((a) => !a.investable)

  function startNew() {
    setEditing({ id: uid(), ...EMPTY })
    setShowForm(true)
  }
  function startEdit(a: Asset) {
    setEditing({ ...a })
    setShowForm(true)
  }
  function save(a: Asset) {
    if (assets.some((x) => x.id === a.id)) updateAsset(a)
    else addAsset(a)
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">資産一覧（バランスシート）</h1>
          <p className="text-xs text-slate-500">合計 {yen(totalAssets(assets))}／うち運用できる資産 {yen(investableTotal(assets))}</p>
        </div>
        <button className="btn-primary" onClick={startNew}>＋ 追加</button>
      </div>

      {showForm && editing && <AssetForm initial={editing} onSave={save} onCancel={() => setShowForm(false)} />}

      {assets.length === 0 && !showForm && (
        <div className="mt-4">
          <Empty>
            預金・証券・不動産・保険など、持っているものを金額ベースで登録します。正確でなくて構いません。「ざっくり」が大事です。
          </Empty>
        </div>
      )}

      <AssetGroup title="運用できる資産" hint="目標達成の計算に含めます" items={investable} onEdit={startEdit} onRemove={removeAsset} />
      <AssetGroup title="運用対象外の資産" hint="自宅・保険など。総資産には含めますが、目標達成の計算からは除きます" items={nonInvestable} onEdit={startEdit} onRemove={removeAsset} />
    </div>
  )
}

function AssetGroup({ title, hint, items, onEdit, onRemove }: { title: string; hint: string; items: Asset[]; onEdit: (a: Asset) => void; onRemove: (id: string) => void }) {
  if (items.length === 0) return null
  const sum = items.reduce((s, a) => s + a.value, 0)
  return (
    <Section title={title} right={<span className="text-sm font-semibold">{yen(sum)}</span>}>
      <p className="-mt-1 mb-2 text-xs text-slate-500">{hint}</p>
      <ul className="card divide-y divide-slate-100 p-0">
        {items.map((a) => (
          <li key={a.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{a.name || '（名称未設定）'}</div>
              <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-slate-500">
                <span>{CATEGORY_LABEL[a.category]}</span>
                {a.category === 'realestate' && a.realEstateUse && <span>・{REALESTATE_USE_LABEL[a.realEstateUse]}</span>}
                {a.expectedReturn !== undefined && <span>・想定 {pct(a.expectedReturn / 100)}</span>}
              </div>
            </div>
            <div className="text-right text-sm font-semibold">{yen(a.value)}</div>
            <div className="flex gap-1">
              <button className="btn-ghost px-2 py-1 text-xs" onClick={() => onEdit(a)}>編集</button>
              <button className="btn-danger px-2 py-1 text-xs" onClick={() => confirm(`「${a.name}」を削除しますか？`) && onRemove(a.id)}>削除</button>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function AssetForm({ initial, onSave, onCancel }: { initial: Asset; onSave: (a: Asset) => void; onCancel: () => void }) {
  const [a, setA] = useState<Asset>(initial)
  const [valueMan, setValueMan] = useState<string>(initial.value ? String(initial.value / MAN) : '')
  const [ret, setRet] = useState<string>(initial.expectedReturn !== undefined ? String(initial.expectedReturn) : '')

  function setCategory(category: AssetCategory) {
    const next: Asset = { ...a, category }
    if (category === 'realestate') {
      next.realEstateUse = next.realEstateUse ?? 'home'
      next.investable = next.realEstateUse !== 'home'
    } else {
      delete next.realEstateUse
      if (category === 'insurance') next.investable = false
      else next.investable = true
    }
    setA(next)
  }
  function setUse(use: RealEstateUse) {
    setA({ ...a, realEstateUse: use, investable: use !== 'home' })
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = Math.max(0, Math.round(parseFloat(valueMan || '0') * MAN))
    const expectedReturn = ret.trim() === '' ? undefined : parseFloat(ret)
    onSave({ ...a, name: a.name.trim() || CATEGORY_LABEL[a.category], value, expectedReturn })
  }

  return (
    <form onSubmit={submit} className="card mt-4 space-y-3 ring-brand-200">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">カテゴリ</label>
          <select className="input" value={a.category} onChange={(e) => setCategory(e.target.value as AssetCategory)}>
            {(Object.keys(CATEGORY_LABEL) as AssetCategory[]).map((k) => (
              <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">名称</label>
          <input className="input" placeholder="例: ○○銀行 普通預金／NISA／自宅マンション" value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} />
        </div>
        <div>
          <label className="label">評価額（万円）</label>
          <input className="input" type="number" inputMode="decimal" min={0} step="1" placeholder="例: 300" value={valueMan} onChange={(e) => setValueMan(e.target.value)} required />
        </div>
        <div>
          <label className="label">想定利回り（%／年・任意）</label>
          <input className="input" type="number" inputMode="decimal" step="0.1" placeholder="例: 5（この商品は5%想定、など）" value={ret} onChange={(e) => setRet(e.target.value)} />
        </div>
        {a.category === 'realestate' && (
          <div>
            <label className="label">用途</label>
            <select className="input" value={a.realEstateUse ?? 'home'} onChange={(e) => setUse(e.target.value as RealEstateUse)}>
              {(Object.keys(REALESTATE_USE_LABEL) as RealEstateUse[]).map((k) => (
                <option key={k} value={k}>{REALESTATE_USE_LABEL[k]}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={a.investable} onChange={(e) => setA({ ...a, investable: e.target.checked })} />
            運用できる資産として計算に含める
          </label>
        </div>
      </div>
      {a.category === 'realestate' && a.realEstateUse === 'home' && (
        <Notice>自宅は売却・貸出をしない限り運用に使えないため、初期設定では計算から除外します。含めたい場合はチェックを入れてください。</Notice>
      )}
      <div>
        <label className="label">メモ（任意）</label>
        <input className="input" value={a.memo ?? ''} onChange={(e) => setA({ ...a, memo: e.target.value })} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>キャンセル</button>
        <button type="submit" className="btn-primary">保存</button>
      </div>
    </form>
  )
}
