import { useEffect, useRef, useState } from 'react'

/** 一つの数字。40px以上。カウントアップは reduced-motion を尊重 */
export function HeroNumber({ before, num, unit, after, tone = 'brand' }: { before: string; num: string; unit: string; after: string; tone?: 'brand' | 'danger' }) {
  const target = Number(num)
  const animatable = Number.isFinite(target)
  const [shown, setShown] = useState<number>(animatable ? 0 : NaN)
  const prev = useRef<number>(0)

  useEffect(() => {
    if (!animatable) return
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setShown(target)
      prev.current = target
      return
    }
    const from = prev.current
    const start = performance.now()
    const dur = 900
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(Math.round(from + (target - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, animatable])

  const color = tone === 'danger' ? 'text-red-700' : 'text-brand-700'
  return (
    <div className="text-center" aria-live="polite">
      <div className="text-base text-slate-600">{before}</div>
      <div className={`mt-1 font-bold tabular-nums leading-none ${color}`} style={{ fontSize: 'clamp(44px, 14vw, 72px)' }}>
        {animatable ? shown : num}
        <span className="ml-1 text-2xl font-semibold">{unit}</span>
      </div>
      <div className="mt-2 text-base text-slate-600">{after}</div>
    </div>
  )
}
