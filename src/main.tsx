import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import GoalPage from './pages/Goal'
import Review from './pages/Review'
import Products from './pages/Products'
import Settings from './pages/Settings'
import './index.css'

// HashRouter: Cloudflare Pages 等の静的ホスティングでリロードしても 404 にならない
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'assets', element: <Assets /> },
      { path: 'goal', element: <GoalPage /> },
      { path: 'review', element: <Review /> },
      { path: 'products', element: <Products /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
