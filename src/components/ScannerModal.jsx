import { useState, useEffect } from 'react'
import { analyzeFood } from '../services/gemini'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'
import { X, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

// ─── Edit/Confirm Modal ───────────────────────────────────────────────────────
function ConfirmModal({ data, previewUrl, onSave, onClose }) {
  const [form, setForm] = useState({
    name:        data.name        ?? '',
    calories:    data.calories    ?? 0,
    protein:     data.protein     ?? 0,
    fat:         data.fat         ?? 0,
    carbs:       data.carbs       ?? 0,
    weight_g:    data.weight_g    ?? 0,
    description: data.description ?? '',
  })

  const change = (field) => (e) => {
    const val = field === 'name' || field === 'description' ? e.target.value : Math.max(0, Number(e.target.value))
    setForm((p) => ({ ...p, [field]: val }))
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Введите название блюда'); return }
    onSave(form)
  }

  const FIELDS = [
    { key: 'calories', label: 'Калории', unit: 'ккал', border: 'border-violet-500' },
    { key: 'protein',  label: 'Белки',   unit: 'г',    border: 'border-rose-400'   },
    { key: 'fat',      label: 'Жиры',    unit: 'г',    border: 'border-amber-400'  },
    { key: 'carbs',    label: 'Углеводы',unit: 'г',    border: 'border-cyan-400'   },
    { key: 'weight_g', label: 'Вес',     unit: 'г',    border: 'border-ddx-border2'},
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-ddx-card border border-ddx-border2 rounded-t-3xl w-full max-w-md p-6 pb-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Подтвердить блюдо</h2>
          <button onClick={onClose} className="p-2 text-ddx-muted hover:text-white rounded-xl hover:bg-ddx-elevated">
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        {previewUrl && (
          <img src={previewUrl} alt="Фото блюда" className="w-full h-36 object-cover rounded-2xl mb-4 border border-ddx-border" />
        )}

        {/* Description from AI */}
        {data.description && (
          <p className="text-ddx-muted text-xs bg-ddx-elevated rounded-xl px-3 py-2 mb-4 leading-relaxed border border-ddx-border">{data.description}</p>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs text-ddx-muted mb-1 block">Название блюда</label>
          <input
            type="text"
            value={form.name}
            onChange={change('name')}
            className="input-field"
            placeholder="Название блюда"
          />
        </div>

        {/* Numeric fields */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {FIELDS.map(({ key, label, unit, border }) => (
            <div key={key} className={clsx('bg-ddx-elevated rounded-xl p-3 border-l-4 border border-ddx-border', border)}>
              <label className="text-[11px] text-ddx-muted block mb-0.5">{label}</label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={form[key]}
                  onChange={change(key)}
                  min="0"
                  className="w-full bg-transparent text-white text-lg font-bold focus:outline-none"
                />
                <span className="text-ddx-muted text-xs">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ingredients list (read-only) */}
        {data.ingredients?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-ddx-muted mb-2">Состав (по данным AI):</p>
            <div className="space-y-1">
              {data.ingredients.map((ing, i) => (
                <div key={i} className="flex justify-between text-xs text-ddx-text bg-ddx-elevated rounded-lg px-3 py-1.5 border border-ddx-border">
                  <span>{ing.name}</span>
                  <span className="text-violet-400">{ing.calories} ккал</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Сохранить в дневник
        </button>
      </div>
    </div>
  )
}

// ─── ScannerModal ─────────────────────────────────────────────────────────────
// Props:
//   file       – File | null  (set by parent when user picks a file)
//   onClose()  – called when done/cancelled
export default function ScannerModal({ file, onClose }) {
  const { apiKey, addMeal } = useAppStore()
  const [status,     setStatus]     = useState('idle')   // idle | analyzing | edit | not_food | error
  const [result,     setResult]     = useState(null)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  // Start analysis whenever a new file arrives
  useEffect(() => {
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStatus('analyzing')

    analyzeFood(apiKey, file)
      .then((data) => {
        setResult(data)
        setStatus(data.is_food ? 'edit' : 'not_food')
      })
      .catch((err) => {
        setErrorMsg(err.message)
        setStatus('error')
      })

    return () => URL.revokeObjectURL(url)
  }, [file]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setErrorMsg('')
    setPreviewUrl(null)
    onClose()
  }

  const handleSave = async (formData) => {
    try {
      await addMeal(formData)
      toast.success(`${formData.name} добавлено! +${formData.calories} ккал`)
      reset()
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (status === 'idle') return null

  // ── Analyzing overlay ─────────────────────────────────────────────────────
  if (status === 'analyzing') {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-5 p-6 animate-fade-in">
        {previewUrl && (
          <img src={previewUrl} alt="Анализ" className="w-52 h-52 object-cover rounded-3xl border-2 border-violet-500/40 shadow-neon-purple" />
        )}
        <Loader2 size={36} className="text-violet-400 animate-spin" />
        <div className="text-center">
          <p className="text-white font-bold text-xl">Анализирую блюдо…</p>
          <p className="text-ddx-muted text-sm mt-1">Groq AI распознаёт состав и КБЖУ</p>
        </div>
      </div>
    )
  }

  // ── Not food overlay ──────────────────────────────────────────────────────
  if (status === 'not_food') {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 p-6 animate-fade-in">
        {previewUrl && (
          <img src={previewUrl} alt="Фото" className="w-40 h-40 object-cover rounded-2xl border border-ddx-border mb-2" />
        )}
        <AlertCircle size={48} className="text-amber-400" />
        <div className="text-center">
          <p className="text-white font-bold text-lg">Еда не обнаружена</p>
          <p className="text-ddx-muted text-sm mt-1">На снимке не найдена еда. Попробуйте другое фото.</p>
        </div>
        <button onClick={reset} className="mt-2 px-8 py-3 bg-ddx-elevated hover:bg-ddx-border text-white rounded-2xl font-medium transition-all border border-ddx-border">
          Закрыть
        </button>
      </div>
    )
  }

  // ── Error overlay ─────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 p-6 animate-fade-in">
        <AlertCircle size={48} className="text-rose-400" />
        <div className="text-center">
          <p className="text-white font-bold text-lg">Ошибка анализа</p>
          <p className="text-ddx-muted text-sm mt-1 max-w-xs">{errorMsg}</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={reset} className="px-6 py-3 bg-ddx-elevated hover:bg-ddx-border text-white rounded-2xl font-medium transition-all border border-ddx-border">
            Закрыть
          </button>
          <button onClick={() => { setStatus('idle'); setErrorMsg(''); }} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-medium transition-all flex items-center gap-2 shadow-neon-purple">
            Настройки <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── Edit modal ────────────────────────────────────────────────────────────
  if (status === 'edit' && result) {
    return <ConfirmModal data={result} previewUrl={previewUrl} onSave={handleSave} onClose={reset} />
  }

  return null
}
