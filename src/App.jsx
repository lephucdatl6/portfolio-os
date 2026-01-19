import { useState } from 'react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import ShutdownScreen from './components/ShutdownScreen'
import DesktopLayout from './layouts/DesktopLayout'
import Taskbar from './components/Taskbar'
import MailWindow from './windows/MailWindow'
import PdfViewerWindow from './windows/PdfViewerWindow'
import GitHubWindow from './windows/GitHubWindow'
import FolderWindow from './windows/FolderWindow'
import TerminalWindow from './windows/TerminalWindow'
import ProfileWindow from './windows/ProfileWindow'
import ContactForm from './components/ContactForm'

function App() {
  const [showDesktop, setShowDesktop] = useState(false)
  const [showShutdown, setShowShutdown] = useState(false)
  const [openApps, setOpenApps] = useState({})
  const [minimizedApps, setMinimizedApps] = useState({})
  const [maximizedApps, setMaximizedApps] = useState({})
  const [appOpenOrder, setAppOpenOrder] = useState([])
  const [focusedApp, setFocusedApp] = useState(null)

  const handleOpenApp = (appName) => {
    setOpenApps(prev => ({
      ...prev,
      [appName]: true
    }))
    // Add to order only if not already present (keep taskbar order stable)
    setAppOpenOrder(prev => {
      if (!prev.includes(appName)) return [...prev, appName]
      return prev
    })
    // Focus the newly opened app
    setFocusedApp(appName)
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
    // Clear focus if closing focused app
    if (focusedApp === appName) {
      setFocusedApp(null)
    }
  }

  const handleMinimizeApp = (appName) => {
    setMinimizedApps(prev => {
      const isNowMinimized = !prev[appName];
      const next = {
        ...prev,
        [appName]: isNowMinimized
      };

      // If minimizing the currently focused app, clear focus.
      // If restoring, focus the app.
      if (isNowMinimized) {
        setFocusedApp(prevFocus => (prevFocus === appName ? null : prevFocus));
      } else {
        setFocusedApp(appName);
      }

      return next;
    })
  }

  const handleMaximizeApp = (appName) => {
    setMaximizedApps(prev => ({
      ...prev,
      [appName]: !prev[appName]
    }))
  }

  const handleFocusApp = (appName) => {
    setFocusedApp(appName)
  }

  const getWindowZIndex = (appName) => {
    // Focused app should always be on top
    if (focusedApp === appName) return 2000
    // Otherwise determine zIndex based on open order
    const idx = appOpenOrder.indexOf(appName)
    return 1000 + (idx >= 0 ? (idx + 1) * 10 : 0)
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
            minimizedApps={minimizedApps}
            onMinimizeApp={handleMinimizeApp}
          />
          {openApps.mail && (
            <MailWindow 
              onClose={() => handleCloseApp('mail')}
              onMinimize={() => handleMinimizeApp('mail')}
              onMaximize={() => handleMaximizeApp('mail')}
              onFocus={() => handleFocusApp('mail')}
              zIndex={getWindowZIndex('mail')}
              isMaximized={maximizedApps.mail}
              isMinimized={minimizedApps.mail}
            />
          )}
          {openApps.resume && (
            <PdfViewerWindow 
              onClose={() => handleCloseApp('resume')}
              onMinimize={() => handleMinimizeApp('resume')}
              onMaximize={() => handleMaximizeApp('resume')}
              onFocus={() => handleFocusApp('resume')}
              zIndex={getWindowZIndex('resume')}
              isMaximized={maximizedApps.resume}
              isMinimized={minimizedApps.resume}
            />
          )}
          {openApps.github && (
            <GitHubWindow 
              onClose={() => handleCloseApp('github')}
              onMinimize={() => handleMinimizeApp('github')}
              onMaximize={() => handleMaximizeApp('github')}
              onFocus={() => handleFocusApp('github')}
              zIndex={getWindowZIndex('github')}
              isMaximized={maximizedApps.github}
              isMinimized={minimizedApps.github}
            />
          )}
          {openApps.projects && (
            <FolderWindow 
              onClose={() => handleCloseApp('projects')}
              onMinimize={() => handleMinimizeApp('projects')}
              onMaximize={() => handleMaximizeApp('projects')}
              onFocus={() => handleFocusApp('projects')}
              zIndex={getWindowZIndex('projects')}
              isMaximized={maximizedApps.projects}
              isMinimized={minimizedApps.projects}
            />
          )}
          {openApps.profile && (
            <ProfileWindow 
              onClose={() => handleCloseApp('profile')}
              onMinimize={() => handleMinimizeApp('profile')}
              onMaximize={() => handleMaximizeApp('profile')}
              onFocus={() => handleFocusApp('profile')}
              zIndex={getWindowZIndex('profile')}
              isMaximized={maximizedApps.profile}
              isMinimized={minimizedApps.profile}
            />
          )}
          {openApps.terminal && (
            <TerminalWindow 
              onClose={() => handleCloseApp('terminal')}
              onMinimize={() => handleMinimizeApp('terminal')}
              onMaximize={() => handleMaximizeApp('terminal')}
              onFocus={() => handleFocusApp('terminal')}
              zIndex={getWindowZIndex('terminal')}
              isMaximized={maximizedApps.terminal}
              isMinimized={minimizedApps.terminal}
            />
          )}
          {openApps.contact && (
            <div style={{position:'fixed',right:20,bottom:20,background:'white',padding:16,borderRadius:8,boxShadow:'0 6px 24px rgba(0,0,0,0.12)'}}>
              <ContactForm />
            </div>
          )}

          {/* Render Taskbar last to guarantee topmost visual stacking */}
          <Taskbar 
            openApps={openApps}
            onOpenApp={handleOpenApp}
            onCloseApp={handleCloseApp}
            minimizedApps={minimizedApps}
            onMinimizeApp={handleMinimizeApp}
            onFocusApp={handleFocusApp}
            appOpenOrder={appOpenOrder}
            focusedApp={focusedApp}
            onShutdown={handleShutdown}
          />
        </>
      )}
    </>
  )
}

export default App
