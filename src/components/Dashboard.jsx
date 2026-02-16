import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Flame, Beef, Droplets, Wheat, Trash2, TrendingUp, Plus, Camera } from 'lucide-react'
import WaterTracker from './WaterTracker'
import clsx from 'clsx'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isToday = (ts) => new Date(ts).toDateString() === new Date().toDateString()
const fmt = (ts) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
const sum = (arr, key) => arr.reduce((acc, m) => acc + (m[key] ?? 0), 0)
const dayLabel = (d) => ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()]

// ─── Color logic ────────────────────────────────────────────────────────────
const getProgressColor = (value, goal) => {
  if (goal <= 0) return { bar: 'bg-slate-600', text: 'text-slate-400' }
  const pct = value / goal
  if (pct > 1.1)  return { bar: 'bg-red-500',    text: 'text-red-400' }
  if (pct > 0.85) return { bar: 'bg-yellow-400',  text: 'text-yellow-400' }
  return { bar: 'bg-emerald-500', text: 'text-emerald-400' }
}

// ─── MacroCard ────────────────────────────────────────────────────────────────
function MacroCard({ label, value, goal, colorClass, Icon }) {
  const pct = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0
  const { bar } = getProgressColor(value, goal)
  const overLimit = value > goal * 1.1

  return (
    <div className={clsx('bg-slate-800 rounded-2xl p-3 flex-1 min-w-0', overLimit && 'ring-1 ring-red-500/30')}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className={colorClass} />
        <span className="text-[11px] text-slate-400 font-medium truncate">{label}</span>
      </div>
      <p className="text-base font-bold text-white leading-tight">
        {Math.round(value)}<span className="text-xs text-slate-400 font-normal">г</span>
      </p>
      <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className={clsx('text-[10px] mt-0.5', overLimit ? 'text-red-400 font-medium' : 'text-slate-500')}>
        {overLimit ? `+${Math.round(value - goal)}г!` : `/${goal}г`}
      </p>
    </div>
  )
}

// ─── Custom Bar tooltip ───────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>{p.name}: {p.value}г</p>
      ))}
    </div>
  )
}

