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
  const handleAddMeal = () => setShowAddMeal(true)

  if (!onboardingDone) {
    return (
      <>
        <ToasterConfig />
        <Onboarding onDone={setOnboardingDone} />
      </>
    )
  }

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

      <ScannerModal file={pendingFile} onClose={handleScanClose} />
      {showAddMeal && <AddMealModal onClose={() => setShowAddMeal(false)} />}
    </>
  )
}

function ToasterConfig() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#160830',
          color:       '#f0e6ff',
          border:      '1px solid #3d1a7a',
          borderRadius:'14px',
          fontSize:    '14px',
          maxWidth:    '340px',
        },
        success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
      }}
    />
  )
}
