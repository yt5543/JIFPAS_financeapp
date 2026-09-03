/**
 * フェーズ2プレビュー用の商品モックデータ。
 * 本番では管理者側の商品マスタ（DB）から取得する。
 * ⚠ ここに載せる内容は「参考情報」であり推奨ではない。実商品の掲載可否はJIFPAS側判断。
 */
export type RiskKind = 'issuer' | 'fx' | 'principal' | 'liquidity' | 'market' | 'complexity' | 'inflation'

export const RISK_LABEL: Record<RiskKind, string> = {
  issuer: '発行体リスク',
  fx: '為替リスク',
  principal: '元本割れリスク',
  liquidity: '流動性リスク',
  market: '価格変動リスク',
  complexity: '仕組みの複雑さ',
  inflation: 'インフレ負けリスク',
}

export interface ProductRisk {
  kind: RiskKind
  level: 1 | 2 | 3 // 1=低 2=中 3=高
  note: string
}

export interface Product {
  id: string
  name: string
  type: string
  /** 想定利回り（%／年） */
  expectedReturn: number
  currency: string
  termYears: number | null
  capitalProtected: boolean
  summary: string
  risks: ProductRisk[]
  notSuitedFor: string[]
  status: 'open' | 'closed' | 'reference'
}

export const PRODUCTS: Product[] = [
  {
    id: 'p-deposit',
    name: '円定期預金',
    type: '預金',
    expectedReturn: 0.3,
    currency: 'JPY',
    termYears: 1,
    capitalProtected: true,
    summary: '元本保証（預金保険の範囲内）。利回りは極めて低い。',
    risks: [
      { kind: 'inflation', level: 3, note: '物価上昇率を下回ると実質的に目減りする' },
      { kind: 'issuer', level: 1, note: '1金融機関あたり1,000万円までは預金保険で保護' },
    ],
    notSuitedFor: ['5%以上の利回りが必要な人'],
    status: 'reference',
  },
  {
    id: 'p-index',
    name: '全世界株式インデックスファンド',
    type: '投資信託',
    expectedReturn: 5,
    currency: 'JPY（実質は外貨建て）',
    termYears: null,
    capitalProtected: false,
    summary: '低コストで世界中の株式に分散。長期の期待リターンは年4〜6%程度が一般的な想定。',
    risks: [
      { kind: 'market', level: 3, note: '短期では▲30〜50%の下落も起こり得る' },
      { kind: 'fx', level: 2, note: '円高局面では円換算の価値が下がる' },
      { kind: 'principal', level: 2, note: '元本保証はない' },
    ],
    notSuitedFor: ['数年以内に使う予定のお金', '値動きを見て売ってしまいそうな人'],
    status: 'reference',
  },
  {
    id: 'p-note-protected',
    name: '100%元本保護型ストラクチャードノート（参考例）',
    type: '仕組み債',
    expectedReturn: 8.6,
    currency: 'USD',
    termYears: 6,
    capitalProtected: true,
    summary:
      '4つの株価指数が判定日に基準値以上なら早期償還され、経過年数分の利息が付く。最終判定日まで条件を満たさない場合は元本のみ返還（利息ゼロ）。※議事録の口頭説明ベース・一次資料未照合',
    risks: [
      { kind: 'issuer', level: 3, note: '元本保護は発行体の保証。発行体が破綻すれば元本も失う可能性' },
      { kind: 'fx', level: 3, note: 'USD建て。円換算では為替で損益が出る' },
      { kind: 'liquidity', level: 3, note: '最長6年間資金が拘束される可能性。途中売却は不利になりやすい' },
      { kind: 'complexity', level: 3, note: '4指数の判定・オートコール条件を理解する必要がある' },
    ],
    notSuitedFor: ['途中で現金化する可能性がある人', '為替の変動を許容できない人', '仕組みを説明できない状態で買う人'],
    status: 'closed',
  },
  {
    id: 'p-note-fixed',
    name: '利息確定型ストラクチャードノート・元本保護なし（参考例）',
    type: '仕組み債',
    expectedReturn: 6.85,
    currency: 'USD',
    termYears: 3,
    capitalProtected: false,
    summary:
      '3年間、四半期ごとに確定利息。満期判定日に3指数すべてが基準の65%以上なら元本100%償還（ヨーロピアンスタイル＝期中の一時的な下落はセーフ）。※議事録の口頭説明ベース・一次資料未照合',
    risks: [
      { kind: 'principal', level: 3, note: '判定日に1指数でも35%超下落していると元本割れ' },
      { kind: 'issuer', level: 3, note: '発行体の破綻リスク' },
      { kind: 'fx', level: 3, note: 'USD建て' },
      { kind: 'complexity', level: 2, note: 'ヨーロピアン／アメリカンの違いが結果を大きく左右する' },
    ],
    notSuitedFor: ['元本割れを一切許容できない人', '3年間資金を動かせない事情がある人'],
    status: 'closed',
  },
  {
    id: 'p-reit',
    name: '国内REIT（不動産投資信託）',
    type: '投資信託・ETF',
    expectedReturn: 4,
    currency: 'JPY',
    termYears: null,
    capitalProtected: false,
    summary: '賃料収入を原資とする分配金が中心。株式より値動きは穏やかな傾向だが元本保証はない。',
    risks: [
      { kind: 'market', level: 2, note: '金利上昇局面で価格が下がりやすい' },
      { kind: 'principal', level: 2, note: '元本保証はない' },
    ],
    notSuitedFor: ['分配金を再投資せず使ってしまう人'],
    status: 'reference',
  },
]
