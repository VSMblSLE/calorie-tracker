import { useState, useMemo } from 'react'
import { useAppStore, FOOD_DATABASE } from '../store/useAppStore'
import toast from 'react-hot-toast'
import { X, Search, Plus, Check, ChevronRight, UtensilsCrossed } from 'lucide-react'
import clsx from 'clsx'

function FoodItem({ food, onSelect }) {
  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full bg-ddx-elevated hover:bg-ddx-border2/30 rounded-xl p-3 text-left transition-all active:scale-[0.98] flex items-center gap-3 border border-ddx-border"
    >
      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
        <UtensilsCrossed size={18} className="text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{food.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-violet-400 text-xs font-bold">{food.calories} ккал</span>
          <span className="text-ddx-dim text-[10px]">на {food.weight_g}г</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-ddx-dim shrink-0" />
    </button>
  )
}

function MealForm({ initial, onSave, onBack }) {
  const [form, setForm] = useState({
    name:     initial?.name     ?? '',
    calories: initial?.calories ?? 0,
    protein:  initial?.protein  ?? 0,
    fat:      initial?.fat      ?? 0,
    carbs:    initial?.carbs    ?? 0,
    weight_g: initial?.weight_g ?? 100,
  })

  const [portion, setPortion] = useState(initial?.weight_g ?? 100)
  const multiplier = initial ? portion / (initial.weight_g || 100) : 1

  const scaled = {
    name:     form.name,
    calories: Math.round((initial ? initial.calories : form.calories) * multiplier),
    protein:  Math.round((initial ? initial.protein  : form.protein)  * multiplier),
    fat:      Math.round((initial ? initial.fat      : form.fat)      * multiplier),
    carbs:    Math.round((initial ? initial.carbs    : form.carbs)    * multiplier),
    weight_g: Math.round(portion),
  }

  const handleSave = () => {
    const name = form.name.trim()
    if (!name) { toast.error('Введите название'); return }
    onSave(initial ? { ...scaled, name } : form)
  }

  const FIELDS = [
    { key: 'calories', label: 'Калории', unit: 'ккал', color: 'border-violet-500' },
    { key: 'protein',  label: 'Белки',   unit: 'г',    color: 'border-rose-400'   },
    { key: 'fat',      label: 'Жиры',    unit: 'г',    color: 'border-amber-400'  },
    { key: 'carbs',    label: 'Углеводы',unit: 'г',    color: 'border-cyan-400'   },
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-ddx-muted mb-1 block">Название блюда</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
          className="input-field"
          placeholder="Например: Куриная грудка"
        />
      </div>

      {initial && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-ddx-muted">Порция</label>
            <span className="text-violet-400 font-bold text-sm">{Math.round(portion)} г</span>
          </div>
          <input
            type="range" min={10} max={1000} step={10}
            value={portion}
            onChange={(e) => setPortion(Number(e.target.value))}
            className="w-full h-2"
          />
          <div className="flex justify-between text-[10px] text-ddx-dim mt-1">
            <span>10г</span><span>500г</span><span>1000г</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label, unit, color }) => (
          <div key={key} className={clsx('bg-ddx-elevated rounded-xl p-3 border-l-4 border border-ddx-border', color)}>
            <label className="text-[11px] text-ddx-muted block mb-0.5">{label}</label>
            <div className="flex items-baseline gap-1">
              {initial ? (
                <span className="text-white text-lg font-bold">{scaled[key]}</span>
              ) : (
                <input
                  type="number"
                  value={form[key]}
                  onChange={(e) => setForm(p => ({ ...p, [key]: Math.max(0, Number(e.target.value)) }))}
                  min="0"
                  className="w-full bg-transparent text-white text-lg font-bold focus:outline-none"
                />
              )}
              <span className="text-ddx-muted text-xs">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {!initial && (
        <div>
          <label className="text-xs text-ddx-muted mb-1 block">Вес порции (г)</label>
          <input
            type="number"
            value={form.weight_g}
            onChange={(e) => setForm(p => ({ ...p, weight_g: Math.max(0, Number(e.target.value)) }))}
            min="0"
            className="input-field"
            placeholder="100"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-ddx-elevated text-white font-medium rounded-xl transition-all active:scale-95 border border-ddx-border"
        >
          Назад
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-neon-purple"
        >
          <Check size={18} />
          Сохранить
        </button>
      </div>
    </div>
  )
}

export default function AddMealModal({ onClose }) {
  const addMeal = useAppStore((s) => s.addMeal)
  const [view, setView] = useState('search')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FOOD_DATABASE.slice(0, 10)
    return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q))
  }, [query])

  const handleSelect = (food) => { setSelected(food); setView('form') }
  const handleManualEntry = () => { setSelected(null); setView('form') }

  const handleSave = async (data) => {
    try {
      await addMeal(data)
      toast.success(`${data.name} +${data.calories} ккал`)
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-ddx-card border border-ddx-border2 rounded-t-3xl w-full max-w-md p-6 pb-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">
            {view === 'search' ? 'Добавить блюдо' : (selected ? selected.name : 'Ручной ввод')}
          </h2>
          <button onClick={onClose} className="p-2 text-ddx-muted hover:text-white rounded-xl hover:bg-ddx-elevated">
            <X size={20} />
          </button>
        </div>

        {view === 'search' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ddx-muted pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск продукта..."
                className="input-field pl-10"
                autoFocus
              />
            </div>

            <button
              onClick={handleManualEntry}
              className="w-full py-3 bg-ddx-elevated hover:bg-ddx-border text-ddx-text font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-dashed border-ddx-border2"
            >
              <Plus size={18} className="text-violet-400" />
              Ввести вручную
            </button>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-ddx-muted text-sm">Ничего не найдено</p>
                  <button onClick={handleManualEntry} className="text-violet-400 text-sm font-medium mt-2 hover:underline">
                    Ввести вручную
                  </button>
                </div>
              ) : (
                results.map((food, i) => <FoodItem key={i} food={food} onSelect={handleSelect} />)
              )}
            </div>
          </div>
        ) : (
          <MealForm
            initial={selected}
            onSave={handleSave}
            onBack={() => { setView('search'); setSelected(null) }}
          />
        )}
      </div>
    </div>
  )
}
