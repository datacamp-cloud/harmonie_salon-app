// src/components/ConfirmModal.jsx
import { AlertTriangle, Loader2 } from 'lucide-react'

function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, isPending = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-beige-900">{title}</h3>
        </div>
        <p className="text-sm text-beige-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 size={16} className="animate-spin" /> En cours...</> : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