// ─── Weekly chart tooltip ─────────────────────────────────────────────────────
const WeekTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      <p className="text-emerald-400">{payload[0].value} ккал</p>
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard({ onAddMeal, onScanClick }) {
  const meals      = useAppStore((s) => s.meals)
  const user       = useAppStore((s) => s.currentUser)
  const deleteMeal = useAppStore((s) => s.deleteMeal)

  const goals = user?.goals ?? { calories: 2000, protein: 150, fat: 65, carbs: 250 }

  const todaysMeals = useMemo(
    () => meals.filter((m) => m.userId === user?.id && isToday(m.timestamp)),
    [meals, user]
  )

  const totals = useMemo(
    () => ({ calories: sum(todaysMeals, 'calories'), protein: sum(todaysMeals, 'protein'), fat: sum(todaysMeals, 'fat'), carbs: sum(todaysMeals, 'carbs') }),
    [todaysMeals]
  )

  // Weekly data
  const weekData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const start = new Date(d).setHours(0, 0, 0, 0)
      const end = new Date(d).setHours(23, 59, 59, 999)
      const dayMeals = meals.filter(m => m.userId === user?.id && m.timestamp >= start && m.timestamp <= end)
      const cal = dayMeals.reduce((a, m) => a + m.calories, 0)
      days.push({ name: dayLabel(d), calories: Math.round(cal), goal: goals.calories })
    }
    return days
  }, [meals, user, goals.calories])

  const remaining = Math.max(goals.calories - totals.calories, 0)
  const calPct    = goals.calories > 0 ? Math.min((totals.calories / goals.calories) * 100, 100) : 0
  const calColor  = getProgressColor(totals.calories, goals.calories)

  const macroChartData = [
    { name: 'Белки',    consumed: Math.round(totals.protein), goal: goals.protein,  fill: '#f87171' },
    { name: 'Жиры',     consumed: Math.round(totals.fat),     goal: goals.fat,      fill: '#fbbf24' },
    { name: 'Углеводы', consumed: Math.round(totals.carbs),   goal: goals.carbs,    fill: '#60a5fa' },
  ]

  const dateLabel = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 6)  return 'Доброй ночи'
    if (h < 12) return 'Доброе утро'
    if (h < 18) return 'Добрый день'
    return 'Добрый вечер'
  })()

  // Recommendation
  const recommendation = useMemo(() => {
    if (todaysMeals.length === 0) return null
    if (totals.calories > goals.calories * 1.1) return { text: 'Лимит калорий превышен. Снизьте порции.', color: 'text-red-400' }
    if (totals.protein < goals.protein * 0.5 && totals.calories > goals.calories * 0.6) return { text: 'Добавьте белка: мясо, рыба, творог.', color: 'text-orange-400' }
    if (totals.fat > goals.fat * 1.1) return { text: 'Жиры превышены. Выбирайте нежирные продукты.', color: 'text-yellow-400' }
    if (calPct >= 90 && calPct <= 110) return { text: 'Отличный баланс! Так держать!', color: 'text-emerald-400' }
    return null
  }, [totals, goals, todaysMeals.length, calPct])

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-3">
        <p className="text-slate-400 text-sm capitalize">{dateLabel}</p>
        <h1 className="text-2xl font-bold text-white">
          {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
      </div>

      {/* Calorie card */}
      <div className="bg-slate-800 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-emerald-400" />
          <span className="text-white text-sm font-semibold">Калории сегодня</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <p className={clsx('text-4xl font-bold', calColor.text)}>{Math.round(totals.calories)}</p>
            <p className="text-slate-400 text-xs">из {goals.calories} ккал</p>
          </div>
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle
                cx="36" cy="36" r="30" fill="none"
                stroke={totals.calories > goals.calories * 1.1 ? '#ef4444' : totals.calories > goals.calories * 0.85 ? '#fbbf24' : '#10b981'}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${calPct * 1.885} 188.5`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-bold text-sm">{Math.round(calPct)}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={clsx('h-full rounded-full transition-all duration-700', calColor.bar)} style={{ width: `${calPct}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-slate-400">Осталось: <span className={clsx('font-medium', calColor.text)}>{remaining} ккал</span></span>
          <span className="text-[11px] text-slate-500">{todaysMeals.length} приём{todaysMeals.length !== 1 ? 'ов' : ''}</span>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className={clsx('bg-slate-800 rounded-2xl px-4 py-3 text-xs font-medium', recommendation.color)}>
          {recommendation.text}
        </div>
      )}

      {/* Macro cards */}
      <div className="flex gap-2">
        <MacroCard label="Белки"    value={totals.protein} goal={goals.protein} colorClass="text-red-400"    Icon={Beef}     />
        <MacroCard label="Жиры"     value={totals.fat}     goal={goals.fat}     colorClass="text-yellow-400" Icon={Droplets} />
        <MacroCard label="Углеводы" value={totals.carbs}   goal={goals.carbs}   colorClass="text-blue-400"   Icon={Wheat}    />
      </div>

      {/* Water tracker */}
      <WaterTracker />

      {/* Weekly chart */}
      <div className="bg-slate-800 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h2 className="text-white text-sm font-semibold">Калории за неделю</h2>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weekData} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<WeekTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="calories" name="Калории" radius={[6, 6, 0, 0]}>
              {weekData.map((entry, i) => (
                <Cell key={i} fill={entry.calories > entry.goal * 1.1 ? '#ef4444' : entry.calories > entry.goal * 0.85 ? '#fbbf24' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> в норме</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400" /> близко</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> превышено</span>
        </div>
      </div>

      {/* Macro Bar Chart */}
      <div className="bg-slate-800 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h2 className="text-white text-sm font-semibold">Макронутриенты (г)</h2>
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={macroChartData} barGap={4}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="goal"     name="Цель"     radius={[4,4,0,0]} fill="#1e293b" />
            <Bar dataKey="consumed" name="Съедено"  radius={[4,4,0,0]}>
              {macroChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's meal list */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">
          Приёмы пищи сегодня
          {todaysMeals.length > 0 && <span className="ml-2 text-slate-400 font-normal text-sm">({todaysMeals.length})</span>}
        </h2>

        {todaysMeals.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center animate-pulse-slow">
              <Plus size={32} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-300 font-medium">Нет записей за сегодня</p>
              <p className="text-slate-500 text-sm mt-1">Добавьте первый приём пищи</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onAddMeal}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Добавить
              </button>
              <button
                onClick={onScanClick}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm border border-slate-600"
              >
                <Camera size={16} /> Сканировать
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {[...todaysMeals].reverse().map((meal) => (
              <div key={meal.id} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{meal.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-emerald-400 text-sm font-bold">{meal.calories} ккал</span>
                    <span className="text-slate-500 text-xs">{fmt(meal.timestamp)}</span>
                  </div>
                  <div className="flex gap-3 mt-1">
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
        )}
      </div>
    </div>
  )
}
