import { Navigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import { useStore } from '../store'

/** `/`：未診断・未登録なら入口へ。既存ユーザーは従来のダッシュボード */
export default function Home() {
  const prep = useStore((s) => s.prep)
  const assets = useStore((s) => s.assets)
  if (!prep && assets.length === 0) return <Navigate to="/start" replace />
  return <Dashboard />
}
