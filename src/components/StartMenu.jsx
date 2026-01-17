import { useState } from 'react';
import './StartMenu.css';

export default function StartMenu({ isOpen, onClose, onOpenApp, onShutdown }) {
  const apps = [
    { id: 6, name: 'Profile', icon: '/assets/icons/profile.png', action: 'profile' },
    { id: 3, name: 'Projects', icon: '/assets/icons/folder.png', action: 'projects' },
    { id: 1, name: 'Resume', icon: '/assets/icons/pdf.jpg', action: 'resume' },
    { id: 5, name: 'GitHub', icon: '/assets/icons/github.svg', action: 'github' },
    { id: 4, name: 'Contact Me', icon: '/assets/icons/mail.png', action: 'mail' },
    { id: 2, name: 'Terminal', icon: '/assets/icons/terminal.png', action: 'about' },
  ];

  const handleAppClick = (app) => {
    if (app.action && onOpenApp) {
      onOpenApp(app.action);
      onClose();
    }
  };

  const handleShutdown = () => {
    onClose(); // Close the start menu first
    if (onShutdown) {
      onShutdown(); // Call the shutdown function passed from parent
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="start-menu-overlay" onClick={onClose}></div>
      <div className="start-menu">
        {/* Pinned Section */}
        <div className="start-menu-section">
          <h3 className="section-title">Pinned</h3>
          <div className="start-menu-grid">
            {apps.map(app => (
              <button key={app.id} className="start-menu-item" title={app.name} onClick={() => handleAppClick(app)}>
                <img src={app.icon} alt={app.name} />
                <span>{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="start-menu-footer">
          <div className="user-section">
            <img src="/assets/avatar.jpg" alt="User" className="footer-avatar" />
            <span className="user-name">Dave</span>
          </div>
          <button className="footer-button power-button" title="Shutdown" onClick={handleShutdown}>
            ⏻
          </button>
        </div>
      </div>
    </>
  );
}
