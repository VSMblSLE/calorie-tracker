import { useState } from 'react'
import { Flame, UtensilsCrossed, Droplets, Target, ChevronRight, ChevronLeft } from 'lucide-react'

const SLIDES = [
  {
    Icon: Flame,
    color: 'text-violet-400',
    bg: 'bg-violet-500/20 border border-violet-500/30',
    glow: 'shadow-neon-purple',
    title: 'CalorieAI',
    subtitle: 'Умный трекер питания',
    desc: 'Отслеживайте калории, белки, жиры и углеводы. Ведите дневник питания и достигайте ваших целей.',
  },
  {
    Icon: UtensilsCrossed,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/20 border border-fuchsia-500/30',
    glow: 'shadow-neon-pink',
    title: 'Добавляйте блюда',
    subtitle: 'Быстро и удобно',
    desc: 'Ищите продукты в базе из 40+ блюд, вводите вручную или сканируйте фото еды с помощью AI.',
  },
  {
    Icon: Droplets,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20 border border-cyan-500/30',
    glow: 'shadow-neon-cyan',
    title: 'Трекер воды',
    subtitle: 'Водный баланс',
    desc: 'Отмечайте каждый стакан воды. Следите за нормой потребления и поддерживайте водный баланс.',
  },
  {
    Icon: Target,
    color: 'text-violet-400',
    bg: 'bg-violet-500/20 border border-violet-500/30',
    glow: 'shadow-neon-purple',
    title: 'Ваши цели',
    subtitle: 'Индивидуальный подход',
    desc: 'Настройте дневные цели по калориям и макронутриентам. Отслеживайте прогресс на графиках.',
  },
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  return (
    <div className="fixed inset-0 bg-ddx-bg z-[100] flex flex-col items-center justify-between p-6 max-w-md mx-auto overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      {/* Skip button */}
      <div className="w-full flex justify-end pt-2 relative z-10">
        <button
          onClick={onDone}
          className="text-ddx-muted text-sm hover:text-ddx-text transition-colors px-3 py-1"
        >
          Пропустить
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in relative z-10" key={step}>
        <div className={`w-24 h-24 rounded-3xl ${slide.bg} ${slide.glow} flex items-center justify-center mb-8 animate-pulse-slow`}>
          <slide.Icon size={48} className={slide.color} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{slide.title}</h1>
        <p className={`text-sm font-medium mb-4 ${slide.color}`}>{slide.subtitle}</p>
        <p className="text-ddx-muted text-sm leading-relaxed max-w-xs">{slide.desc}</p>
      </div>

      {/* Navigation */}
      <div className="w-full space-y-4 pb-6 relative z-10">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-violet-500' : 'w-2 bg-ddx-border'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 bg-ddx-card text-white font-semibold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-ddx-border"
            >
              <ChevronLeft size={18} />
              Назад
            </button>
          )}
          <button
            onClick={isLast ? onDone : () => setStep(step + 1)}
            className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-neon-purple"
          >
            {isLast ? 'Начать' : 'Далее'}
            {!isLast && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
