import { useState } from 'react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import DesktopLayout from './layouts/DesktopLayout'
import Mail from './components/Mail'

function App() {
  const [showDesktop, setShowDesktop] = useState(false)
  const [openApps, setOpenApps] = useState({})
  const [minimizedApps, setMinimizedApps] = useState({})
  const [maximizedApps, setMaximizedApps] = useState({})

  const handleOpenApp = (appName) => {
    setOpenApps(prev => ({
      ...prev,
      [appName]: true
    }))
  }

  const handleCloseApp = (appName) => {
    setOpenApps(prev => {
      const newState = { ...prev }
      delete newState[appName]
      return newState
    })
    setMinimizedApps(prev => {
      const newState = { ...prev }
      delete newState[appName]
      return newState
    })
  }

  const handleMinimizeApp = (appName) => {
    setMinimizedApps(prev => ({
      ...prev,
      [appName]: !prev[appName]
    }))
  }

  const handleMaximizeApp = (appName) => {
    setMaximizedApps(prev => ({
      ...prev,
      [appName]: !prev[appName]
    }))
  }

  return (
    <>
      {!showDesktop ? (
        <LoginScreen onLoginComplete={() => setShowDesktop(true)} />
      ) : (
        <>
          <DesktopLayout 
            onOpenApp={handleOpenApp}
            openApps={openApps}
            onCloseApp={handleCloseApp}
            minimizedApps={minimizedApps}
            maximizedApps={maximizedApps}
            onMinimizeApp={handleMinimizeApp}
            onMaximizeApp={handleMaximizeApp}
          />
          {openApps.mail && (
            <Mail 
              onClose={() => handleCloseApp('mail')}
              onMinimize={() => handleMinimizeApp('mail')}
              onMaximize={() => handleMaximizeApp('mail')}
              isMaximized={maximizedApps.mail}
              isMinimized={minimizedApps.mail}
            />
          )}
        </>
      )}
    </>
  )
}

export default App
