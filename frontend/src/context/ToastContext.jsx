import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

function ToastItem({ toast, onClose }) {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle2 size={18} className="text-green-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle size={18} className="text-red-600" />,
    },
    info: {
      container: 'bg-beige-50 border-beige-200 text-beige-800',
      icon: <Info size={18} className="text-beige-700" />,
    },
  }

  const variant = variants[toast.type] || variants.info

  return (
    <div className={`w-full rounded-lg border shadow-sm p-3 ${variant.container}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{variant.icon}</div>
        <div className="flex-1 text-sm">{toast.message}</div>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Fermer la notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`

    setToasts((prev) => [...prev, { id, message, type }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
  }, [])

  const value = useMemo(
    () => ({
      success: (message, duration) => showToast(message, 'success', duration),
      error: (message, duration) => showToast(message, 'error', duration),
      info: (message, duration) => showToast(message, 'info', duration),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] w-[90vw] max-w-sm space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
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
