import { Home, History, User, Camera } from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { id: 'dashboard', label: 'Главная',  Icon: Home    },
  { id: 'history',   label: 'История',  Icon: History },
  { id: 'profile',   label: 'Профиль',  Icon: User    },
]

export default function Layout({ activeTab, setActiveTab, onScanClick, children }) {
  return (
    <div className="relative flex flex-col min-h-screen bg-slate-900 text-white max-w-md mx-auto">
      {/* scrollable content */}
      <main className="flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {TABS.map(({ id, label, Icon }, i) => {
            // Central slot occupied by FAB
            if (i === 1) {
              return (
                <div key="fab-slot" className="flex flex-col items-center w-16">
                  {/* placeholder height so other tabs align */}
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
                  active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
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
        onClick={onScanClick}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 shadow-xl shadow-emerald-500/40 flex items-center justify-center transition-all z-50"
        aria-label="Сфотографировать блюдо"
      >
        <Camera size={26} strokeWidth={2} className="text-white" />
      </button>
    </div>
  )
}
