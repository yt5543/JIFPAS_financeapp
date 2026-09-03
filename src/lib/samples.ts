import type { Asset, Goal } from './types'

const MAN = 10_000

export interface SampleData {
  key: string
  label: string
  description: string
  goal: Goal
  assets: Asset[]
}

/** 議事録 §3 の試算例をベースにしたデモ用データ */
export const SAMPLES: SampleData[] = [
  {
    key: 'age30',
    label: '30歳・元手1,000万円',
    description: '65歳で1億円。必要利回りは約6.8%（現実的なライン）',
    goal: { currentAge: 30, targetAge: 65, targetAmount: 10000 * MAN, monthlyContribution: 0 },
    assets: [
      { id: 's30-1', name: '普通預金', category: 'cash', value: 300 * MAN, investable: true, expectedReturn: 0 },
      { id: 's30-2', name: 'NISA（全世界株インデックス）', category: 'securities', value: 500 * MAN, investable: true, expectedReturn: 5 },
      { id: 's30-3', name: '個別株', category: 'securities', value: 200 * MAN, investable: true, expectedReturn: 6 },
    ],
  },
  {
    key: 'age40',
    label: '40歳・元手1,000万円＋自宅',
    description: '65歳で1億円。自宅3,000万円は運用対象外。必要利回りは約9.7%',
    goal: { currentAge: 40, targetAge: 65, targetAmount: 10000 * MAN, monthlyContribution: 0 },
    assets: [
      { id: 's40-1', name: '定期預金', category: 'cash', value: 400 * MAN, investable: true, expectedReturn: 0.3 },
      { id: 's40-2', name: '投資信託（バランス型）', category: 'securities', value: 600 * MAN, investable: true, expectedReturn: 4 },
      { id: 's40-3', name: '自宅マンション', category: 'realestate', value: 3000 * MAN, investable: false, realEstateUse: 'home' },
      { id: 's40-4', name: '終身保険（解約返戻金）', category: 'insurance', value: 150 * MAN, investable: false, expectedReturn: 1 },
    ],
  },
  {
    key: 'age50',
    label: '50歳・元手1,000万円',
    description: '65歳で1億円。必要利回り約16.6%（議事録の「約25%」は概算の誤り）＝ 非現実的。見直し導線のデモ用',
    goal: { currentAge: 50, targetAge: 65, targetAmount: 10000 * MAN, monthlyContribution: 0 },
    assets: [
      { id: 's50-1', name: '普通預金', category: 'cash', value: 600 * MAN, investable: true, expectedReturn: 0 },
      { id: 's50-2', name: '投資信託', category: 'securities', value: 400 * MAN, investable: true, expectedReturn: 3 },
      { id: 's50-3', name: '賃貸用ワンルーム', category: 'realestate', value: 1500 * MAN, investable: true, expectedReturn: 4, realEstateUse: 'rental' },
      { id: 's50-4', name: '金（現物）', category: 'other', value: 100 * MAN, investable: true, expectedReturn: 2 },
    ],
  },
]
