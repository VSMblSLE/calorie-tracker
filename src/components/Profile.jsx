import { useState, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import ConfirmDialog from './ConfirmDialog'
import toast from 'react-hot-toast'
import {
  Key, Target, User, LogOut, Trash2,
  Database, Eye, EyeOff, Save, Droplets,
  Download, Upload, Info
} from 'lucide-react'
import clsx from 'clsx'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-ddx-card border border-ddx-border rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-violet-400" />
        <h2 className="text-white font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function SliderField({ label, unit, value, min, max, step = 1, onChange }) {
  const isValid = value >= min && value <= max
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-ddx-muted">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min} max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            className={clsx(
              'w-16 bg-ddx-elevated text-white text-center rounded-lg px-2 py-1.5 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-violet-500',
              isValid ? 'border-ddx-border' : 'border-rose-500'
            )}
          />
          <span className="text-ddx-muted text-xs w-6">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={Math.max(min, Math.min(max, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2"
      />
      <div className="flex justify-between text-[10px] text-ddx-dim mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {!isValid && <p className="text-rose-400 text-[10px] mt-0.5">Значение от {min} до {max}</p>}
    </div>
  )
}

export default function Profile() {
  const { apiKey, setApiKey, currentUser, updateProfile, loadMockData, clearUserMeals, logout, meals, waterLog, exportData, importData } = useAppStore()

  const [keyInput,  setKeyInput]  = useState(apiKey)
  const [showKey,   setShowKey]   = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const importRef = useRef(null)

  const [profile, setProfile] = useState({
    name:      currentUser?.name      ?? '',
    weight:    currentUser?.weight    ?? 70,
    height:    currentUser?.height    ?? 170,
    age:       currentUser?.age       ?? 25,
    waterGoal: currentUser?.waterGoal ?? 2000,
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

  const handleSaveKey = () => {
    if (!keyInput.trim()) { toast.error('Введите API ключ'); return }
    setApiKey(keyInput.trim())
    toast.success('API ключ сохранён')
  }

  const handleSaveProfile = () => {
    if (!profile.name.trim()) { toast.error('Введите имя'); return }
    if (profile.weight < 30 || profile.weight > 300) { toast.error('Вес: 30-300 кг'); return }
    if (profile.height < 100 || profile.height > 250) { toast.error('Рост: 100-250 см'); return }
    if (profile.age < 10 || profile.age > 120) { toast.error('Возраст: 10-120 лет'); return }
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
    setConfirmDialog({
      title: 'Удалить все данные?',
      message: 'Все ваши приёмы пищи и записи о воде будут удалены безвозвратно.',
      confirmText: 'Удалить всё',
      danger: true,
      requireCheck: true,
      onConfirm: () => {
        clearUserMeals()
        toast.success('Все записи удалены')
        setConfirmDialog(null)
      },
    })
  }

  const handleLogout = () => {
    logout()
    toast('Вы вышли из аккаунта')
  }

  const handleExport = () => {
    const data = exportData()
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calorie-tracker-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Данные экспортированы')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        importData(data)
        toast.success(`Импортировано: ${data.meals?.length || 0} блюд`)
      } catch {
        toast.error('Ошибка чтения файла')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const bmi = profile.height > 0
    ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
    : '—'
  const bmiLabel = !isNaN(Number(bmi))
    ? Number(bmi) < 18.5 ? 'Дефицит' : Number(bmi) < 25 ? 'Норма' : Number(bmi) < 30 ? 'Избыток' : 'Ожирение'
    : '—'
  const bmiColor = !isNaN(Number(bmi))
    ? Number(bmi) < 18.5 ? 'text-cyan-400' : Number(bmi) < 25 ? 'text-violet-400' : Number(bmi) < 30 ? 'text-amber-400' : 'text-rose-400'
    : 'text-ddx-muted'

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {confirmDialog && (
        <ConfirmDialog
          {...confirmDialog}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

      {/* Header */}
      <div className="pt-3 flex items-center justify-between">
        <div>
          <p className="text-ddx-muted text-sm">Личный кабинет</p>
          <h1 className="text-2xl font-bold text-white">Профиль</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 bg-ddx-card hover:bg-rose-500/10 text-ddx-muted hover:text-rose-400 rounded-xl text-sm transition-all border border-ddx-border hover:border-rose-500/30"
        >
          <LogOut size={15} />
          Выйти
        </button>
      </div>

      {/* User card */}
      <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-600/10 border border-violet-500/20 rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/30 border border-violet-500/40 flex items-center justify-center text-2xl font-bold text-violet-300 shadow-neon-purple">
            {currentUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{currentUser?.name}</p>
            <p className="text-ddx-muted text-sm">{currentUser?.email}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="text-center flex-1">
            <p className="text-violet-400 font-bold text-xl">{todayCount}</p>
            <p className="text-ddx-muted text-xs">сегодня</p>
          </div>
          <div className="w-px bg-ddx-border" />
          <div className="text-center flex-1">
            <p className="text-violet-400 font-bold text-xl">{totalCount}</p>
            <p className="text-ddx-muted text-xs">всего блюд</p>
          </div>
          <div className="w-px bg-ddx-border" />
          <div className="text-center flex-1">
            <p className={clsx('font-bold text-xl', bmiColor)}>{bmi}</p>
            <p className="text-ddx-muted text-xs">ИМТ ({bmiLabel})</p>
          </div>
        </div>
      </div>

      {/* Profile data */}
      <Section icon={User} title="Личные данные">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-ddx-muted mb-1 block">Имя</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Ваше имя" />
          </div>
          <SliderField label="Вес" unit="кг" value={profile.weight} min={30} max={300} onChange={(v) => setProfile(p => ({ ...p, weight: v }))} />
          <SliderField label="Рост" unit="см" value={profile.height} min={100} max={250} onChange={(v) => setProfile(p => ({ ...p, height: v }))} />
          <SliderField label="Возраст" unit="лет" value={profile.age} min={10} max={120} onChange={(v) => setProfile(p => ({ ...p, age: v }))} />
        </div>
        <button onClick={handleSaveProfile} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> Сохранить профиль
        </button>
      </Section>

      {/* Water goal */}
      <Section icon={Droplets} title="Норма воды">
        <SliderField label="Дневная норма" unit="мл" value={profile.waterGoal} min={500} max={5000} step={100} onChange={(v) => setProfile(p => ({ ...p, waterGoal: v }))} />
        <p className="text-ddx-dim text-xs">Рекомендация: ~30 мл на 1 кг веса = <span className="text-cyan-400 font-medium">{Math.round(profile.weight * 30)} мл</span></p>
        <button onClick={() => { updateProfile({ waterGoal: profile.waterGoal }); toast.success('Норма воды обновлена') }} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> Сохранить
        </button>
      </Section>

      {/* Daily goals */}
      <Section icon={Target} title="Дневные цели">
        {[
          { key: 'calories', label: 'Калории', unit: 'ккал', color: 'text-violet-400', min: 500,  max: 10000 },
          { key: 'protein',  label: 'Белки',   unit: 'г',    color: 'text-rose-400',   min: 10,   max: 500   },
          { key: 'fat',      label: 'Жиры',    unit: 'г',    color: 'text-amber-400',  min: 10,   max: 300   },
          { key: 'carbs',    label: 'Углеводы',unit: 'г',    color: 'text-cyan-400',   min: 10,   max: 1000  },
        ].map(({ key, label, unit, color, min, max }) => (
          <div key={key} className="flex items-center justify-between">
            <span className={clsx('text-sm font-medium w-24', color)}>{label}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={goals[key]}
                min={min} max={max}
                onChange={(e) => setGoals((p) => ({ ...p, [key]: Number(e.target.value) }))}
                className="w-24 bg-ddx-elevated text-white text-right rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 border border-ddx-border"
              />
              <span className="text-ddx-muted text-sm w-8">{unit}</span>
            </div>
          </div>
        ))}
        <button onClick={handleSaveGoals} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> Сохранить цели
        </button>
      </Section>

      {/* API Key */}
      <Section icon={Key} title="Gemini API Key">
        <p className="text-ddx-muted text-xs leading-relaxed">
          Получите бесплатный ключ на{' '}
          <span className="text-violet-400 font-medium">aistudio.google.com</span>{' '}
          для AI-сканирования фото еды
        </p>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="input-field pr-12 font-mono text-sm"
          />
          <button onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ddx-muted hover:text-white">
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {apiKey && (
          <div className="flex items-center gap-2 text-violet-400 text-xs bg-violet-500/10 rounded-xl px-3 py-2 border border-violet-500/20">
            <Info size={12} />
            API ключ установлен
          </div>
        )}
        <button onClick={handleSaveKey} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> Сохранить ключ
        </button>
      </Section>

      {/* Export / Import */}
      <Section icon={Download} title="Данные">
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 py-3 bg-ddx-elevated hover:bg-ddx-border text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-ddx-border text-sm"
          >
            <Download size={16} /> Экспорт
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex-1 py-3 bg-ddx-elevated hover:bg-ddx-border text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-ddx-border text-sm"
          >
            <Upload size={16} /> Импорт
          </button>
        </div>
      </Section>

      {/* Demo mode */}
      <Section icon={Database} title="Тестовый режим">
        <p className="text-ddx-muted text-xs">
          Загрузите демо-данные для проверки интерфейса
        </p>
        <button
          onClick={handleLoadMock}
          className="w-full py-3 bg-ddx-elevated hover:bg-ddx-border text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-ddx-border"
        >
          <Database size={16} /> Загрузить тестовые данные
        </button>
        <button
          onClick={handleClear}
          className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-rose-500/20"
        >
          <Trash2 size={16} /> Удалить все мои записи
        </button>
      </Section>

      <div className="text-center pb-4">
        <p className="text-ddx-dim text-xs">CalorieAI v2.0 • Данные хранятся локально</p>
      </div>
    </div>
  )
}
