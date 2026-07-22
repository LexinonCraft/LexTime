import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { routeTree } from './routeTree.gen'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { ensureDbInitialized } from '@/lib/bootstrap'
import { ToastProvider } from '@/components/ui/toast'

// Set up a Router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  basepath: import.meta.env.BASE_URL
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ensureDbInitialized()
  .catch((error) => {
    console.error("Failed to initialize local database", error)
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </StrictMode>,
    )
  })
