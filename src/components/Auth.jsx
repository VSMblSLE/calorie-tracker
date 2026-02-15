import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'
import { Flame, Eye, EyeOff, Loader2 } from 'lucide-react'

function validate({ name, email, password, mode }) {
  if (mode === 'register' && !name?.trim()) return 'Введите имя'
  if (!email?.trim())    return 'Введите email'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный email'
  if (!password)         return 'Введите пароль'
  if (password.length < 6) return 'Пароль должен быть не менее 6 символов'
  return null
}

export default function Auth() {
  const { login, register } = useAppStore()
  const [mode, setMode]           = useState('login') // 'login' | 'register'
  const [form, setForm]           = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate({ ...form, mode })
    if (err) { toast.error(err); return }

    setLoading(true)
    try {
      if (mode === 'login') {
        login({ email: form.email, password: form.password })
        toast.success('Добро пожаловать!')
      } else {
        register({ name: form.name, email: form.email, password: form.password })
        toast.success('Аккаунт создан!')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
          <Flame size={32} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">CalorieAI</h1>
        <p className="text-slate-400 text-sm mt-1">Умный счётчик калорий</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-6 shadow-2xl">
        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-700/50 p-1 mb-6">
          {(['login', 'register'] ).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Вход' : 'Регистрация'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Иван Иванов"
                className="input-field"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Минимум 6 символов"
                className="input-field pr-12"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>

      <p className="text-slate-500 text-xs mt-6 text-center px-4">
        Данные хранятся только на вашем устройстве
      </p>
    </div>
  )
}
