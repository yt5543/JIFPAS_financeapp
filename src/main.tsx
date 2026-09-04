import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Assets from './pages/Assets'
import GoalPage from './pages/Goal'
import Review from './pages/Review'
import Settings from './pages/Settings'
import Start from './pages/Start'
import Prep from './pages/Prep'
import PrepResult from './pages/PrepResult'
import Consult from './pages/Consult'
import Share from './pages/Share'
import Privacy from './pages/Privacy'
import { setRefFromUrl } from './lib/ref'
import './index.css'

setRefFromUrl()

// HashRouter: Cloudflare Pages 等の静的ホスティングでリロードしても 404 にならない
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'start', element: <Start /> },
      { path: 'prep', element: <Prep /> },
      { path: 'prep/result', element: <PrepResult /> },
      { path: 'consult', element: <Consult /> },
      { path: 'share', element: <Share /> },
      { path: 'assets', element: <Assets /> },
      { path: 'goal', element: <GoalPage /> },
      { path: 'review', element: <Review /> },
      { path: 'settings', element: <Settings /> },
      { path: 'privacy', element: <Privacy /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
