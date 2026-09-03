import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { copy } from '../lib/copy'
import { CASH_BANDS, HOME_BANDS } from '../lib/defaults'
import { track } from '../lib/events'
import { useStore } from '../store'

const MAN = 10_000

function ManInput({ value, onChange, autoFocus }: { value: number; onChange: (v: number) => void; autoFocus?: boolean }) {
  const [text, setText] = useState(String(Math.round(value / MAN)))
  useEffect(() => setText(String(Math.round(value / MAN))), [value])
  return (
    <div className="flex items-center gap-2">
      <input
        className="input text-2xl"
        inputMode="numeric"
        pattern="[0-9]*"
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => {
          const t = e.target.value.replace(/[^0-9]/g, '')
          setText(t)
          onChange((Number(t) || 0) * MAN)
        }}
      />
      <span className="text-lg">万円</span>
    </div>
  )
}

export default function Prep() {
  const nav = useNavigate()
  const prep = useStore((s) => s.prep)
  const setPrep = useStore((s) => s.setPrep)
  const [step, setStep] = useState(0)
  const [exact, setExact] = useState(false)

  if (!prep) return <Navigate to="/start" replace />
  const forParent = prep.forWhom === 'parent'
  const total = 3
  const steps = [
    { q: copy.prep.q2, body: <ManInput value={prep.pensionMonthly} onChange={(v) => setPrep({ pensionMonthly: v })} autoFocus /> },
    { q: copy.prep.q3, body: <ManInput value={prep.expenseMonthly} onChange={(v) => setPrep({ expenseMonthly: v })} autoFocus /> },
    {
      q: copy.prep.q4,
      body: (
        <div className="grid gap-2">
          {CASH_BANDS.map((b) => (
            <button
              key={b.value}
              className={`rounded-xl border px-4 py-3 text-left text-base ${prep.cashBand === b.value && !exact ? 'border-brand-500 bg-brand-50 font-semibold' : 'border-slate-300 bg-white'}`}
              onClick={() => {
                setExact(false)
                setPrep({ cashBand: b.value, cashExact: undefined })
              }}
            >
              {b.label}
            </button>
          ))}
          {!exact ? (
            <button className="mt-1 text-sm text-brand-700 underline" onClick={() => { setExact(true); setPrep({ cashExact: prep.cashExact ?? CASH_BANDS.find((x) => x.value === prep.cashBand)!.representative }) }}>
              {copy.prep.exact}
            </button>
          ) : (
            <div className="mt-1">
              <div className="label">{copy.prep.exact}</div>
              <ManInput value={prep.cashExact ?? 0} onChange={(v) => setPrep({ cashExact: v })} autoFocus />
            </div>
          )}
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="text-base font-medium">{copy.prep.q5}</div>
            <div className="mt-1 text-sm text-slate-500">{copy.prep.q5note}</div>
            <div className="mt-2 grid gap-2">
              {HOME_BANDS.map((b) => (
                <button
                  key={b.value}
                  className={`rounded-xl border px-4 py-2.5 text-left text-base ${(prep.homeValueBand ?? 0) === b.value ? 'border-brand-500 bg-brand-50 font-semibold' : 'border-slate-300 bg-white'}`}
                  onClick={() => setPrep({ homeValueBand: b.value })}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ]

  const finish = () => {
    track('complete', 'prep')
    nav('/prep/result')
  }

  return (
    <div className="mx-auto max-w-md py-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{forParent ? '家族（親）のこと' : '自分のこと'}・{prep.age}歳</span>
        <span className="tabular-nums">{step + 1} / {total}</span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded bg-slate-200">
        <div className="h-1.5 rounded bg-brand-600 transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <div className="card mt-5">
        <div className="text-lg font-semibold">{steps[step].q}</div>
        <div className="mt-1 text-sm text-slate-500">{copy.prep.hint}</div>
        <div className="mt-4">{steps[step].body}</div>
      </div>

      <div className="mt-4 flex justify-between">
        <button className="btn-ghost" onClick={() => (step === 0 ? nav('/start') : setStep(step - 1))}>戻る</button>
        {step < total - 1 ? (
          <button className="btn-primary px-6" onClick={() => setStep(step + 1)}>次へ</button>
        ) : (
          <button className="btn-primary px-6" onClick={finish}>結果を見る</button>
        )}
      </div>
    </div>
  )
}
