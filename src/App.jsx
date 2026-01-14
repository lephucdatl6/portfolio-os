import { useState } from 'react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import DesktopLayout from './layouts/DesktopLayout'
import MailWindow from './windows/MailWindow'
import PdfViewerWindow from './windows/PdfViewerWindow'
import ContactForm from './components/ContactForm'

function App() {
  const [showDesktop, setShowDesktop] = useState(false)
  const [openApps, setOpenApps] = useState({})
  const [minimizedApps, setMinimizedApps] = useState({})
  const [maximizedApps, setMaximizedApps] = useState({})
  const [appOpenOrder, setAppOpenOrder] = useState([])

  const handleOpenApp = (appName) => {
    setOpenApps(prev => ({
      ...prev,
      [appName]: true
    }))
    // Add to order if not already open
    setAppOpenOrder(prev => {
      if (!prev.includes(appName)) {
        return [...prev, appName]
      }
      return prev
    })
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
    // Remove from order when closed
    setAppOpenOrder(prev => prev.filter(name => name !== appName))
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
            appOpenOrder={appOpenOrder}
            onMaximizeApp={handleMaximizeApp}
          />
          {openApps.mail && (
            <MailWindow 
              onClose={() => handleCloseApp('mail')}
              onMinimize={() => handleMinimizeApp('mail')}
              onMaximize={() => handleMaximizeApp('mail')}
              isMaximized={maximizedApps.mail}
              isMinimized={minimizedApps.mail}
            />
          )}
          {openApps.resume && (
            <PdfViewerWindow 
              onClose={() => handleCloseApp('resume')}
              onMinimize={() => handleMinimizeApp('resume')}
              onMaximize={() => handleMaximizeApp('resume')}
              isMaximized={maximizedApps.resume}
              isMinimized={minimizedApps.resume}
            />
          )}
          {openApps.contact && (
            <div style={{position:'fixed',right:20,bottom:20,background:'white',padding:16,borderRadius:8,boxShadow:'0 6px 24px rgba(0,0,0,0.12)'}}>
              <ContactForm />
            </div>
          )}
        </>
      )}
    </>
  )
}

export default App
