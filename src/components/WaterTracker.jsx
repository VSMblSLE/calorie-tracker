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

  const strokeColor = pct >= 100 ? '#22d3ee' : pct >= 70 ? '#06b6d4' : '#0891b2'
  const textColor   = pct >= 100 ? 'text-cyan-300' : pct >= 70 ? 'text-cyan-400' : 'text-cyan-500'

  return (
    <div className="bg-ddx-card border border-ddx-border rounded-3xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-cyan-400" />
          <h2 className="text-white font-semibold text-sm">Вода</h2>
        </div>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className={clsx(
            'text-xs px-2.5 py-1 rounded-lg transition-all',
            showTimeline ? 'bg-cyan-500/20 text-cyan-400' : 'text-ddx-muted hover:text-white'
          )}
        >
          <Clock size={13} className="inline mr-1" />
          {todayWater.length}
        </button>
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#2a1055" strokeWidth="6" />
            <circle
              cx="36" cy="36" r="30" fill="none"
              stroke={strokeColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${pct * 1.885} 188.5`}
              className="transition-all duration-500"
              style={{ filter: `drop-shadow(0 0 6px ${strokeColor}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-sm leading-none">{Math.round(pct)}%</span>
            <span className="text-[9px] text-ddx-muted">{glasses} стак.</span>
          </div>
        </div>

        <div className="flex-1">
          <p className={clsx('text-2xl font-bold', textColor)}>
            {totalToday}<span className="text-sm text-ddx-muted font-normal"> мл</span>
          </p>
          <p className="text-ddx-muted text-xs">из {waterGoal} мл</p>

          <div className="mt-2 h-2 bg-ddx-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: strokeColor, boxShadow: `0 0 8px ${strokeColor}60` }}
            />
          </div>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            onClick={() => handleAdd(ml)}
            className="flex-1 min-w-[60px] py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-xl transition-all active:scale-95 border border-cyan-500/20"
          >
            +{ml}мл
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCustom(Math.max(50, custom - 50))}
          className="p-2 bg-ddx-elevated border border-ddx-border rounded-xl text-ddx-muted hover:text-white transition-colors"
        >
          <Minus size={16} />
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-bold">{custom}</span>
          <span className="text-ddx-muted text-sm"> мл</span>
        </div>
        <button
          onClick={() => setCustom(Math.min(1000, custom + 50))}
          className="p-2 bg-ddx-elevated border border-ddx-border rounded-xl text-ddx-muted hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => handleAdd(custom)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-neon-cyan"
        >
          <Plus size={14} />
          Добавить
        </button>
      </div>

      {/* Timeline */}
      {showTimeline && todayWater.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-ddx-border">
          {[...todayWater].reverse().map((w) => (
            <div key={w.id} className="flex items-center gap-3 text-xs">
              <span className="text-ddx-dim w-10">{fmtTime(w.timestamp)}</span>
              <div className="h-2 w-2 rounded-full bg-cyan-500" style={{ boxShadow: '0 0 6px #06b6d4' }} />
              <span className="text-cyan-400 font-medium flex-1">+{w.amount} мл</span>
              <button
                onClick={() => deleteWater(w.id)}
                className="p-1 text-ddx-dim hover:text-rose-400 transition-colors"
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
