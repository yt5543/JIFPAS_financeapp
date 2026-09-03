import { Link } from 'react-router-dom'
import { Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAnalysis } from '../hooks/useAnalysis'
import { growthSeries } from '../lib/calc'
import { pct, yen } from '../lib/format'
import { CATEGORY_LABEL, type AssetCategory } from '../lib/types'
import { useStore } from '../store'
import { Empty, LEVEL_META, LevelBadge, Notice, Section, StatCard } from '../components/ui'

const COLORS: Record<AssetCategory, string> = {
  cash: '#64748b',
  securities: '#1f8a70',
  realestate: '#d97706',
  insurance: '#7c3aed',
  other: '#0ea5e9',
}

export default function Dashboard() {
  const a = useAnalysis()
  const snapshots = useStore((s) => s.snapshots)
  const hasAssets = a.assets.length > 0

  const pieData = (Object.keys(a.byCategory) as AssetCategory[])
    .filter((k) => a.byCategory[k] > 0)
    .map((k) => ({ name: CATEGORY_LABEL[k], value: a.byCategory[k], key: k }))

  const series =
    a.years > 0
      ? growthSeries(a.investable, a.goal.monthlyContribution, a.years, [
          { key: 'current', rate: a.currentRate },
          ...(a.requiredRate !== null ? [{ key: 'required', rate: a.requiredRate }] : []),
        ]).map((r) => ({ ...r, age: a.goal.currentAge + r.year }))
      : []

  const lastSnap = snapshots[0]
  const daysSinceSnap = lastSnap ? Math.floor((Date.now() - new Date(lastSnap.takenAt).getTime()) / 86400000) : null

  const todo: { text: string; to: string }[] = []
  if (!hasAssets) todo.push({ text: 'まず資産を登録しましょう（預金・証券・不動産など）', to: '/assets' })
  if (a.goal.targetAmount <= 0) todo.push({ text: '目標金額を設定しましょう', to: '/goal' })
  if (hasAssets && a.level === 'unrealistic') todo.push({ text: '必要利回りが非現実的です。積立額・目標年齢・目標額を見直しましょう', to: '/goal' })
  if (hasAssets && !lastSnap) todo.push({ text: '今の状態をスナップショット保存しておくと、1年後に比較できます', to: '/review' })
  if (daysSinceSnap !== null && daysSinceSnap >= 365) todo.push({ text: '前回の保存から1年以上経過。年次見直しの時期です', to: '/review' })

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="総資産" value={yen(a.total)} />
        <StatCard label="運用できる資産" value={yen(a.investable)} sub="目標達成の計算に使う金額" tone="brand" />
        <StatCard label="運用対象外の資産" value={yen(a.nonInvestable)} sub="自宅・保険など" />
        <StatCard
          label="目標までの達成率"
          value={`${Math.round(a.progress * 100)}%`}
          sub={`目標 ${yen(a.goal.targetAmount)}（${a.goal.targetAge}歳）`}
        />
      </div>

      {!hasAssets && (
        <div className="mt-4">
          <Empty>
            まだ資産が登録されていません。
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link to="/assets" className="btn-primary">資産を登録する</Link>
              <Link to="/settings" className="btn-ghost">サンプルデータで試す</Link>
            </div>
          </Empty>
        </div>
      )}

      {hasAssets && (
        <>
          <Section title="目標とのギャップ">
            <div className="grid gap-3 md:grid-cols-2">
              <div className={`card ${a.level === 'unrealistic' ? 'ring-red-200' : a.level === 'hard' ? 'ring-amber-200' : ''}`}>
                <div className="text-xs text-slate-500">目標達成に必要な利回り（年）</div>
                {a.req.status === 'ok' && (
                  <>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">{pct(a.requiredRate!)}</span>
                      {a.level && <LevelBadge level={a.level} />}
                    </div>
                    {a.level && <p className="mt-2 text-xs text-slate-600">{LEVEL_META[a.level].desc}</p>}
                  </>
                )}
                {a.req.status === 'achieved' && (
                  <div className="mt-1 text-lg font-bold text-emerald-700">運用しなくても到達できる見込みです</div>
                )}
                {a.req.status === 'impossible' && (
                  <div className="mt-1 text-sm text-red-700">運用できる資産も積立もないため計算できません。</div>
                )}
                {a.req.status === 'invalid' && (
                  <div className="mt-1 text-sm text-red-700">目標年齢は現在の年齢より大きくしてください。</div>
                )}
                <div className="mt-3 text-xs text-slate-500">
                  {a.goal.currentAge}歳 → {a.goal.targetAge}歳（{a.years}年）／元手 {yen(a.investable)}
                  {a.goal.monthlyContribution > 0 && ` ＋ 毎月 ${yen(a.goal.monthlyContribution)} 積立`}
                </div>
              </div>

              <div className="card">
                <div className="text-xs text-slate-500">今のままだと {a.goal.targetAge}歳時点で</div>
                <div className="mt-1 text-3xl font-bold tracking-tight">{yen(a.projected)}</div>
                <div className="mt-1 text-xs text-slate-500">
                  現在の資産構成の想定利回り {pct(a.currentRate)}（評価額加重平均）で試算
                </div>
                <div className={`mt-3 text-sm font-medium ${a.gapAtTarget > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {a.gapAtTarget > 0 ? `目標まで ${yen(a.gapAtTarget)} 不足` : `目標を ${yen(-a.gapAtTarget)} 上回る見込み`}
                </div>
              </div>
            </div>

            {a.level === 'unrealistic' && (
              <div className="mt-3">
                <Notice tone="danger">
                  <div className="font-semibold">この目標は、今の前提では現実的ではありません。</div>
                  <div className="mt-1">
                    「目標を諦める」のではなく前提を動かしてみましょう。積立額を増やす／目標年齢を延ばす／目標額を見直す、のどれが効くかを
                    <Link to="/goal" className="underline">目標ページのスライダー</Link>で試せます。
                  </div>
                </Notice>
              </div>
            )}
            {a.level === 'hard' && (
              <div className="mt-3">
                <Notice tone="warn">
                  国内の一般的な商品では届きにくい利回りです。積立額や目標年齢を少し動かすだけで必要利回りが大きく下がることがあります。
                  <Link to="/goal" className="ml-1 underline">試してみる</Link>
                </Notice>
              </div>
            )}
          </Section>

          <Section title="資産の内訳">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="card">
                <div className="h-56">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                        {pieData.map((d) => (
                          <Cell key={d.key} fill={COLORS[d.key]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => yen(v)} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <div className="mb-2 text-xs text-slate-500">目標までの推移（試算）</div>
                <div className="h-52">
                  <ResponsiveContainer>
                    <LineChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                      <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => yen(v).replace('円', '')} width={56} />
                      <Tooltip formatter={(v: number) => yen(v)} labelFormatter={(l) => `${l}歳`} />
                      <Line type="monotone" dataKey="current" name="今のペース" stroke="#64748b" dot={false} strokeWidth={2} />
                      {a.requiredRate !== null && (
                        <Line type="monotone" dataKey="required" name="必要なペース" stroke="#1f8a70" dot={false} strokeWidth={2} strokeDasharray="5 4" />
                      )}
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {todo.length > 0 && (
        <Section title="次にやること">
          <ul className="card divide-y divide-slate-100 p-0">
            {todo.map((t) => (
              <li key={t.text}>
                <Link to={t.to} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50">
                  <span>{t.text}</span>
                  <span className="text-slate-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
