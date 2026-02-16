import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ title, message, confirmText, onConfirm, onCancel, danger = false, requireCheck = false }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-3xl w-full max-w-sm p-6 animate-fade-in border border-slate-700">
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
            <AlertTriangle size={20} className={danger ? 'text-red-400' : 'text-yellow-400'} />
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-5">{message}</p>

        {/* Checkbox confirmation */}
        {requireCheck && (
          <label className="flex items-start gap-3 mb-5 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-2 border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
              Я понимаю, что это действие необратимо
            </span>
          </label>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all active:scale-95 border border-slate-600"
          >
            Отмена
          </button>
          <button
            onClick={() => { if (!requireCheck || checked) onConfirm() }}
            disabled={requireCheck && !checked}
            className={`flex-1 py-3 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              danger
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white'
            }`}
          >
            {confirmText || 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  )
}
