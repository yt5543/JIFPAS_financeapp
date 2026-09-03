const KEY = 'mieruka-ref'

/** 紹介コード（案内人単位、例: nakano-01）。英数字とハイフンのみ、32文字まで */
export function sanitizeRef(v: string | null | undefined): string {
  return (v ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32)
}

export function isDemo(): boolean {
  if (typeof location === 'undefined') return false
  return new URLSearchParams(location.search).has('demo')
}

/** URL の ?ref= を localStorage に保存する（デモ時は保存しない）。起動時に一度呼ぶ */
export function setRefFromUrl(): void {
  if (typeof location === 'undefined' || isDemo()) return
  const ref = sanitizeRef(new URLSearchParams(location.search).get('ref'))
  if (ref) {
    try {
      localStorage.setItem(KEY, ref)
    } catch {
      /* ignore */
    }
  }
}

export function getRef(): string {
  if (isDemo()) return sanitizeRef(new URLSearchParams(location.search).get('ref'))
  try {
    return sanitizeRef(localStorage.getItem(KEY))
  } catch {
    return ''
  }
}

/** 屋号部分（`nakano-01` → `nakano`） */
export function refOwner(ref: string): string {
  return ref.split('-')[0] ?? ''
}
