import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SAMPLES } from '../lib/samples'
import { useStore } from '../store'
import { Notice, Section } from '../components/ui'

export default function Settings() {
  const { assets, goal, snapshots, loadSample, importData, reset } = useStore()
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  function exportJson() {
    const blob = new Blob([JSON.stringify({ assets, goal, snapshots, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mieruka-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJson(file: File) {
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data.assets) || !data.goal) throw new Error('形式が違います')
      importData(data)
      nav('/')
    } catch (e) {
      alert(`読み込みに失敗しました: ${(e as Error).message}`)
    }
  }

  return (
    <div>
      <h1 className="text-base font-semibold">設定・データ</h1>

      <Section title="サンプルデータで試す">
        <p className="-mt-1 mb-2 text-xs text-slate-500">今のデータは上書きされます。</p>
        <div className="grid gap-2 md:grid-cols-3">
          {SAMPLES.map((s) => (
            <button key={s.key} className="card text-left transition hover:ring-brand-300" onClick={() => { loadSample(s.key); nav('/') }}>
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="mt-1 text-xs text-slate-500">{s.description}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="データの保存場所">
        <Notice>
          データはこの端末のブラウザ内（localStorage）にのみ保存され、サーバーには送信されません。端末を変える場合はエクスポートしてください。
        </Notice>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={exportJson}>JSONでエクスポート</button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>JSONをインポート</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          <button className="btn-danger" onClick={() => confirm('すべてのデータを削除します。よろしいですか？') && reset()}>すべて削除</button>
        </div>
      </Section>

      <Section title="このアプリについて">
        <div className="card text-sm text-slate-600">
          <p><b>ミエルカ</b> は、どの金融機関・商品にも属さない中立の立場で、資産の現状と将来目標のギャップを見える化するツールです。</p>
          <p className="mt-2">特定商品の推奨・勧誘は行いません。表示される数値はすべてご入力内容に基づく試算です。</p>
          <p className="mt-2 text-xs text-slate-400">v0.1.0（デモ版）</p>
        </div>
      </Section>
    </div>
  )
}
