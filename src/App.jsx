import { useState } from 'react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import ShutdownScreen from './components/ShutdownScreen'
import DesktopLayout from './layouts/DesktopLayout'
import MailWindow from './windows/MailWindow'
import PdfViewerWindow from './windows/PdfViewerWindow'
import GitHubWindow from './windows/GitHubWindow'
import ProjectsWindow from './windows/ProjectsWindow'
import AboutWindow from './windows/AboutWindow'
import ContactForm from './components/ContactForm'

function App() {
  const [showDesktop, setShowDesktop] = useState(false)
  const [showShutdown, setShowShutdown] = useState(false)
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

  const handleShutdown = () => {
    // Show shutdown screen first
    setShowShutdown(true)
    setShowDesktop(false)
  }

  const handleShutdownComplete = () => {
    // Reset all states and go back to login screen
    setOpenApps({})
    setMinimizedApps({})
    setMaximizedApps({})
    setAppOpenOrder([])
    setShowShutdown(false)
    setShowDesktop(false)
  }

  return (
    <>
      {showShutdown ? (
        <ShutdownScreen onShutdownComplete={handleShutdownComplete} />
      ) : !showDesktop ? (
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
            onShutdown={handleShutdown}
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
          {openApps.github && (
            <GitHubWindow 
              onClose={() => handleCloseApp('github')}
              onMinimize={() => handleMinimizeApp('github')}
              onMaximize={() => handleMaximizeApp('github')}
              isMaximized={maximizedApps.github}
              isMinimized={minimizedApps.github}
            />
          )}
          {openApps.projects && (
            <ProjectsWindow 
              onClose={() => handleCloseApp('projects')}
              onMinimize={() => handleMinimizeApp('projects')}
              onMaximize={() => handleMaximizeApp('projects')}
              isMaximized={maximizedApps.projects}
              isMinimized={minimizedApps.projects}
            />
          )}
          {openApps.about && (
            <AboutWindow 
              onClose={() => handleCloseApp('about')}
              onMinimize={() => handleMinimizeApp('about')}
              onMaximize={() => handleMaximizeApp('about')}
              isMaximized={maximizedApps.about}
              isMinimized={minimizedApps.about}
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
