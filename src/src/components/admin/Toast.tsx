"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { clsx } from "clsx"
import { CheckCircle, XCircle, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message: string) => showToast(message, "success"), [showToast])
  const error = useCallback((message: string) => showToast(message, "error"), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all",
              toast.type === "success" && "bg-green-50 text-green-800 border border-green-200",
              toast.type === "error" && "bg-red-50 text-red-800 border border-red-200",
              toast.type === "info" && "bg-blue-50 text-blue-800 border border-blue-200"
            )}
          >
            {toast.type === "success" && <CheckCircle className="h-5 w-5" />}
            {toast.type === "error" && <XCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
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
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
