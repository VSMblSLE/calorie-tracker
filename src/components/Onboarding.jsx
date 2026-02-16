import { useState } from 'react'
import { Flame, UtensilsCrossed, Droplets, Target, ChevronRight, ChevronLeft } from 'lucide-react'

const SLIDES = [
  {
    Icon: Flame,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    title: 'CalorieAI',
    subtitle: 'Умный трекер питания',
    desc: 'Отслеживайте калории, белки, жиры и углеводы. Ведите дневник питания и достигайте ваших целей.',
  },
  {
    Icon: UtensilsCrossed,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    title: 'Добавляйте блюда',
    subtitle: 'Быстро и удобно',
    desc: 'Ищите продукты в базе из 40+ блюд, вводите вручную или сканируйте фото еды с помощью AI.',
  },
  {
    Icon: Droplets,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    title: 'Трекер воды',
    subtitle: 'Водный баланс',
    desc: 'Отмечайте каждый стакан воды. Следите за нормой потребления и поддерживайте водный баланс.',
  },
  {
    Icon: Target,
    color: 'text-violet-400',
    bg: 'bg-violet-500/20',
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
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-between p-6 max-w-md mx-auto">
      {/* Skip button */}
      <div className="w-full flex justify-end pt-2">
        <button
          onClick={onDone}
          className="text-slate-500 text-sm hover:text-slate-300 transition-colors px-3 py-1"
        >
          Пропустить
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in" key={step}>
        <div className={`w-24 h-24 rounded-3xl ${slide.bg} flex items-center justify-center mb-8 animate-pulse-slow`}>
          <slide.Icon size={48} className={slide.color} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{slide.title}</h1>
        <p className={`text-sm font-medium mb-4 ${slide.color}`}>{slide.subtitle}</p>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{slide.desc}</p>
      </div>

      {/* Navigation */}
      <div className="w-full space-y-4 pb-6">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 bg-slate-800 text-white font-semibold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-700"
            >
              <ChevronLeft size={18} />
              Назад
            </button>
          )}
          <button
            onClick={isLast ? onDone : () => setStep(step + 1)}
            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLast ? 'Начать' : 'Далее'}
            {!isLast && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
