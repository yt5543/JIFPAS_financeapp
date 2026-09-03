import { useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { HeroNumber } from '../components/HeroNumber'
import { Toggle } from '../components/Toggle'
import { assetLifespan } from '../lib/calc'
import { copy, heroFor } from '../lib/copy'
import { HOME_FACTOR, cashAmount, homeAmount } from '../lib/defaults'
import { yen } from '../lib/format'
import { useStore } from '../store'

const MAN = 10_000

export default function PrepResult() {
  const nav = useNavigate()
  const prep = useStore((s) => s.prep)
  const setPrep = useStore((s) => s.setPrep)

  const calc = useMemo(() => {
    if (!prep) return null
    const base = {
      age: prep.age,
      assets: cashAmount(prep),
      incomeYearly: prep.pensionMonthly * 12,
      expenseYearly: prep.expenseMonthly * 12,
      rate: prep.rate,
    }
    const facility = prep.facilityOn ? { facilityFromAge: prep.facilityFromAge, facilityExtraYearly: prep.facilityExtraMonthly * 12 } : {}
    const home = prep.useHomeOn ? { homeValue: homeAmount(prep) * HOME_FACTOR, homeAtAge: prep.facilityFromAge } : {}
    const current = assetLifespan({ ...base, ...facility, ...home })
    const nothing = assetLifespan({ ...base, ...facility })
    const withHome = assetLifespan({ ...base, ...facility, homeValue: homeAmount(prep) * HOME_FACTOR, homeAtAge: prep.facilityFromAge })
    return { current, nothing, withHome }
  }, [prep])

  if (!prep || !calc) return <Navigate to="/start" replace />
  const forParent = prep.forWhom === 'parent'
  const hero = heroFor(calc.current, forParent)
  const danger = calc.current.status === 'deficit' || (calc.current.status === 'ok' && calc.current.age < 90)
  const hasHome = homeAmount(prep) > 0
  const series = calc.current.status === 'deficit' ? [] : calc.current.series

  const ageText = (r: typeof calc.current) => (r.status === 'ok' ? `${r.age}歳` : r.status === 'never' ? '105歳以上' : `月${Math.ceil(r.monthlyGap / MAN)}万円不足`)

  return (
    <div className="mx-auto max-w-md py-4">
      <div className="card py-6">
        <HeroNumber before={hero.before} num={hero.num} unit={hero.unit} after={hero.after} tone={danger ? 'danger' : 'brand'} />
        <div className="mt-3 text-center text-sm text-slate-500">
          {prep.age}歳・毎月 {yen(prep.pensionMonthly)} 収入／{yen(prep.expenseMonthly)} 支出・預金 約{yen(cashAmount(prep))}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Toggle
          on={prep.facilityOn}
          onChange={(v) => setPrep({ facilityOn: v })}
          label={copy.result.facilityToggle(prep.facilityFromAge, Math.round(prep.facilityExtraMonthly / MAN))}
        />
        <Toggle
          on={prep.useHomeOn}
          onChange={(v) => setPrep({ useHomeOn: v })}
          label={copy.result.homeToggle}
          sub={hasHome ? `家 約${yen(homeAmount(prep))} × ${HOME_FACTOR}（概算）を${prep.facilityFromAge}歳で充てる` : '家の桁を入れると使えます'}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="card">
          <div className="text-xs text-slate-500">{copy.result.nothing}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{ageText(calc.nothing)}</div>
        </div>
        <div className="card ring-brand-100 bg-brand-50/40">
          <div className="text-xs text-slate-500">{copy.result.oneChange}：家を活用</div>
          {hasHome ? (
            <div className="mt-1 text-2xl font-bold tabular-nums text-brand-700">{ageText(calc.withHome)}</div>
          ) : (
            <div className="mt-1 text-sm text-slate-500">家の桁を入れると表示されます</div>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-lg font-semibold leading-snug">
        {forParent ? copy.result.futureSelfParent(prep.facilityFromAge) : copy.result.futureSelf(prep.facilityFromAge)}
      </p>
      <p className="mt-2 text-center text-base text-slate-700">{copy.result.talk}</p>

      {series.length > 1 && (
        <div className="card mt-5">
          <div className="mb-2 text-xs text-slate-500">預金の残り（試算）</div>
          <div className="h-44">
            <ResponsiveContainer>
              <LineChart data={series} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / MAN)}`} width={44} />
                <Tooltip formatter={(v: number) => yen(v)} labelFormatter={(l) => `${l}歳`} />
                <Line type="monotone" dataKey="assets" name="預金" stroke="#1f8a70" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-right text-[11px] text-slate-400">単位：万円</div>
        </div>
      )}

      <div className="mt-6 grid gap-2">
        <button className="btn-primary py-4 text-lg" onClick={() => nav('/consult')}>{copy.result.consult}</button>
        <button className="btn-ghost py-4 text-lg" onClick={() => nav('/share')}>{copy.result.share}</button>
      </div>

      <details className="mt-6 text-sm text-slate-600">
        <summary className="cursor-pointer">{copy.result.detail}</summary>
        <p className="mt-2">口座・保険・不動産を登録すると、より正確な数字と「わが家の資産ノート」が作れます。</p>
        <Link to="/assets" className="btn-ghost mt-2">資産を登録する</Link>
      </details>

      <p className="mt-6 text-center text-xs text-slate-400">{copy.result.disclaimer}</p>
    </div>
  )
}
