import { getRef, isDemo } from './ref'
import type { Mode } from './types'

export type EventName = 'open' | 'complete' | 'share' | 'consult'

/**
 * 匿名イベント。送るのは 紹介コード・モード・イベント名・時刻 のみ。
 * 失敗しても UX に影響させない。デモモードでは送らない。
 */
export function track(event: EventName, mode: Mode): void {
  if (isDemo()) return
  const body = JSON.stringify({ ref: getRef(), mode, event, ts: Date.now() })
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const ok = navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))
      if (ok) return
    }
    void fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {})
  } catch {
    /* ignore */
  }
}

const OPENED = 'mieruka-opened'
/** 初回アクセスを1回だけ数える */
export function trackOpenOnce(): void {
  if (isDemo()) return
  try {
    if (sessionStorage.getItem(OPENED)) return
    sessionStorage.setItem(OPENED, '1')
  } catch {
    /* ignore */
  }
  track('open', 'prep')
}
