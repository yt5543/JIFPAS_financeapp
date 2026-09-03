import { useNavigate } from 'react-router-dom'
import { assetLifespan } from '../lib/calc'
import { copy } from '../lib/copy'
import { HOME_FACTOR, cashAmount, homeAmount } from '../lib/defaults'
import { track } from '../lib/events'
import { getRef } from '../lib/ref'
import { useStore } from '../store'

/**
 * 相談の予約フォーム（外部・Google フォーム）へ。
 * 渡すのは ref / mode / age / lifespan のみ。金額は渡さない。
 * VITE_CONSULT_FORM_URL: フォームのURL
 * VITE_CONSULT_FIELDS: "ref=entry.111,mode=entry.222,age=entry.333,lifespan=entry.444"（省略時はそのままのキー名）
 */
function buildFormUrl(params: Record<string, string>): string | null {
  const base = import.meta.env.VITE_CONSULT_FORM_URL as string | undefined
  if (!base) return null
  const map: Record<string, string> = {}
  for (const pair of String(import.meta.env.VITE_CONSULT_FIELDS ?? '').split(',')) {
    const [k, v] = pair.split('=')
    if (k && v) map[k.trim()] = v.trim()
  }
  const u = new URL(base)
  if (u.hostname.includes('docs.google.com')) u.searchParams.set('usp', 'pp_url')
  for (const [k, v] of Object.entries(params)) u.searchParams.set(map[k] ?? k, v)
  return u.toString()
}

export default function Consult() {
  const nav = useNavigate()
  const prep = useStore((s) => s.prep)
  const goal = useStore((s) => s.goal)

  const lifespan = (() => {
    if (!prep) return ''
    const r = assetLifespan({
      age: prep.age,
      assets: cashAmount(prep),
      incomeYearly: prep.pensionMonthly * 12,
      expenseYearly: prep.expenseMonthly * 12,
      rate: prep.rate,
      ...(prep.facilityOn ? { facilityFromAge: prep.facilityFromAge, facilityExtraYearly: prep.facilityExtraMonthly * 12 } : {}),
      ...(prep.useHomeOn ? { homeValue: homeAmount(prep) * HOME_FACTOR, homeAtAge: prep.facilityFromAge } : {}),
    })
    return r.status === 'ok' ? String(r.age) : r.status === 'never' ? '105+' : 'deficit'
  })()

  const mode = prep ? 'prep' : 'goal'
  const age = prep ? prep.age : goal.currentAge
  const url = buildFormUrl({ ref: getRef(), mode, age: String(age), lifespan })

  const go = () => {
    track('consult', mode)
    if (url) window.location.href = url
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="text-2xl font-bold leading-snug">{copy.consult.title}</h1>
      <ul className="mt-4 space-y-2 text-base text-slate-700">
        {copy.consult.body.map((t) => (
          <li key={t} className="flex gap-2"><span className="text-brand-600">●</span><span>{t}</span></li>
        ))}
      </ul>
      <div className="mt-6 grid gap-2">
        {url ? (
          <button className="btn-primary py-4 text-lg" onClick={go}>{copy.consult.go}</button>
        ) : (
          <div className="card text-sm text-slate-600">予約フォームは準備中です。案内人にお声がけください。</div>
        )}
        <button className="btn-ghost py-3" onClick={() => nav(-1)}>{copy.consult.back}</button>
      </div>
    </div>
  )
}
