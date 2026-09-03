import { describe, expect, it } from 'vitest'
import { classifyReturn, futureValue, investableTotal, requiredReturn, weightedExpectedReturn } from './calc'
import type { Asset } from './types'

const MAN = 10_000

describe('futureValue', () => {
  it('r=0 は単純合計', () => {
    expect(futureValue(100, 10, 2, 0)).toBe(100 + 10 * 24)
  })
  it('年10%を10年で約2.6〜2.7倍（議事録の目安）', () => {
    const fv = futureValue(100, 0, 10, 0.1)
    expect(fv / 100).toBeGreaterThan(2.55)
    expect(fv / 100).toBeLessThan(2.75)
  })
})

describe('requiredReturn — 議事録 §3 の試算例（元手1,000万円→65歳で1億円）', () => {
  const P = 1000 * MAN
  const G = 10000 * MAN
  // 10倍を n 年で達成する年複利 = 10^(1/n) − 1
  // 30歳(35年)=6.80%, 40歳(25年)=9.65%, 50歳(15年)=16.59%
  // ※議事録の「50歳=約25%」は口頭概算の誤り。正しくは約16.6%（それでも非現実的な水準）
  const cases: Array<[age: number, expected: number]> = [
    [30, Math.pow(10, 1 / 35) - 1],
    [40, Math.pow(10, 1 / 25) - 1],
    [50, Math.pow(10, 1 / 15) - 1],
  ]
  for (const [age, expected] of cases) {
    it(`${age}歳スタート ≒ ${(expected * 100).toFixed(2)}%`, () => {
      const res = requiredReturn(P, 0, 65 - age, G)
      expect(res.status).toBe('ok')
      if (res.status === 'ok') {
        expect(Math.abs(res.rate - expected)).toBeLessThan(0.0005)
      }
    })
  }
  it('議事録の目安値（30歳≒6.8%、40歳≒9.7%）と一致する', () => {
    const r30 = requiredReturn(P, 0, 35, G)
    const r40 = requiredReturn(P, 0, 25, G)
    if (r30.status !== 'ok' || r40.status !== 'ok') throw new Error('unexpected')
    expect(Math.abs(r30.rate - 0.068)).toBeLessThan(0.001)
    expect(Math.abs(r40.rate - 0.097)).toBeLessThan(0.001)
  })
  it('30歳・年10%なら元手350万円で足りる（議事録）', () => {
    const fv = futureValue(350 * MAN, 0, 35, 0.1)
    expect(fv).toBeGreaterThan(G * 0.95)
  })
})

describe('requiredReturn — 境界ケース', () => {
  it('期間0以下は invalid', () => {
    expect(requiredReturn(100, 0, 0, 200).status).toBe('invalid')
  })
  it('元手も積立もない場合は impossible', () => {
    expect(requiredReturn(0, 0, 10, 200).status).toBe('impossible')
  })
  it('利回り0%でも届くなら achieved', () => {
    expect(requiredReturn(100, 10, 1, 150).status).toBe('achieved')
  })
  it('積立を増やすと必要利回りが下がる', () => {
    const a = requiredReturn(1000 * MAN, 0, 25, 10000 * MAN)
    const b = requiredReturn(1000 * MAN, 5 * MAN, 25, 10000 * MAN)
    if (a.status === 'ok' && b.status === 'ok') expect(b.rate).toBeLessThan(a.rate)
    else throw new Error('unexpected status')
  })
})

describe('資産集計', () => {
  const assets: Asset[] = [
    { id: '1', name: '預金', category: 'cash', value: 300 * MAN, investable: true, expectedReturn: 0 },
    { id: '2', name: '投信', category: 'securities', value: 700 * MAN, investable: true, expectedReturn: 5 },
    { id: '3', name: '自宅', category: 'realestate', value: 3000 * MAN, investable: false, realEstateUse: 'home' },
  ]
  it('自宅は運用対象合計から除外される', () => {
    expect(investableTotal(assets)).toBe(1000 * MAN)
  })
  it('加重平均利回りは評価額で重み付け', () => {
    expect(weightedExpectedReturn(assets)).toBeCloseTo(0.035, 6)
  })
})

describe('classifyReturn', () => {
  it('15%以上は unrealistic', () => {
    expect(classifyReturn(0.166)).toBe('unrealistic')
    expect(classifyReturn(0.097)).toBe('hard')
    expect(classifyReturn(0.068)).toBe('moderate')
    expect(classifyReturn(0.03)).toBe('easy')
  })
})
