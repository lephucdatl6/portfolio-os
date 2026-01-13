import { useState, useEffect } from 'react';
import './Taskbar.css';
import StartMenu from './StartMenu';

export default function Taskbar({ openApps = {}, onOpenApp, onCloseApp, minimizedApps = {}, onMinimizeApp }) {
  const [time, setTime] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <StartMenu isOpen={startMenuOpen} onClose={() => setStartMenuOpen(false)} onOpenApp={onOpenApp} />
      <div className="taskbar">
        {/* Start Button - Far Left */}
        <button 
          className={`start-button ${startMenuOpen ? 'active' : ''}`}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <img src="/assets/icons/Start_Dark.png" alt="Start" className="windows-icon" />
        </button>
        
        {/* Center Apps */}
        <div className="taskbar-center">
          {/* App Icons */}
          {openApps.mail && (
            <button 
              className={`app-icon ${minimizedApps.mail ? 'minimized' : 'open'}`}
              onClick={() => onMinimizeApp('mail')} 
              title={minimizedApps.mail ? 'Restore Mail' : 'Minimize Mail'}
            >
              <img src="/assets/icons/mail.png" alt="Mail" />
            </button>
          )}
        </div>

        {/* Right Spacer */}
        <div className="taskbar-spacer"></div>

        {/* System Tray */}
        <div className="system-tray">
          <div className="clock">
            <div className="time">{formatTime(time)}</div>
          <div className="date">{formatDate(time)}</div>
        </div>
      </div>
    </div>
    </>
  );
}
