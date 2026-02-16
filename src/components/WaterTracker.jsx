import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'
import { Droplets, Plus, Minus, Trash2, Clock } from 'lucide-react'
import clsx from 'clsx'

const QUICK_AMOUNTS = [150, 200, 250, 300, 500]

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const isToday = (ts) =>
  new Date(ts).toDateString() === new Date().toDateString()

export default function WaterTracker() {
  const waterLog   = useAppStore((s) => s.waterLog)
  const user       = useAppStore((s) => s.currentUser)
  const addWater   = useAppStore((s) => s.addWater)
  const deleteWater = useAppStore((s) => s.deleteWater)

  const waterGoal = user?.waterGoal ?? 2000
  const [custom, setCustom] = useState(250)
  const [showTimeline, setShowTimeline] = useState(false)

  const todayWater = useMemo(
    () => waterLog.filter((w) => w.userId === user?.id && isToday(w.timestamp)),
    [waterLog, user]
  )

  const totalToday = useMemo(
    () => todayWater.reduce((a, w) => a + w.amount, 0),
    [todayWater]
  )

  const pct = waterGoal > 0 ? Math.min((totalToday / waterGoal) * 100, 100) : 0
  const glasses = Math.round(totalToday / 250)

  const handleAdd = (amount) => {
    addWater(amount)
    if (totalToday + amount >= waterGoal && totalToday < waterGoal) {
      toast.success('Норма воды выполнена!')
    } else {
      toast.success(`+${amount} мл`)
    }
  }

  // Water fill color
  const fillColor = pct >= 100 ? 'bg-blue-400' : pct >= 70 ? 'bg-blue-500' : 'bg-blue-600'
  const textColor = pct >= 100 ? 'text-blue-300' : pct >= 70 ? 'text-blue-400' : 'text-blue-500'

  return (
    <div className="bg-slate-800 rounded-3xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-400" />
          <h2 className="text-white font-semibold text-sm">Вода</h2>
        </div>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className={clsx(
            'text-xs px-2.5 py-1 rounded-lg transition-all',
            showTimeline ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
          )}
        >
          <Clock size={13} className="inline mr-1" />
          {todayWater.length}
        </button>
      </div>

      {/* Progress ring / bar */}
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="36" cy="36" r="30" fill="none"
              stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${pct * 1.885} 188.5`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-sm leading-none">{Math.round(pct)}%</span>
            <span className="text-[9px] text-slate-400">{glasses} стак.</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <p className={clsx('text-2xl font-bold', textColor)}>
            {totalToday}<span className="text-sm text-slate-400 font-normal"> мл</span>
          </p>
          <p className="text-slate-400 text-xs">из {waterGoal} мл</p>

          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className={clsx('h-full rounded-full transition-all duration-500', fillColor)} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            onClick={() => handleAdd(ml)}
            className="flex-1 min-w-[60px] py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium rounded-xl transition-all active:scale-95 border border-blue-500/20"
          >
            +{ml}мл
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCustom(Math.max(50, custom - 50))}
          className="p-2 bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <Minus size={16} />
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-bold">{custom}</span>
          <span className="text-slate-400 text-sm"> мл</span>
        </div>
        <button
          onClick={() => setCustom(Math.min(1000, custom + 50))}
          className="p-2 bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => handleAdd(custom)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center gap-1"
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {/* Timeline */}
      {showTimeline && todayWater.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-700">
          {[...todayWater].reverse().map((w) => (
            <div key={w.id} className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 w-10">{fmtTime(w.timestamp)}</span>
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-blue-400 font-medium flex-1">+{w.amount} мл</span>
              <button
                onClick={() => deleteWater(w.id)}
                className="p-1 text-slate-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
