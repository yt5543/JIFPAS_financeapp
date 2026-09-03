import { NavLink, Outlet } from 'react-router-dom'
import { DemoBanner } from './components/DemoBanner'
import { DEMO } from './store'

const NAV = [
  { to: '/', label: 'ホーム', icon: '◎' },
  { to: '/assets', label: '資産', icon: '▦' },
  { to: '/goal', label: '目標', icon: '◇' },
  { to: '/review', label: '見直し', icon: '↻' },
  { to: '/settings', label: '設定', icon: '⚙' },
]

export default function App() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {DEMO && <DemoBanner />}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-lg font-bold tracking-tight text-brand-700">ミエルカ</div>
            <div className="text-[11px] text-slate-500">資産と未来を、見える化する。</div>
          </div>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        <Outlet />
        <p className="mt-10 text-center text-[11px] leading-relaxed text-slate-400">
          本アプリの数値はすべてご入力内容に基づく試算であり、将来の成果を保証するものではありません。
          特定の金融商品の推奨・勧誘は行いません。
        </p>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-slate-200 bg-white md:hidden">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 text-[11px] ${isActive ? 'font-semibold text-brand-700' : 'text-slate-500'}`
            }
          >
            <span className="text-base leading-none">{n.icon}</span>
            <span className="mt-0.5">{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
