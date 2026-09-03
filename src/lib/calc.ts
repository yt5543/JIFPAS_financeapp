import type { Asset, AssetCategory } from './types'

/**
 * 将来価値。
 * 利回り r は「年複利の実効利回り」（一般に言う年利回り・CAGR）。
 * 積立は毎月末に行い、月利は i = (1+r)^(1/12) − 1 で年複利と整合させる。
 * FV = P·(1+r)^n + m·[((1+i)^(12n) − 1)/i]
 * @param principal 現在の運用可能資産（円）
 * @param monthly 毎月の積立（円）
 * @param years 年数
 * @param annualRate 年利（小数。0.05 = 5%）
 */
export function futureValue(principal: number, monthly: number, years: number, annualRate: number): number {
  const months = Math.round(years * 12)
  if (months <= 0) return principal
  if (Math.abs(annualRate) < 1e-12) return principal + monthly * months
  const i = Math.pow(1 + annualRate, 1 / 12) - 1
  const growth = Math.pow(1 + i, months)
  return principal * growth + monthly * ((growth - 1) / i)
}

export type RequiredReturnResult =
  | { status: 'ok'; rate: number }
  | { status: 'achieved' } // 利回り0%でも達成可能
  | { status: 'impossible' } // 元手も積立もない
  | { status: 'invalid' } // 期間が0以下など

/**
 * 目標金額に到達するために必要な年利回りを二分法で求める。
 * 返り値の rate は小数（0.068 = 6.8%）。探索範囲 0〜100%。
 */
export function requiredReturn(
  principal: number,
  monthly: number,
  years: number,
  target: number,
): RequiredReturnResult {
  if (years <= 0 || target <= 0) return { status: 'invalid' }
  if (principal <= 0 && monthly <= 0) return { status: 'impossible' }
  if (futureValue(principal, monthly, years, 0) >= target) return { status: 'achieved' }

  let lo = 0
  let hi = 1.0
  if (futureValue(principal, monthly, years, hi) < target) {
    // 100%でも届かない場合は上限を返す（表示側で「非現実的」扱い）
    return { status: 'ok', rate: hi }
  }
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2
    if (futureValue(principal, monthly, years, mid) >= target) hi = mid
    else lo = mid
    if (hi - lo < 1e-9) break
  }
  return { status: 'ok', rate: hi }
}

/** 運用対象資産の合計 */
export function investableTotal(assets: Asset[]): number {
  return assets.filter((a) => a.investable).reduce((s, a) => s + a.value, 0)
}

/** 全資産の合計 */
export function totalAssets(assets: Asset[]): number {
  return assets.reduce((s, a) => s + a.value, 0)
}

/** 運用対象資産の評価額加重平均利回り（小数）。利回り未設定は0%として扱う */
export function weightedExpectedReturn(assets: Asset[]): number {
  const inv = assets.filter((a) => a.investable)
  const total = inv.reduce((s, a) => s + a.value, 0)
  if (total <= 0) return 0
  const weighted = inv.reduce((s, a) => s + a.value * ((a.expectedReturn ?? 0) / 100), 0)
  return weighted / total
}

export function sumByCategory(assets: Asset[]): Record<AssetCategory, number> {
  const out: Record<AssetCategory, number> = {
    cash: 0,
    securities: 0,
    realestate: 0,
    insurance: 0,
    other: 0,
  }
  for (const a of assets) out[a.category] += a.value
  return out
}

/** 必要利回りの評価レベル */
export type ReturnLevel = 'easy' | 'moderate' | 'hard' | 'unrealistic'
/**
 * 目安: 4%未満=無理なく／4〜8%=分散投資で現実的／8〜15%=高リスクを取る必要／15%以上=長期継続は非現実的
 */
export function classifyReturn(rate: number): ReturnLevel {
  if (rate < 0.04) return 'easy'
  if (rate < 0.08) return 'moderate'
  if (rate < 0.15) return 'hard'
  return 'unrealistic'
}

/** 目標達成に向けた成長曲線（年ごと） */
export function growthSeries(
  principal: number,
  monthly: number,
  years: number,
  rates: { key: string; rate: number }[],
): Array<Record<string, number>> {
  const rows: Array<Record<string, number>> = []
  for (let y = 0; y <= years; y++) {
    const row: Record<string, number> = { year: y }
    for (const r of rates) row[r.key] = futureValue(principal, monthly, y, r.rate)
    rows.push(row)
  }
  return rows
}

/* ---------- v2: 資産寿命（取り崩し） ---------- */

export interface LifespanInput {
  /** 現在の年齢 */
  age: number
  /** 取り崩せる資産（円） */
  assets: number
  /** 年収入（年金など。円） */
  incomeYearly: number
  /** 年支出（円） */
  expenseYearly: number
  /** 運用利回り（小数）。既定 0 */
  rate?: number
  /** 施設に入る年齢。undefined なら施設なし */
  facilityFromAge?: number
  /** 施設に入ってからの年間追加支出（円） */
  facilityExtraYearly?: number
  /** 家を活用したときに加算される額（円）。undefined/0 なら活用しない */
  homeValue?: number
  /** 家を活用する年齢。既定は facilityFromAge、なければ現在 */
  homeAtAge?: number
  /** この年齢を超えても尽きなければ never。既定 105 */
  maxAge?: number
}

export type LifespanPoint = { age: number; assets: number }

export type LifespanResult =
  | { status: 'ok'; age: number; series: LifespanPoint[] }
  | { status: 'never'; series: LifespanPoint[] }
  | { status: 'deficit'; monthlyGap: number }

/**
 * 資産寿命。年単位で A ← A·(1+r) − (E−I) − (施設中なら F) を繰り返し、
 * A が 0 を下回った最初の年齢を返す。
 */
export function assetLifespan(i: LifespanInput): LifespanResult {
  const rate = i.rate ?? 0
  const maxAge = i.maxAge ?? 105
  const deficit = i.expenseYearly - i.incomeYearly
  const facilityFrom = i.facilityFromAge
  const facilityExtra = i.facilityExtraYearly ?? 0
  const home = i.homeValue ?? 0
  const homeAt = i.homeAtAge ?? facilityFrom ?? i.age

  if (i.assets <= 0 && deficit > 0 && home <= 0) {
    return { status: 'deficit', monthlyGap: deficit / 12 }
  }

  let a = i.assets
  let age = i.age
  const series: LifespanPoint[] = [{ age, assets: a }]
  while (age < maxAge) {
    if (home > 0 && age === homeAt) a += home
    const extra = facilityFrom !== undefined && age >= facilityFrom ? facilityExtra : 0
    a = a * (1 + rate) - deficit - extra
    age += 1
    series.push({ age, assets: Math.max(0, a) })
    if (a < 0) return { status: 'ok', age, series }
  }
  return { status: 'never', series }
}
