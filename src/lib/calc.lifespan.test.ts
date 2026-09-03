import { describe, expect, it } from 'vitest'
import { assetLifespan, requiredReturn } from './calc'

const MAN = 10_000
const base = { age: 78, assets: 1600 * MAN, incomeYearly: 11 * MAN * 12, expenseYearly: 18 * MAN * 12 }

describe('assetLifespan — 検算データ（SPEC v2.1 §3.3）', () => {
  it('78歳・1,600万・年金11万・支出18万・運用0% → 98歳', () => {
    const r = assetLifespan(base)
    expect(r.status).toBe('ok')
    if (r.status === 'ok') expect(r.age).toBe(98)
  })
  it('85歳から施設（月+10万） → 90歳', () => {
    const r = assetLifespan({ ...base, facilityFromAge: 85, facilityExtraYearly: 10 * MAN * 12 })
    expect(r.status).toBe('ok')
    if (r.status === 'ok') expect(r.age).toBe(90)
  })
  it('施設＋家1,800万×0.7 を85歳で活用 → 97歳', () => {
    const r = assetLifespan({ ...base, facilityFromAge: 85, facilityExtraYearly: 120 * MAN, homeValue: 1800 * MAN * 0.7 })
    expect(r.status).toBe('ok')
    if (r.status === 'ok') expect(r.age).toBe(97)
  })
  it('施設＋家 係数1.0 → 99歳', () => {
    const r = assetLifespan({ ...base, facilityFromAge: 85, facilityExtraYearly: 120 * MAN, homeValue: 1800 * MAN })
    expect(r.status).toBe('ok')
    if (r.status === 'ok') expect(r.age).toBe(99)
  })
  it('支出 ≦ 収入・施設なし → never', () => {
    const r = assetLifespan({ ...base, expenseYearly: 10 * MAN * 12 })
    expect(r.status).toBe('never')
  })
  it('資産0・支出＞収入 → deficit（月7万）', () => {
    const r = assetLifespan({ ...base, assets: 0 })
    expect(r.status).toBe('deficit')
    if (r.status === 'deficit') expect(Math.round(r.monthlyGap / MAN)).toBe(7)
  })
  it('series は年齢の昇順で、最後の点で 0 になる', () => {
    const r = assetLifespan(base)
    if (r.status !== 'ok') throw new Error('expected ok')
    expect(r.series[0]).toEqual({ age: 78, assets: 1600 * MAN })
    expect(r.series[r.series.length - 1].age).toBe(98)
    expect(r.series[r.series.length - 1].assets).toBe(0)
  })
})

describe('二世代モードの合算（親の預金を将来受け取る前提）', () => {
  it('58歳・1,200万＋月5万・7年・2,500万 → 約7.3%', () => {
    const r = requiredReturn(1200 * MAN, 5 * MAN, 7, 2500 * MAN)
    expect(r.status).toBe('ok')
    if (r.status === 'ok') expect(Math.abs(r.rate - 0.073)).toBeLessThan(0.001)
  })
  it('親の1,500万を加算 → 運用なしで達成', () => {
    const r = requiredReturn(2700 * MAN, 5 * MAN, 7, 2500 * MAN)
    expect(r.status).toBe('achieved')
  })
})

describe('目標モード（バイト）', () => {
  it('22歳・30万・月1万・43年・2,000万 → 約5.0%', () => {
    const r = requiredReturn(30 * MAN, 1 * MAN, 43, 2000 * MAN)
    if (r.status !== 'ok') throw new Error('expected ok')
    expect(Math.abs(r.rate - 0.05)).toBeLessThan(0.001)
  })
  it('月2万 → 約2.7%、40歳開始 → 約7.9%', () => {
    const a = requiredReturn(30 * MAN, 2 * MAN, 43, 2000 * MAN)
    const b = requiredReturn(30 * MAN, 2 * MAN, 25, 2000 * MAN)
    if (a.status !== 'ok' || b.status !== 'ok') throw new Error('expected ok')
    expect(Math.abs(a.rate - 0.027)).toBeLessThan(0.001)
    expect(Math.abs(b.rate - 0.079)).toBeLessThan(0.001)
  })
})
