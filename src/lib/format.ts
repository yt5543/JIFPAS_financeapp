/** 円を「1,234万円」「1.2億円」形式に */
export function yen(v: number): string {
  if (!isFinite(v)) return '—'
  const abs = Math.abs(v)
  const sign = v < 0 ? '−' : ''
  if (abs >= 1_0000_0000) return `${sign}${(abs / 1_0000_0000).toFixed(2).replace(/\.?0+$/, '')}億円`
  if (abs >= 1_0000) return `${sign}${Math.round(abs / 1_0000).toLocaleString('ja-JP')}万円`
  return `${sign}${Math.round(abs).toLocaleString('ja-JP')}円`
}

export function pct(rate: number, digits = 1): string {
  if (!isFinite(rate)) return '—'
  return `${(rate * 100).toFixed(digits)}%`
}

export function dateJa(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
