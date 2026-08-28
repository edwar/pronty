"use client"

import { useEffect, useState } from "react"
import { X, AlertCircle } from "lucide-react"

interface ToastProps {
  message: string
  onClose: () => void
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-lg border border-border/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-sm font-medium text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 rounded-lg p-1 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
  }

  const ToastComponent = toast ? (
    <Toast message={toast} onClose={() => setToast(null)} />
  ) : null

  return { showToast, ToastComponent }
}
