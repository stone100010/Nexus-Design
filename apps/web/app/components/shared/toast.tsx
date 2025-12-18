'use client'

import { AlertCircle, AlertTriangle,CheckCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

import { useUIStore } from '@/stores/ui'

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
}

const styles = {
  success: 'bg-green-500/90 border-green-400',
  error: 'bg-red-500/90 border-red-400',
  info: 'bg-blue-500/90 border-blue-400',
  warning: 'bg-yellow-500/90 border-yellow-400',
}

export function Toast() {
  const { toast, clearToast } = useUIStore()

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, toast.duration || 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-white shadow-lg backdrop-blur-sm ${styles[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="font-medium">{toast.message}</span>
        <button
          onClick={clearToast}
          className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
