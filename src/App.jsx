import { useRef, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from './store/useAppStore'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import History from './components/History'
import Profile from './components/Profile'
import ScannerModal from './components/ScannerModal'
import AddMealModal from './components/AddMealModal'

export default function App() {
  const currentUser   = useAppStore((s) => s.currentUser)
  const onboardingDone = useAppStore((s) => s.onboardingDone)
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone)

  const [activeTab,    setActiveTab]    = useState('dashboard')
  const [pendingFile,  setPendingFile]  = useState(null)
  const [showAddMeal,  setShowAddMeal]  = useState(false)
  const fileRef = useRef(null)

  // ── File picker handlers (triggered by FAB → Scan) ─────────────────────────
  const handleScanClick = () => {
    if (fileRef.current) {
      fileRef.current.value = ''
      fileRef.current.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ''
  }

  const handleScanClose = () => setPendingFile(null)

  // ── Manual meal entry ──────────────────────────────────────────────────────
  const handleAddMeal = () => setShowAddMeal(true)

  // ── Onboarding gate ────────────────────────────────────────────────────────
  if (!onboardingDone) {
    return (
      <>
        <ToasterConfig />
        <Onboarding onDone={setOnboardingDone} />
      </>
    )
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <>
        <ToasterConfig />
        <Auth />
      </>
    )
  }

  return (
    <>
      <ToasterConfig />

      {/* Hidden file input — triggered by FAB → Scan */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onScanClick={handleScanClick}
        onAddMeal={handleAddMeal}
      >
        {activeTab === 'dashboard' && <Dashboard onAddMeal={handleAddMeal} onScanClick={handleScanClick} />}
        {activeTab === 'history'   && <History onAddMeal={handleAddMeal} />}
        {activeTab === 'profile'   && <Profile />}
      </Layout>

      {/* AI Scanner overlay */}
      <ScannerModal file={pendingFile} onClose={handleScanClose} />

      {/* Manual meal entry modal */}
      {showAddMeal && <AddMealModal onClose={() => setShowAddMeal(false)} />}
    </>
  )
}

// ─── Toast config ─────────────────────────────────────────────────────────────
function ToasterConfig() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1e293b',
          color:       '#f1f5f9',
          border:      '1px solid #334155',
          borderRadius:'14px',
          fontSize:    '14px',
          maxWidth:    '340px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  )
}
