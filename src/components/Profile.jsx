import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'
import {
  Key, Target, User, LogOut, Trash2,
  Database, Eye, EyeOff, Save, Scale,
  ChevronRight, Info
} from 'lucide-react'
import clsx from 'clsx'

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-slate-800 rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-emerald-400" />
        <h2 className="text-white font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function Profile() {
  const { apiKey, setApiKey, currentUser, updateProfile, loadMockData, clearUserMeals, logout, meals } = useAppStore()

  const [keyInput,  setKeyInput]  = useState(apiKey)
  const [showKey,   setShowKey]   = useState(false)

  const [profile, setProfile] = useState({
    name:   currentUser?.name    ?? '',
    weight: currentUser?.weight  ?? 70,
    height: currentUser?.height  ?? 170,
    age:    currentUser?.age     ?? 25,
  })

  const [goals, setGoals] = useState({
    calories: currentUser?.goals?.calories ?? 2000,
    protein:  currentUser?.goals?.protein  ?? 150,
    fat:      currentUser?.goals?.fat      ?? 65,
    carbs:    currentUser?.goals?.carbs    ?? 250,
  })

  const todayCount = meals.filter(
    (m) => m.userId === currentUser?.id && new Date(m.timestamp).toDateString() === new Date().toDateString()
  ).length

  const totalCount = meals.filter((m) => m.userId === currentUser?.id).length

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSaveKey = () => {
    if (!keyInput.trim()) { toast.error('Введите API ключ'); return }
    setApiKey(keyInput.trim())
    toast.success('API ключ сохранён')
  }

  const handleSaveProfile = () => {
    if (!profile.name.trim()) { toast.error('Введите имя'); return }
    updateProfile({ ...profile })
    toast.success('Профиль обновлён')
  }

  const handleSaveGoals = () => {
    updateProfile({ goals })
    toast.success('Цели обновлены')
  }

  const handleLoadMock = () => {
    loadMockData()
    toast.success('Тестовые данные загружены!')
  }

  const handleClear = () => {
    clearUserMeals()
    toast.success('Все записи удалены')
  }

  const handleLogout = () => {
    logout()
    toast('Вы вышли из аккаунта')
  }

  // ── BMI ──────────────────────────────────────────────────────────────────────
  const bmi = profile.height > 0
    ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
    : '—'
  const bmiLabel = !isNaN(Number(bmi))
    ? Number(bmi) < 18.5 ? 'Дефицит' : Number(bmi) < 25 ? 'Норма' : Number(bmi) < 30 ? 'Избыток' : 'Ожирение'
    : '—'
  const bmiColor = !isNaN(Number(bmi))
    ? Number(bmi) < 18.5 ? 'text-blue-400' : Number(bmi) < 25 ? 'text-emerald-400' : Number(bmi) < 30 ? 'text-yellow-400' : 'text-red-400'
    : 'text-slate-400'

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-3 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Личный кабинет</p>
          <h1 className="text-2xl font-bold text-white">Профиль</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-sm transition-all border border-slate-700 hover:border-red-500/30"
        >
          <LogOut size={15} />
          Выйти
        </button>
      </div>

      {/* User card */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/30 flex items-center justify-center text-2xl font-bold text-emerald-300">
            {currentUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{currentUser?.name}</p>
            <p className="text-slate-400 text-sm">{currentUser?.email}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="text-center flex-1">
            <p className="text-emerald-400 font-bold text-xl">{todayCount}</p>
            <p className="text-slate-400 text-xs">сегодня</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="text-center flex-1">
            <p className="text-emerald-400 font-bold text-xl">{totalCount}</p>
            <p className="text-slate-400 text-xs">всего блюд</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="text-center flex-1">
            <p className={clsx('font-bold text-xl', bmiColor)}>{bmi}</p>
            <p className="text-slate-400 text-xs">ИМТ ({bmiLabel})</p>
          </div>
        </div>
      </div>

      {/* Profile data */}
      <Section icon={User} title="Личные данные">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Имя</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Ваше имя" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'weight', label: 'Вес (кг)', min: 30, max: 300 },
              { key: 'height', label: 'Рост (см)', min: 100, max: 250 },
              { key: 'age',    label: 'Возраст',   min: 10, max: 120 },
            ].map(({ key, label, min, max }) => (
              <div key={key}>
                <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                <input
                  type="number"
                  value={profile[key]}
                  min={min} max={max}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  className="input-field text-center"
                />
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSaveProfile} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> Сохранить профиль
        </button>
      </Section>

      {/* Daily goals */}
      <Section icon={Target} title="Дневные цели">
        {[
          { key: 'calories', label: 'Калории',   unit: 'ккал', color: 'text-emerald-400' },
          { key: 'protein',  label: 'Белки',      unit: 'г',    color: 'text-red-400'     },
          { key: 'fat',      label: 'Жиры',       unit: 'г',    color: 'text-yellow-400'  },
          { key: 'carbs',    label: 'Углеводы',   unit: 'г',    color: 'text-blue-400'    },
        ].map(({ key, label, unit, color }) => (
          <div key={key} className="flex items-center justify-between">
            <span className={clsx('text-sm font-medium w-24', color)}>{label}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={goals[key]}
                min={0}
                onChange={(e) => setGoals((p) => ({ ...p, [key]: Number(e.target.value) }))}
                className="w-24 bg-slate-700 text-white text-right rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-600"
              />
              <span className="text-slate-400 text-sm w-8">{unit}</span>
            </div>
          </div>
        ))}
        <button onClick={handleSaveGoals} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> Сохранить цели
        </button>
      </Section>

      {/* API Key */}
      <Section icon={Key} title="Gemini API Key">
        <p className="text-slate-400 text-xs leading-relaxed">
          Получите бесплатный ключ на{' '}
          <span className="text-emerald-400 font-medium">aistudio.google.com</span>{' '}
          → Get API Key
        </p>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="input-field pr-12 font-mono text-sm"
          />
          <button onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {apiKey && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20">
            <Info size={12} />
            API ключ установлен — AI-анализ активен
          </div>
        )}
        <button onClick={handleSaveKey} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> Сохранить ключ
        </button>
      </Section>

      {/* Demo mode */}
      <Section icon={Database} title="Тестовый режим">
        <p className="text-slate-400 text-xs">
          Загрузите демо-данные для проверки интерфейса без API ключа
        </p>
        <button
          onClick={handleLoadMock}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-600"
        >
          <Database size={16} />
          Загрузить тестовые данные
        </button>
        <button
          onClick={handleClear}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/20"
        >
          <Trash2 size={16} />
          Удалить все мои записи
        </button>
      </Section>

      <div className="text-center pb-4">
        <p className="text-slate-600 text-xs">CalorieAI v1.0 • Данные хранятся локально</p>
      </div>
    </div>
  )
}
