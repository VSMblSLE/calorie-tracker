import { useState } from 'react'
import { Home, History, User, Camera, Plus, X } from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { id: 'dashboard', label: 'Главная',  Icon: Home    },
  { id: 'history',   label: 'История',  Icon: History },
  { id: 'profile',   label: 'Профиль',  Icon: User    },
]

export default function Layout({ activeTab, setActiveTab, onScanClick, onAddMeal, children }) {
  const [fabOpen, setFabOpen] = useState(false)

  const handleScan = () => {
    setFabOpen(false)
    onScanClick()
  }

  const handleManual = () => {
    setFabOpen(false)
    onAddMeal()
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-ddx-bg text-white max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      {/* FAB menu backdrop */}
      {fabOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 max-w-md mx-auto" onClick={() => setFabOpen(false)} />
      )}

      {/* FAB menu options */}
      {fabOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-fade-in">
          <button
            onClick={handleScan}
            className="flex items-center gap-3 bg-ddx-elevated border border-ddx-border2 rounded-2xl px-5 py-3 shadow-neon-purple hover:border-violet-500/60 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
              <Camera size={20} className="text-fuchsia-400" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Сканировать фото</p>
              <p className="text-ddx-muted text-[11px]">AI определит блюдо</p>
            </div>
          </button>
          <button
            onClick={handleManual}
            className="flex items-center gap-3 bg-ddx-elevated border border-ddx-border2 rounded-2xl px-5 py-3 shadow-neon-purple hover:border-violet-500/60 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Plus size={20} className="text-violet-400" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Добавить вручную</p>
              <p className="text-ddx-muted text-[11px]">Поиск или ручной ввод</p>
            </div>
          </button>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-ddx-card/95 backdrop-blur-md border-t border-ddx-border z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {TABS.map(({ id, label, Icon }, i) => {
            if (i === 1) {
              return (
                <div key="fab-slot" className="flex flex-col items-center w-16">
                  <div className="h-10" />
                </div>
              )
            }
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  'flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl transition-all',
                  active ? 'text-violet-400' : 'text-ddx-muted hover:text-ddx-text'
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Central FAB */}
      <button
        onClick={() => setFabOpen(!fabOpen)}
        className={clsx(
          'fixed bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all z-50',
          fabOpen
            ? 'bg-ddx-elevated border-2 border-ddx-border2 rotate-45 shadow-neon-purple'
            : 'bg-violet-600 hover:bg-violet-500 active:scale-95 shadow-neon-purple'
        )}
        aria-label="Добавить блюдо"
      >
        {fabOpen ? <X size={26} className="text-white" /> : <Plus size={26} strokeWidth={2.5} className="text-white" />}
      </button>
    </div>
  )
}
