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
