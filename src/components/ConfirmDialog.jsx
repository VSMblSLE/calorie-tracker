import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ title, message, confirmText, onConfirm, onCancel, danger = false, requireCheck = false }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-ddx-card rounded-3xl w-full max-w-sm p-6 animate-fade-in border border-ddx-border2">
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
            <AlertTriangle size={20} className={danger ? 'text-rose-400' : 'text-amber-400'} />
          </div>
          <button onClick={onCancel} className="p-2 text-ddx-muted hover:text-white rounded-xl hover:bg-ddx-elevated">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-ddx-muted text-sm leading-relaxed mb-5">{message}</p>

        {/* Checkbox confirmation */}
        {requireCheck && (
          <label className="flex items-start gap-3 mb-5 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-2 border-ddx-border2 bg-ddx-elevated text-violet-500 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer accent-violet-500"
            />
            <span className="text-ddx-text text-sm group-hover:text-white transition-colors">
              Я понимаю, что это действие необратимо
            </span>
          </label>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-ddx-elevated hover:bg-ddx-border text-white font-medium rounded-xl transition-all active:scale-95 border border-ddx-border"
          >
            Отмена
          </button>
          <button
            onClick={() => { if (!requireCheck || checked) onConfirm() }}
            disabled={requireCheck && !checked}
            className={`flex-1 py-3 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-neon-purple'
            }`}
          >
            {confirmText || 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  )
}
