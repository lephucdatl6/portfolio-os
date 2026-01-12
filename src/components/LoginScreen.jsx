import { useState, useEffect } from 'react';
import './LoginScreen.css';

export default function LoginScreen({ onLoginComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle click to start loading and play sound
  const handleStart = () => {
    if (isLoading) return;
    
    setIsLoading(true);

    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / duration) * 100, 100);
      setProgress(percent);

      if (elapsed >= duration) {
        clearInterval(interval);
        
        // Play sound when loading is done
        const audio = new Audio('/sounds/startup.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => console.log('Sound blocked'));
        
        setTimeout(onLoginComplete, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  };

  return (
    <div className="login-container">
      {/* Windows boot background */}
      <div className="login-background"></div>

      {/* Login content */}
      <div className="login-content">
        {/* Avatar */}
        <div className="avatar-container">
          <img src="/assets/avatar.jpg" alt="User Avatar" className="avatar" />
        </div>

        {/* User name */}
        <h2 className="user-name">Dave</h2>

        {/* Fixed container for spinner and button */}
        <div className="action-container">
          {/* Loading spinner */}
          {isLoading && (
            <div className="loading-wrapper">
              <div className="loader">
                <div className="dot"></div>
              </div>
              <div className="loader">
                <div className="dot"></div>
              </div>
              <div className="loader">
                <div className="dot"></div>
              </div>
              <div className="loader">
                <div className="dot"></div>
              </div>
              <div className="loader">
                <div className="dot"></div>
              </div>
              <div className="loader">
                <div className="dot"></div>
              </div>
            </div>
          )}

          {/* Sign in button or loading state */}
          {!isLoading ? (
            <button className="sign-in-button" onClick={handleStart}>
              Sign in
            </button>
          ) : (
            <p className="welcome-text">Welcome to my portfolio</p>
          )}
        </div>
      </div>
    </div>
  );
}
