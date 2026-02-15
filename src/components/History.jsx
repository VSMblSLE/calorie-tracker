import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Trash2, Search, X, CalendarDays, Flame } from 'lucide-react'
import clsx from 'clsx'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const startOfDay   = (d) => new Date(d).setHours(0, 0, 0, 0)
const startOfWeek  = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); d.setHours(0,0,0,0); return d.getTime() }
const startOfMonth = () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.getTime() }

const PERIODS = [
  { id: 'today',  label: 'Сегодня' },
  { id: 'week',   label: 'Неделя'  },
  { id: 'month',  label: 'Месяц'   },
  { id: 'all',    label: 'Всё'     },
]

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const groupByDate = (meals) => {
  const map = new Map()
  for (const m of meals) {
    const key = new Date(m.timestamp).toDateString()
    if (!map.has(key)) map.set(key, { label: fmtDate(m.timestamp), ts: startOfDay(m.timestamp), meals: [] })
    map.get(key).meals.push(m)
  }
  return [...map.values()].sort((a, b) => b.ts - a.ts)
}

// ─── History ──────────────────────────────────────────────────────────────────
export default function History() {
  const meals      = useAppStore((s) => s.meals)
  const user       = useAppStore((s) => s.currentUser)
  const deleteMeal = useAppStore((s) => s.deleteMeal)

  const [period,  setPeriod]  = useState('today')
  const [query,   setQuery]   = useState('')

  // 1. Filter by user
  const userMeals = useMemo(
    () => meals.filter((m) => m.userId === user?.id),
    [meals, user]
  )

  // 2. Filter by period
  const periodFiltered = useMemo(() => {
    const now = Date.now()
    if (period === 'today') return userMeals.filter((m) => m.timestamp >= startOfDay(now))
    if (period === 'week')  return userMeals.filter((m) => m.timestamp >= startOfWeek())
    if (period === 'month') return userMeals.filter((m) => m.timestamp >= startOfMonth())
    return userMeals
  }, [userMeals, period])

  // 3. Filter by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return periodFiltered
    return periodFiltered.filter((m) => m.name.toLowerCase().includes(q))
  }, [periodFiltered, query])

  // 4. Totals for filtered set
  const totals = useMemo(() => ({
    calories: filtered.reduce((a, m) => a + m.calories, 0),
    protein:  filtered.reduce((a, m) => a + m.protein,  0),
    fat:      filtered.reduce((a, m) => a + m.fat,      0),
    carbs:    filtered.reduce((a, m) => a + m.carbs,    0),
  }), [filtered])

  // 5. Group by date
  const groups = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-3">
        <p className="text-slate-400 text-sm">Дневник питания</p>
        <h1 className="text-2xl font-bold text-white">История</h1>
      </div>

      {/* Period tabs */}
      <div className="flex rounded-xl bg-slate-800 p-1 gap-1">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPeriod(id)}
            className={clsx(
              'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
              period === id ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию блюда…"
          className="input-field pl-10 pr-10"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Summary card */}
      {filtered.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-emerald-400" />
            <span className="text-white text-sm font-semibold">Итого ({filtered.length} блюд)</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Калории', value: Math.round(totals.calories), unit: 'ккал', color: 'text-emerald-400' },
              { label: 'Белки',   value: Math.round(totals.protein),  unit: 'г',    color: 'text-red-400'     },
              { label: 'Жиры',    value: Math.round(totals.fat),      unit: 'г',    color: 'text-yellow-400'  },
              { label: 'Углеводы',value: Math.round(totals.carbs),    unit: 'г',    color: 'text-blue-400'    },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="text-center">
                <p className={clsx('text-lg font-bold leading-none', color)}>{value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{unit}</p>
                <p className="text-[10px] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-10 text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-slate-300 font-medium">Ничего не найдено</p>
          <p className="text-slate-500 text-sm mt-1">
            {query ? 'Попробуйте другой запрос' : 'За этот период нет записей'}
          </p>
        </div>
      ) : (
        <div className="space-y-5 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Date label */}
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={13} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">{group.label}</span>
                <div className="flex-1 h-px bg-slate-700/60" />
                <span className="text-xs text-slate-500">
                  {group.meals.reduce((a, m) => a + m.calories, 0)} ккал
                </span>
              </div>

              {/* Meals */}
              <div className="space-y-2">
                {[...group.meals].reverse().map((meal) => (
                  <div key={meal.id} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{meal.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-emerald-400 text-sm font-bold">{meal.calories} ккал</span>
                        <span className="text-slate-500 text-xs">{fmtTime(meal.timestamp)}</span>
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">Б:{meal.protein}г</span>
                        <span className="text-xs text-slate-400">Ж:{meal.fat}г</span>
                        <span className="text-xs text-slate-400">У:{meal.carbs}г</span>
                        {meal.weight_g > 0 && <span className="text-xs text-slate-500">{meal.weight_g}г</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-slate-700 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
