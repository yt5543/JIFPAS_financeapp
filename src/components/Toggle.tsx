export function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
        on ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white'
      }`}
    >
      <span>
        <span className="block text-base font-medium">{label}</span>
        {sub && <span className="block text-sm text-slate-500">{sub}</span>}
      </span>
      <span className={`ml-3 inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition ${on ? 'bg-brand-600' : 'bg-slate-300'}`}>
        <span className={`h-6 w-6 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}
