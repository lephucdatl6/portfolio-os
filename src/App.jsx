import { useState } from 'react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import DesktopLayout from './layouts/DesktopLayout'

function App() {
  const [showDesktop, setShowDesktop] = useState(false)

  return (
    <>
      {!showDesktop ? (
        <LoginScreen onLoginComplete={() => setShowDesktop(true)} />
      ) : (
        <DesktopLayout />
      )}
    </>
  )
}

export default App
