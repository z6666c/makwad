import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import { RouterProvider, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import './site.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { Privacy, Terms } from './pages/Legal'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

const rootRoute = createRootRoute({ component: () => <Outlet /> })
const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home }),
  createRoute({ getParentRoute: () => rootRoute, path: '/login', component: Login }),
  createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: Dashboard }),
  createRoute({ getParentRoute: () => rootRoute, path: '/privacy', component: Privacy }),
  createRoute({ getParentRoute: () => rootRoute, path: '/terms', component: Terms }),
])

const router = createRouter({
  routeTree,
  basepath: '/satr',
  scrollRestoration: true,
  defaultNotFoundComponent: () => (
    <div className="center-screen">
      <div className="empty">
        <h3>الصفحة غير موجودة</h3>
        <a className="btn" href="/satr/">العودة للرئيسية</a>
      </div>
    </div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexAuthProvider>
  </StrictMode>,
)
