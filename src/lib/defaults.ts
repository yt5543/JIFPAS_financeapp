import type { CashBand, HomeBand, Prep } from './types'

const MAN = 10_000

/** 「家を活用」の概算係数。売却諸費用・値引き・解体等を見込んで安全側。★不動産会社の意見で更新 */
export const HOME_FACTOR = 0.7
/** 施設に入る既定の年齢と、そのときの毎月の追加支出 */
export const FACILITY_FROM_AGE = 85
export const FACILITY_EXTRA_MONTHLY = 10 * MAN
/** これを超えても尽きなければ「尽きません」扱い */
export const MAX_AGE = 105

/**
 * 年代別の初期値（毎月の年金・支出）。
 * ★暫定値。出典（家計調査・年金受給額の平均）を確認して更新する。ここ1か所だけ直せばよい。
 */
export function defaultsForAge(age: number): { pensionMonthly: number; expenseMonthly: number } {
  if (age >= 80) return { pensionMonthly: 10 * MAN, expenseMonthly: 16 * MAN }
  if (age >= 70) return { pensionMonthly: 11 * MAN, expenseMonthly: 18 * MAN }
  if (age >= 60) return { pensionMonthly: 14 * MAN, expenseMonthly: 22 * MAN }
  return { pensionMonthly: 0, expenseMonthly: 25 * MAN }
}

export const CASH_BANDS: { value: CashBand; label: string; representative: number }[] = [
  { value: 500, label: '〜500万円', representative: 300 * MAN },
  { value: 1000, label: '500〜1,000万円', representative: 750 * MAN },
  { value: 2000, label: '1,000〜2,000万円', representative: 1500 * MAN },
  { value: 3000, label: '2,000〜3,000万円', representative: 2500 * MAN },
  { value: 5000, label: '3,000万円以上', representative: 4000 * MAN },
]

export const HOME_BANDS: { value: HomeBand; label: string; representative: number }[] = [
  { value: 0, label: '持ち家なし／わからない', representative: 0 },
  { value: 1000, label: '〜1,000万円', representative: 700 * MAN },
  { value: 2000, label: '1,000〜2,000万円', representative: 1500 * MAN },
  { value: 3000, label: '2,000〜3,000万円', representative: 2500 * MAN },
  { value: 5000, label: '3,000万円以上', representative: 4000 * MAN },
]

export function cashAmount(p: Pick<Prep, 'cashBand' | 'cashExact'>): number {
  if (p.cashExact !== undefined && p.cashExact >= 0) return p.cashExact
  return CASH_BANDS.find((b) => b.value === p.cashBand)?.representative ?? 0
}

export function homeAmount(p: Pick<Prep, 'homeValueBand'>): number {
  return HOME_BANDS.find((b) => b.value === (p.homeValueBand ?? 0))?.representative ?? 0
}

export function newPrep(forWhom: Prep['forWhom'], age: number): Prep {
  const d = defaultsForAge(age)
  return {
    forWhom,
    age,
    pensionMonthly: d.pensionMonthly,
    expenseMonthly: d.expenseMonthly,
    cashBand: 2000,
    facilityOn: false,
    facilityFromAge: FACILITY_FROM_AGE,
    facilityExtraMonthly: FACILITY_EXTRA_MONTHLY,
    useHomeOn: false,
    rate: 0,
  }
}

/** デモモード用の架空の人物（案内人が家主の前で見せる。実データは絶対に入れない） */
export const DEMO_PREP: Prep = {
  forWhom: 'parent',
  age: 78,
  pensionMonthly: 11 * MAN,
  expenseMonthly: 18 * MAN,
  cashBand: 2000,
  cashExact: 1600 * MAN,
  homeValueBand: 2000,
  facilityOn: false,
  facilityFromAge: FACILITY_FROM_AGE,
  facilityExtraMonthly: FACILITY_EXTRA_MONTHLY,
  useHomeOn: false,
  rate: 0,
}
