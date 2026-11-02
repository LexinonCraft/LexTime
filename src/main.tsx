import './index.css'

import { StrictMode } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { ToastProvider } from '@/components/ui/toast'
import { ensureDbInitialized } from '@/lib/bootstrap'

import { routeTree } from './routeTree.gen'

// Set up a Router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
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
          <NiceModal.Provider>
            <RouterProvider router={router} />
          </NiceModal.Provider>
        </ToastProvider>
      </StrictMode>,
    )
  })
