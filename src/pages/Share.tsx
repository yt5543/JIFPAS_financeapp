import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { assetLifespan } from '../lib/calc'
import { HOME_FACTOR, cashAmount, homeAmount } from '../lib/defaults'
import { track } from '../lib/events'
import { getRef, refOwner } from '../lib/ref'
import { useStore } from '../store'
import { renderCardPng } from '../lib/card'

/** 結果カード（金額なし）を生成して家族に送る */
export default function Share() {
  const nav = useNavigate()
  const prep = useStore((s) => s.prep)
  const cardRef = useRef<HTMLDivElement>(null)
  const [png, setPng] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const r = prep
    ? assetLifespan({
        age: prep.age,
        assets: cashAmount(prep),
        incomeYearly: prep.pensionMonthly * 12,
        expenseYearly: prep.expenseMonthly * 12,
        rate: prep.rate,
        ...(prep.facilityOn ? { facilityFromAge: prep.facilityFromAge, facilityExtraYearly: prep.facilityExtraMonthly * 12 } : {}),
        ...(prep.useHomeOn ? { homeValue: homeAmount(prep) * HOME_FACTOR, homeAtAge: prep.facilityFromAge } : {}),
      })
    : null

  useEffect(() => {
    if (!cardRef.current) return
    let alive = true
    setBusy(true)
    renderCardPng(cardRef.current)
      .then((d) => alive && setPng(d))
      .catch((e) => alive && setErr(String(e)))
      .finally(() => alive && setBusy(false))
    return () => {
      alive = false
    }
  }, [prep])

  if (!prep || !r) return <Navigate to="/start" replace />
  const owner = refOwner(getRef())
  const headline = r.status === 'ok' ? `${r.age}歳` : r.status === 'never' ? '105歳以上' : '毎月不足'
  const premise = [prep.facilityOn ? `${prep.facilityFromAge}歳から施設` : '施設なし', prep.useHomeOn ? '家を活用' : '家はそのまま'].join('・')
  const text = '草むしりの人がくれたやつ、やってみた。'

  const share = async () => {
    track('share', 'prep')
    if (!png) return
    const blob = await (await fetch(png)).blob()
    const file = new File([blob], 'mieruka.png', { type: 'image/png' })
    const n = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
    if (n.share && (!n.canShare || n.canShare({ files: [file] }))) {
      try {
        await n.share({ files: [file], text })
        return
      } catch {
        /* cancelled */
      }
    }
    const a = document.createElement('a')
    a.href = png
    a.download = 'mieruka.png'
    a.click()
  }

  return (
    <div className="mx-auto max-w-md py-4">
      <h1 className="text-xl font-bold">家族に送る</h1>
      <p className="mt-1 text-sm text-slate-600">金額は載りません。「何歳まで」と前提だけです。</p>

      {/* 生成元。画面にも表示する */}
      <div ref={cardRef} className="mx-auto mt-4 w-[320px] rounded-2xl bg-white p-6 text-slate-800 shadow ring-1 ring-slate-200" style={{ fontFamily: "'BIZ UDPGothic', 'Hiragino Sans', sans-serif" }}>
        <div className="text-xs font-semibold tracking-widest text-brand-700">ミエルカ ｜ 家の資産の健康診断</div>
        <div className="mt-6 text-sm text-slate-500">{prep.forWhom === 'parent' ? '親' : '本人'}・{prep.age}歳</div>
        <div className="mt-1 text-base text-slate-600">今のペースだと預金が尽きるのは</div>
        <div className="mt-2 text-6xl font-bold leading-none tabular-nums text-brand-700">{headline}</div>
        <div className="mt-4 text-sm text-slate-600">前提：{premise}</div>
        <div className="mt-8 border-t border-slate-200 pt-3 text-xs text-slate-500">
          家をどうするかを、家族で一度話すきっかけに。
        </div>
        <div className="mt-2 flex items-end justify-between text-[10px] text-slate-400">
          <span>{owner ? `案内：${owner}` : ''}</span>
          <span>金融商品の販売・勧誘は行いません。入力にもとづく試算です。</span>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <button className="btn-primary py-4 text-lg" onClick={share} disabled={busy || !png}>
          {busy ? '画像を作っています…' : 'LINEなどで送る'}
        </button>
        {png && (
          <a className="btn-ghost py-3" href={png} download="mieruka.png">画像を保存（長押しでも保存できます）</a>
        )}
        <button className="btn-ghost py-3" onClick={() => nav(-1)}>戻る</button>
      </div>
      {err && <p className="mt-3 text-xs text-red-600">画像の生成に失敗しました。画面を撮影して送ってください。</p>}
    </div>
  )
}
