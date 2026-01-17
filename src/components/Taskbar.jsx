import { useState, useEffect } from 'react';
import './Taskbar.css';
import StartMenu from './StartMenu';

export default function Taskbar({ openApps = {}, onOpenApp, onCloseApp, minimizedApps = {}, onMinimizeApp, onFocusApp, appOpenOrder = [], onShutdown }) {
  const [time, setTime] = useState(new Date());
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarClosing, setCalendarClosing] = useState(false);

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

  const formatCalendarDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCalendarHeader = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      
      days.push({
        date: currentDate.getDate(),
        fullDate: new Date(currentDate),
        isCurrentMonth,
        isToday
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const handleCalendarClose = () => {
    if (calendarClosing) return;
    setCalendarClosing(true);
    setTimeout(() => {
      setCalendarOpen(false);
      setCalendarClosing(false);
    }, 200);
  };

  const handleCalendarToggle = () => {
    if (calendarClosing) return;
    if (calendarOpen) {
      handleCalendarClose();
    } else {
      setCalendarOpen(true);
    }
  };

  const renderAppIcon = (appName) => {
    if (!openApps[appName]) return null;

    const appConfig = {
      resume: {
        icon: '/assets/icons/pdf.jpg',
        alt: 'PDF Viewer',
        title: minimizedApps.resume ? 'PDF' : 'PDF'
      },
      mail: {
        icon: '/assets/icons/mail.png', 
        alt: 'Mail',
        title: minimizedApps.mail ? 'Mail' : 'Contact Me'
      },
      github: {
        icon: '/assets/icons/github.svg',
        alt: 'GitHub',
        title: minimizedApps.github ? 'GitHub' : 'GitHub'
      },
      projects: {
        icon: '/assets/icons/file explorer.png',
        alt: 'Folder',
        title: minimizedApps.projects ? 'Folder' : 'Projects'
      },
      profile: {
        icon: '/assets/icons/profile.png',
        alt: 'Profile',
        title: minimizedApps.profile ? 'Profile' : 'Profile'
      },
      about: {
        icon: '/assets/icons/terminal.png',
        alt: 'Terminal',
        title: minimizedApps.about ? 'Terminal' : 'Terminal'
      }
    };

    const config = appConfig[appName];
    if (!config) return null;

    return (
      <button 
        key={appName}
        className={`app-icon ${minimizedApps[appName] ? 'minimized' : 'open'}`}
        onClick={() => {
          onMinimizeApp(appName);
          if (minimizedApps[appName] && onFocusApp) {
            onFocusApp(appName);
          }
        }}
        title={config.title}
      >
        <img src={config.icon} alt={config.alt} />
      </button>
    );
  };

  return (
    <>
      <StartMenu isOpen={startMenuOpen} onClose={() => setStartMenuOpen(false)} onOpenApp={onOpenApp} onShutdown={onShutdown} />
      
      {/* Calendar Popup */}
      {(calendarOpen || calendarClosing) && (
        <>
          <div className="calendar-overlay" onClick={handleCalendarClose}></div>
          <div className={`calendar-popup ${calendarClosing ? 'closing' : ''}`}>
            <div className="calendar-header">
              <div className="calendar-date-display">
                <div className="calendar-full-date">{formatCalendarDate(time)}</div>
              </div>
            </div>
            <div className="calendar-month-header">
              {formatCalendarHeader(time)}
            </div>
            
            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Day headers */}
              <div className="calendar-day-headers">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="calendar-days">
                {generateCalendarDays(time).map((day, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''}`}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

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
          {/* App Icons in opening order */}
          {appOpenOrder.map(appName => renderAppIcon(appName))}
        </div>

        {/* Right Spacer */}
        <div className="taskbar-spacer"></div>

        {/* System Tray */}
        <div className="system-tray">
          <div className="clock" onClick={handleCalendarToggle}>
            <div className="time">{formatTime(time)}</div>
            <div className="date">{formatDate(time)}</div>
          </div>
        </div>
      </div>

    </>
  );
}
