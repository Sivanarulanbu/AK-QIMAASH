import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: ToastMessage[]
  toast: (message: Omit<ToastMessage, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 3500 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastMessage = { id, title, description, variant, duration }

      setToasts((prev) => [...prev.slice(-3), newToast]) // keep at most 4 active toasts

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }
    },
    [dismiss]
  )

  const success = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'success' }),
    [toast]
  )
  const error = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'error' }),
    [toast]
  )
  const info = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'info' }),
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-toast flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-brand-black/95 text-brand-white rounded-md shadow-lg backdrop-blur-md border border-brand-graphite/40 transition-all duration-300 animate-slide-up"
            role="status"
          >
            {t.variant === 'success' && <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
            {t.variant === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />}
            {t.variant === 'info' && <Info className="h-4 w-4 text-brand-silver flex-shrink-0 mt-0.5" />}
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium tracking-wide uppercase font-sans text-brand-white">{t.title}</p>
              {t.description && (
                <p className="text-xs text-brand-silver mt-0.5 font-light leading-relaxed">{t.description}</p>
              )}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="text-brand-silver hover:text-brand-white transition-colors p-0.5 -mr-1 -mt-1"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
