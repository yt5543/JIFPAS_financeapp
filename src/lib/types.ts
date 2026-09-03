export type AssetCategory = 'cash' | 'securities' | 'realestate' | 'insurance' | 'other'
export type RealEstateUse = 'home' | 'rental' | 'other'

export const CATEGORY_LABEL: Record<AssetCategory, string> = {
  cash: '現金・預金',
  securities: '有価証券',
  realestate: '不動産',
  insurance: '保険',
  other: 'その他（金・暗号資産等）',
}

export const REALESTATE_USE_LABEL: Record<RealEstateUse, string> = {
  home: '自宅（運用不可）',
  rental: '賃貸中・貸出可能',
  other: 'その他',
}

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  /** 評価額（円） */
  value: number
  /** 想定利回り（%／年）。未設定は undefined */
  expectedReturn?: number
  /** 運用対象に含めるか */
  investable: boolean
  /** 不動産のみ */
  realEstateUse?: RealEstateUse
  memo?: string
}

export interface Goal {
  currentAge: number
  targetAge: number
  /** 目標金額（円） */
  targetAmount: number
  /** 毎月の積立額（円） */
  monthlyContribution: number
}

export interface Snapshot {
  id: string
  takenAt: string // ISO date
  totalAssets: number
  investableAssets: number
  requiredReturn: number | null
  projectedAtTarget: number
  byCategory: Record<AssetCategory, number>
}

/* ---------- v2: 準備モード（資産寿命） ---------- */

export type Mode = 'prep' | 'twogen' | 'goal'

/** 預金の桁（万円）。値は選択肢の上限。5000 は「3,000万円以上」 */
export type CashBand = 500 | 1000 | 2000 | 3000 | 5000
/** 家（土地建物）の桁（万円）。0 は持ち家なし／わからない */
export type HomeBand = 0 | 1000 | 2000 | 3000 | 5000

export interface Prep {
  /** 誰の診断か */
  forWhom: 'self' | 'parent'
  /** 本人（親）の年齢 */
  age: number
  /** 毎月の年金など収入（円） */
  pensionMonthly: number
  /** 毎月の支出（円） */
  expenseMonthly: number
  /** 預金の桁 */
  cashBand: CashBand
  /** 桁ではなく正確に入れた場合の預金額（円）。未設定なら桁の代表値を使う */
  cashExact?: number
  /** 家の桁（任意） */
  homeValueBand?: HomeBand
  /** 85歳から施設に入る前提 */
  facilityOn: boolean
  facilityFromAge: number
  /** 施設に入ったときの毎月の追加支出（円） */
  facilityExtraMonthly: number
  /** 家を活用する（売却・貸出の概算） */
  useHomeOn: boolean
  /** 取り崩し資産の運用利回り（小数）。既定 0 */
  rate: number
}

/** 負債（P1） */
export interface Liability {
  id: string
  name: string
  balance: number
  memo?: string
}
