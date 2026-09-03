import { useMemo } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'
import { requiredReturn } from '../lib/calc'
import { pct, yen } from '../lib/format'
import { useStore } from '../store'
import { Link } from 'react-router-dom'
import { LEVEL_META, LevelBadge, Notice, Section } from '../components/ui'
import { classifyReturn } from '../lib/calc'

const MAN = 10_000

export default function GoalPage() {
  const a = useAnalysis()
  const setGoal = useStore((s) => s.setGoal)
  const g = a.goal

  // 感度分析: 積立額を変えたとき／目標年齢を変えたときの必要利回り
  const byContribution = useMemo(() => {
    const steps = [0, 1, 2, 3, 5, 7, 10, 15, 20, 30].map((m) => m * MAN)
    return steps.map((m) => ({ m, r: requiredReturn(a.investable, m, a.years, g.targetAmount) }))
  }, [a.investable, a.years, g.targetAmount])

  const byAge = useMemo(() => {
    const ages = [60, 65, 70, 75].filter((x) => x > g.currentAge)
    return ages.map((age) => ({ age, r: requiredReturn(a.investable, g.monthlyContribution, age - g.currentAge, g.targetAmount) }))
  }, [a.investable, g.currentAge, g.monthlyContribution, g.targetAmount])

  return (
    <div>
      <h1 className="text-base font-semibold">将来の目標</h1>
      <p className="text-xs text-slate-500">「何歳のときに、いくら持っていたいか」を決めるところから始めます。あとから何度でも変えられます。</p>
      {g.currentAge >= 60 && (
        <div className="mt-3">
          <Notice tone="warn">
            60歳以上の方は「増やす」より「何歳まで持つか」で見るほうが合います。
            <Link to="/start" className="ml-1 underline">準備モード（資産寿命）で見る</Link>
          </Notice>
        </div>
      )}

      <div className="card mt-4 grid gap-4 md:grid-cols-4">
        <div>
          <label className="label">現在の年齢</label>
          <input className="input" type="number" min={0} max={100} value={g.currentAge} onChange={(e) => setGoal({ currentAge: +e.target.value })} />
        </div>
        <div>
          <label className="label">目標年齢</label>
          <input className="input" type="number" min={1} max={100} value={g.targetAge} onChange={(e) => setGoal({ targetAge: +e.target.value })} />
        </div>
        <div>
          <label className="label">目標金額（万円）</label>
          <input className="input" type="number" min={0} step={100} value={Math.round(g.targetAmount / MAN)} onChange={(e) => setGoal({ targetAmount: Math.max(0, +e.target.value) * MAN })} />
        </div>
        <div>
          <label className="label">毎月の積立額（万円）</label>
          <input className="input" type="number" min={0} step={0.5} value={g.monthlyContribution / MAN} onChange={(e) => setGoal({ monthlyContribution: Math.max(0, +e.target.value) * MAN })} />
        </div>
      </div>

      <Section title="この目標に必要な利回り">
        <div className="card">
          {a.req.status === 'ok' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold tracking-tight">{pct(a.requiredRate!)}</span>
              <span className="text-sm text-slate-500">／年</span>
              {a.level && <LevelBadge level={a.level} />}
            </div>
          )}
          {a.req.status === 'achieved' && <div className="text-lg font-semibold text-emerald-700">運用しなくても到達できる見込みです（利回り0%でOK）</div>}
          {a.req.status === 'impossible' && <div className="text-sm text-red-700">運用できる資産も積立もないため計算できません。資産を登録するか、積立額を入れてください。</div>}
          {a.req.status === 'invalid' && <div className="text-sm text-red-700">目標年齢は現在の年齢より大きくしてください。</div>}
          {a.level && <p className="mt-2 text-sm text-slate-600">{LEVEL_META[a.level].desc}</p>}
          <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
            <div>運用できる資産（元手）: <b className="text-slate-700">{yen(a.investable)}</b></div>
            <div>期間: <b className="text-slate-700">{a.years}年</b></div>
            <div>今のペースでの到達額: <b className="text-slate-700">{yen(a.projected)}</b>（想定 {pct(a.currentRate)}）</div>
          </div>
        </div>
      </Section>

      <Section title="もし積立額を変えたら？">
        <p className="-mt-1 mb-2 text-xs text-slate-500">同じ目標でも、毎月の積立を足すと必要な利回りは大きく下がります。</p>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr><th className="px-3 py-2 text-left">毎月の積立</th><th className="px-3 py-2 text-right">必要利回り</th><th className="px-3 py-2 text-left">評価</th></tr>
            </thead>
            <tbody>
              {byContribution.map(({ m, r }) => {
                const active = m === g.monthlyContribution
                return (
                  <tr key={m} className={`border-t border-slate-100 ${active ? 'bg-brand-50/60 font-semibold' : ''}`}>
                    <td className="px-3 py-2">{m === 0 ? 'なし' : yen(m)}</td>
                    <td className="px-3 py-2 text-right">{r.status === 'ok' ? pct(r.rate) : r.status === 'achieved' ? '0%（到達可）' : '—'}</td>
                    <td className="px-3 py-2">{r.status === 'ok' && <LevelBadge level={classifyReturn(r.rate)} />}{r.status === 'achieved' && <span className="badge bg-emerald-100 text-emerald-800">到達可</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="もし目標年齢を変えたら？">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {byAge.map(({ age, r }) => (
            <button key={age} onClick={() => setGoal({ targetAge: age })} className={`card text-left transition hover:ring-brand-300 ${age === g.targetAge ? 'ring-2 ring-brand-500' : ''}`}>
              <div className="text-xs text-slate-500">{age}歳まで（{age - g.currentAge}年）</div>
              <div className="mt-1 text-xl font-bold">{r.status === 'ok' ? pct(r.rate) : r.status === 'achieved' ? '0%' : '—'}</div>
              {r.status === 'ok' && <div className="mt-1"><LevelBadge level={classifyReturn(r.rate)} /></div>}
            </button>
          ))}
        </div>
      </Section>

      <div className="mt-6">
        <Notice>
          必要利回りは「今いくら持っていて、何歳か」で決まります。商品選びはその次です。目標が非現実的なら、商品で無理をするのではなく、積立・期間・目標額の3つを動かしてみてください。
        </Notice>
      </div>
    </div>
  )
}
