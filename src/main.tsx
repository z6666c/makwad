import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import { RouterProvider, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import './site.css'
import Home from './pages/Home'
import Login from './pages/Login'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DashboardRoute = () => <Suspense fallback={<div className="center-screen">جارٍ التحميل…</div>}><Dashboard /></Suspense>
import { Privacy, Terms } from './pages/Legal'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

const rootRoute = createRootRoute({ component: () => <Outlet /> })
const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home }),
  createRoute({ getParentRoute: () => rootRoute, path: '/login', component: Login }),
  createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: DashboardRoute }),
  createRoute({ getParentRoute: () => rootRoute, path: '/privacy', component: Privacy }),
  createRoute({ getParentRoute: () => rootRoute, path: '/terms', component: Terms }),
])

const router = createRouter({
  routeTree,
  basepath: '/',
  scrollRestoration: true,
  defaultNotFoundComponent: () => (
    <div className="center-screen">
      <div className="empty">
        <h3>الصفحة غير موجودة</h3>
        <a className="btn" href="/">العودة للرئيسية</a>
      </div>
    </div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootEl = document.getElementById('root')!
// Refuse to render inside someone else's frame (clickjacking); GitHub Pages cannot send frame headers.
const framed = (() => { try { return window.top !== window.self } catch { return true } })()
if (framed && !import.meta.env.VITE_PREVIEW) {
  rootEl.innerHTML = '<p style="padding:24px;font-family:sans-serif">افتح الموقع مباشرة: <a href="https://makwad.com/" target="_top">makwad.com</a></p>'
  throw new Error('framed')
}
if (import.meta.env.VITE_PREVIEW === '1' && window.location.pathname.endsWith('/preview')) {
  // Review build only: the dashboard with sample data, no sign-in. Never part of the production build.
  void import('./preview').then((m) => m.mount(rootEl))
} else createRoot(rootEl).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexAuthProvider>
  </StrictMode>,
)
