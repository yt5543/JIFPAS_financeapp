import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { copy } from '../lib/copy'
import { newPrep } from '../lib/defaults'
import { trackOpenOnce } from '../lib/events'
import { useStore } from '../store'

export default function Start() {
  const nav = useNavigate()
  const setPrep = useStore((s) => s.setPrep)
  const [who, setWho] = useState<'self' | 'parent' | null>(null)
  const [age, setAge] = useState<string>('')

  useEffect(() => {
    trackOpenOnce()
  }, [])

  const go = () => {
    const a = Math.max(18, Math.min(110, Number(age) || 0))
    if (!a) return
    if (who === 'self' && a < 60) {
      nav('/goal')
      return
    }
    setPrep(newPrep(who ?? 'parent', a))
    nav('/prep')
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="text-center text-2xl font-bold leading-snug">{copy.start.title}</h1>
      <p className="mt-2 text-center text-base text-slate-600">{copy.start.lead}</p>

      {!who && (
        <div className="mt-8 grid gap-3">
          <button className="btn-primary py-4 text-lg" onClick={() => setWho('self')}>{copy.start.self}</button>
          <button className="btn-ghost py-4 text-lg" onClick={() => setWho('parent')}>{copy.start.parent}</button>
        </div>
      )}

      {who && (
        <div className="card mt-8">
          <label className="block text-base font-medium">{copy.prep.q1(who === 'parent')}</label>
          <div className="mt-3 flex items-center gap-2">
            <input
              className="input text-2xl"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={who === 'parent' ? '78' : '65'}
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && go()}
              autoFocus
            />
            <span className="text-lg">歳</span>
          </div>
          <div className="mt-4 flex justify-between">
            <button className="btn-ghost" onClick={() => setWho(null)}>戻る</button>
            <button className="btn-primary px-6" onClick={go} disabled={!age}>次へ</button>
          </div>
        </div>
      )}
    </div>
  )
}
