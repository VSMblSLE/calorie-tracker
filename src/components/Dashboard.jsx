import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Flame, Beef, Droplets, Wheat, Trash2, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isToday = (ts) => new Date(ts).toDateString() === new Date().toDateString()

const fmt = (ts) =>
  new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const sum = (arr, key) => arr.reduce((acc, m) => acc + (m[key] ?? 0), 0)

// ─── MacroCard ────────────────────────────────────────────────────────────────
function MacroCard({ label, value, goal, colorClass, Icon }) {
  const pct = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0
  return (
    <div className="bg-slate-800 rounded-2xl p-3 flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className={colorClass} />
        <span className="text-[11px] text-slate-400 font-medium truncate">{label}</span>
      </div>
      <p className="text-base font-bold text-white leading-tight">
        {Math.round(value)}<span className="text-xs text-slate-400 font-normal">г</span>
      </p>
      <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', colorClass.replace('text-', 'bg-'))} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-slate-500 mt-0.5">/{goal}г</p>
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

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
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

  const remaining   = Math.max(goals.calories - totals.calories, 0)
  const calPct      = goals.calories > 0 ? Math.min((totals.calories / goals.calories) * 100, 100) : 0
  const donutData   = [{ value: totals.calories || 0.01 }, { value: remaining || 0.01 }]
  const DONUT_COLORS = ['#10b981', '#1e293b']

  const macroChartData = [
    { name: 'Белки',     consumed: Math.round(totals.protein), goal: goals.protein,  fill: '#f87171' },
    { name: 'Жиры',      consumed: Math.round(totals.fat),     goal: goals.fat,      fill: '#fbbf24' },
    { name: 'Углеводы',  consumed: Math.round(totals.carbs),   goal: goals.carbs,    fill: '#60a5fa' },
  ]

  const dateLabel = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  const greeting  = (() => {
    const h = new Date().getHours()
    if (h < 6)  return 'Доброй ночи'
    if (h < 12) return 'Доброе утро'
    if (h < 18) return 'Добрый день'
    return 'Добрый вечер'
  })()

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-3">
        <p className="text-slate-400 text-sm capitalize">{dateLabel}</p>
        <h1 className="text-2xl font-bold text-white">
          {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
      </div>

      {/* Calorie Ring Card */}
      <div className="bg-slate-800 rounded-3xl p-5 flex items-center gap-5">
        {/* Donut */}
        <div className="relative w-28 h-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={40} outerRadius={54}
                startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-white leading-none">{Math.round(calPct)}%</span>
            <span className="text-[10px] text-slate-400">цели</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-emerald-400" />
            <span className="text-white text-sm font-semibold">Калории сегодня</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{Math.round(totals.calories)}</p>
          <p className="text-slate-400 text-xs">из {goals.calories} ккал</p>
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${calPct}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400">Осталось: <span className="text-emerald-400 font-medium">{remaining} ккал</span></span>
            <span className="text-[11px] text-slate-500">{todaysMeals.length} приём{todaysMeals.length !== 1 ? 'ов' : ''}</span>
          </div>
        </div>
      </div>

      {/* Macro cards */}
      <div className="flex gap-2">
        <MacroCard label="Белки"    value={totals.protein} goal={goals.protein} colorClass="text-red-400"    Icon={Beef}    />
        <MacroCard label="Жиры"     value={totals.fat}     goal={goals.fat}     colorClass="text-yellow-400" Icon={Droplets} />
        <MacroCard label="Углеводы" value={totals.carbs}   goal={goals.carbs}   colorClass="text-blue-400"   Icon={Wheat}   />
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
          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-slate-300 font-medium">Нет записей за сегодня</p>
            <p className="text-slate-500 text-sm mt-1">Нажмите кнопку камеры, чтобы добавить блюдо</p>
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
