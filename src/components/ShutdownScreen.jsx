import { useState, useEffect } from 'react';
import './ShutdownScreen.css';

export default function ShutdownScreen({ onShutdownComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / duration) * 100, 100);
      setProgress(percent);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(onShutdownComplete, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onShutdownComplete]);

  return (
    <div className="shutdown-container">
      <div className="shutdown-content">
        {/* Loading spinner from login screen */}
        <div className="shutdown-loading-wrapper">
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

        {/* Shutdown message */}
        <h2 className="shutdown-message">Shutting down</h2>
      </div>
    </div>
  );
}