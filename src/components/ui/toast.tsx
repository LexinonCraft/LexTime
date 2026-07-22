import { createContext, useCallback, useContext, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

interface ToastItem {
  id: string
  message: string
}

interface ToastContextValue {
  showToast: (message: string) => void
  dismissToast: (id: string) => void
  toasts: ToastItem[]
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

    setToasts((current) => [...current, { id, message }])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2800)
  }, [])

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      toasts,
    }),
    [dismissToast, showToast, toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  return context
}

export function ToastViewport({ navbarVisible }: { navbarVisible: boolean }) {
  const { toasts, dismissToast } = useToast()

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-0 right-0 z-40 flex flex-col items-center gap-2 px-3 transition-all",
        navbarVisible ? "bottom-24" : "bottom-4",
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="pointer-events-auto w-full max-w-md rounded-lg bg-foreground px-4 py-3 text-left text-sm text-background shadow-lg"
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}
