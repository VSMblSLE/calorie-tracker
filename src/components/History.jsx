import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Trash2, Search, X, CalendarDays, Flame, Plus, UtensilsCrossed } from 'lucide-react'
import clsx from 'clsx'

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

export default function History({ onAddMeal }) {
  const meals      = useAppStore((s) => s.meals)
  const user       = useAppStore((s) => s.currentUser)
  const deleteMeal = useAppStore((s) => s.deleteMeal)

  const [period,  setPeriod]  = useState('today')
  const [query,   setQuery]   = useState('')

  const userMeals = useMemo(
    () => meals.filter((m) => m.userId === user?.id),
    [meals, user]
  )

  const periodFiltered = useMemo(() => {
    const now = Date.now()
    if (period === 'today') return userMeals.filter((m) => m.timestamp >= startOfDay(now))
    if (period === 'week')  return userMeals.filter((m) => m.timestamp >= startOfWeek())
    if (period === 'month') return userMeals.filter((m) => m.timestamp >= startOfMonth())
    return userMeals
  }, [userMeals, period])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return periodFiltered
    return periodFiltered.filter((m) => m.name.toLowerCase().includes(q))
  }, [periodFiltered, query])

  const totals = useMemo(() => ({
    calories: filtered.reduce((a, m) => a + m.calories, 0),
    protein:  filtered.reduce((a, m) => a + m.protein,  0),
    fat:      filtered.reduce((a, m) => a + m.fat,      0),
    carbs:    filtered.reduce((a, m) => a + m.carbs,    0),
  }), [filtered])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="pt-3">
        <p className="text-ddx-muted text-sm">Дневник питания</p>
        <h1 className="text-2xl font-bold text-white">История</h1>
      </div>

      <div className="flex rounded-xl bg-ddx-card border border-ddx-border p-1 gap-1">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPeriod(id)}
            className={clsx(
              'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
              period === id ? 'bg-violet-600 text-white shadow shadow-violet-900' : 'text-ddx-muted hover:text-white'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ddx-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию блюда..."
          className="input-field pl-10 pr-10"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ddx-muted hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="bg-ddx-card border border-ddx-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-violet-400" />
            <span className="text-white text-sm font-semibold">Итого ({filtered.length} блюд)</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Калории', value: Math.round(totals.calories), unit: 'ккал', color: 'text-violet-400' },
              { label: 'Белки',   value: Math.round(totals.protein),  unit: 'г',    color: 'text-rose-400'   },
              { label: 'Жиры',    value: Math.round(totals.fat),      unit: 'г',    color: 'text-amber-400'  },
              { label: 'Углеводы',value: Math.round(totals.carbs),    unit: 'г',    color: 'text-cyan-400'   },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="text-center">
                <p className={clsx('text-lg font-bold leading-none', color)}>{value}</p>
                <p className="text-[10px] text-ddx-dim mt-0.5">{unit}</p>
                <p className="text-[10px] text-ddx-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-ddx-card border border-ddx-border rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-ddx-elevated border border-ddx-border flex items-center justify-center animate-pulse-slow">
            <UtensilsCrossed size={32} className="text-ddx-muted" />
          </div>
          <div>
            <p className="text-ddx-text font-medium">
              {query ? 'Ничего не найдено' : 'Нет записей за этот период'}
            </p>
            <p className="text-ddx-dim text-sm mt-1">
              {query ? 'Попробуйте другой запрос' : 'Добавьте первый приём пищи'}
            </p>
          </div>
          {!query && (
            <button
              onClick={onAddMeal}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all active:scale-95 inline-flex items-center gap-2 text-sm mx-auto shadow-neon-purple"
            >
              <Plus size={16} /> Добавить блюдо
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={13} className="text-ddx-dim" />
                <span className="text-xs text-ddx-muted font-medium">{group.label}</span>
                <div className="flex-1 h-px bg-ddx-border" />
                <span className="text-xs text-ddx-dim">
                  {group.meals.reduce((a, m) => a + m.calories, 0)} ккал
                </span>
              </div>

              <div className="space-y-2">
                {[...group.meals].reverse().map((meal) => (
                  <div key={meal.id} className="bg-ddx-card border border-ddx-border rounded-2xl p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{meal.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-violet-400 text-sm font-bold">{meal.calories} ккал</span>
                        <span className="text-ddx-dim text-xs">{fmtTime(meal.timestamp)}</span>
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs text-ddx-muted">Б:{meal.protein}г</span>
                        <span className="text-xs text-ddx-muted">Ж:{meal.fat}г</span>
                        <span className="text-xs text-ddx-muted">У:{meal.carbs}г</span>
                        {meal.weight_g > 0 && <span className="text-xs text-ddx-dim">{meal.weight_g}г</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="p-2 text-ddx-dim hover:text-rose-400 transition-colors rounded-xl hover:bg-rose-500/10 shrink-0"
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
