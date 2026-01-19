import { useState, useEffect } from 'react';
import './ProfileWindow.css';

export default function ProfileWindow({ onClose, onMinimize, onMaximize, onFocus, zIndex, isMaximized, isMinimized }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1000, height: 715 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 769 : false));

  const basePath = ['This PC', 'About Me'];
  const [path, setPath] = useState(basePath);

  useEffect(() => {
    const centerX = Math.round(window.innerWidth / 2 - size.width / 2);
    const centerY = Math.round((window.innerHeight + 20) / 2 - size.height / 2);
    setPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) });
}, []);

  // Sidebar default matches desktop/mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 769);
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.profile-controls') || e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const MIN_VISIBLE = 200;
      const HEADER_GRAB_HEIGHT = 60;
      const clampedX = Math.min(Math.max(newX, -size.width + MIN_VISIBLE), window.innerWidth - MIN_VISIBLE);
      const clampedY = Math.min(Math.max(newY, -HEADER_GRAB_HEIGHT), window.innerHeight - MIN_VISIBLE);
      setPosition({ x: clampedX, y: clampedY });
    }

    if (isResizing && resizeType) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.posX;
      let newY = resizeStart.posY;

      if (resizeType.includes('right')) {
        newWidth = Math.max(400, resizeStart.width + deltaX);
        newWidth = Math.min(newWidth, window.innerWidth - resizeStart.posX);
      }
      if (resizeType.includes('left')) {
        newWidth = Math.max(400, resizeStart.width - deltaX);
        newX = resizeStart.posX + deltaX;
        if (newX < 0) { newX = 0; newWidth = resizeStart.width + resizeStart.posX; }
        if (newWidth === 400) { newX = resizeStart.posX + (resizeStart.width - 400); }
      }
      if (resizeType.includes('bottom')) {
        newHeight = Math.max(300, resizeStart.height + deltaY);
        const maxHeight = window.innerHeight - resizeStart.posY;
        newHeight = Math.min(newHeight, maxHeight);
      }
      if (resizeType.includes('top')) {
        newHeight = Math.max(300, resizeStart.height - deltaY);
        newY = resizeStart.posY + deltaY;
        if (newY < 0) { newY = 0; newHeight = resizeStart.height + resizeStart.posY; }
        if (newHeight === 300) { newY = resizeStart.posY + (resizeStart.height - 300); }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); setResizeType(''); };

  const handleResizeStart = (e, type) => {
    e.preventDefault(); e.stopPropagation();
    setIsResizing(true); setResizeType(type);
    setResizeStart({ x: e.clientX, y: e.clientY, width: size.width, height: size.height, posX: position.x, posY: position.y });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeType]);

  const goUp = () => { setPath((prev) => (prev.length > basePath.length ? prev.slice(0, prev.length - 1) : prev)); };
  const goToIndex = (index) => { setPath((prev) => (index < basePath.length - 1 ? prev : prev.slice(0, index + 1))); };

  return (
    <div
      className={`profile-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={!isMaximized ? { left: `${position.x}px`, top: `${position.y}px`, width: `${size.width}px`, height: `${size.height}px`, zIndex: zIndex || 1000 } : { zIndex: zIndex || 1000 }}
      onMouseDown={(e) => { handleMouseDown(e); if (onFocus) onFocus(); }}
    >
      {!isMaximized && (
        <>
          <div className="resize-handle resize-top" onMouseDown={(e) => handleResizeStart(e, 'top')} />
          <div className="resize-handle resize-right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
          <div className="resize-handle resize-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
          <div className="resize-handle resize-left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
          <div className="resize-handle resize-top-left" onMouseDown={(e) => handleResizeStart(e, 'top left')} />
          <div className="resize-handle resize-top-right" onMouseDown={(e) => handleResizeStart(e, 'top right')} />
          <div className="resize-handle resize-bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom left')} />
          <div className="resize-handle resize-bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom right')} />
        </>
      )}

      <div className="profile-header">
        <div className="profile-title"><span>About Me</span></div>
        <div className="profile-controls">
          <button className="control-btn minimize-btn" onClick={onMinimize}><span>−</span></button>
          <button className="control-btn maximize-btn" onClick={onMaximize}><span>{isMaximized ? '❐' : '□'}</span></button>
          <button className="control-btn close-btn" onClick={onClose}><span>×</span></button>
        </div>
      </div>

      <div className="profile-content explorer-container">
        <div className="explorer-toolbar">
          <div className="nav-buttons">
            <button className="nav-btn" onClick={goUp} disabled={path.length === basePath.length} title="Back" aria-label="Back">
              <img src="/assets/icons/back_arrow.svg" alt="Back" className="nav-icon" />
            </button>
            <button
              className="nav-btn sidebar-toggle"
              onClick={() => setIsSidebarOpen((s) => !s)}
              title="Toggle sections"
              aria-label="Toggle sections"
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>☰</span>
            </button>
          </div>
          <div className="address-bar" role="navigation" aria-label="Address bar">
            <div className="address-path">
              {path.map((segment, idx) => (
                <span key={idx} className="path-wrapper">
                  <button className="path-segment" onClick={() => goToIndex(idx)} aria-current={idx === path.length - 1 ? 'page' : undefined}>
                    {segment}
                  </button>
                  {idx < path.length - 1 && (<img src="/assets/icons/arrow_right.svg" alt="" className="chevron-icon" />)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="explorer-body">
          <aside className={`profile-sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Profile sections">
            <div className="sidebar-section">
              <div className="sidebar-title">Social Links</div>
              <div className="sidebar-list">
                <button className="sidebar-item clickable" onClick={() => window.open('https://github.com/lephucdatl6', '_blank')} title="GitHub">
                  <img className="icon" src="/assets/icons/github.svg" alt="" /><span>GitHub</span>
                </button>
                <button className="sidebar-item clickable" onClick={() => window.open('https://www.linkedin.com/in/dat-le-b500a61bb', '_blank')} title="LinkedIn">
                  <img className="icon" src="/assets/icons/linkedin.png" alt="" /><span>LinkedIn</span>
                </button>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Skills</div>
              <div className="sidebar-list">
                <div className="sidebar-item"><img className="icon" src="/assets/icons/console.png" alt="" /><span>Frontend & Backend</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/web&mobile.png" alt="" /><span>Web & Mobile</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/api.png" alt="" /><span>API integration</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/endtoend.png" alt="" /><span>End‑to‑end development</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/solve.png" alt="" /><span>Problem solving</span></div>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Tech stack</div>
              <div className="sidebar-list">
                <div className="sidebar-item"><img className="icon" src="/assets/icons/reactnative.png" alt="" /><span>React Native</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/reactjs.png" alt="" /><span>ReactJS</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/javascript.png" alt="" /><span>JavaScript</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/typescript.png" alt="" /><span>TypeScript</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/html.png" alt="" /><span>HTML</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/css.png" alt="" /><span>CSS</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/java.png" alt="" /><span>Java</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/nodejs.png" alt="" /><span>NodeJS</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/mongodb.png" alt="" /><span>MongoDB</span></div>
                <div className="sidebar-item"><img className="icon" src="/assets/icons/postgresql.png" alt="" /><span>PostgreSQL</span></div>
              </div>
            </div>
          </aside>

          {isSidebarOpen && (
            <div className="sidebar-backdrop visible" onClick={() => setIsSidebarOpen(false)} />
          )}

          <div className="profile-main">
            <div className="info-card">
              <div className="about-card">
              <div className="info-title">
                <span>About Me</span>
              </div>
                <div className="about-content">
                  <p className="about-paragraph">
                    I am a final-year Computing student currently completing my OJT as part of my graduation. I am focused on becoming a full-stack, web, and mobile developer, with a strong interest in building real-world applications that are both functional and well-designed. I consider myself a fast learner who adapts quickly, can work independently when needed, and collaborates well in a team environment.
                  </p>

                  <p className="about-paragraph">
                    I chose computing because it allows me to turn ideas into real, usable features. I enjoy thinking about how a product should work, how users will interact with it, and how individual functions and components come together to form a complete application and building something from start to finish and refining it until it feels right is the most rewarding part for me.
                  </p>

                  <p className="about-paragraph">
                    This portfolio is designed as a Windows-style desktop experience because it is familiar and intuitive, allowing non-technical users to explore it easily while still showcasing my technical and UI thinking. It is one of my personal projects, built as I continue developing my skills in React with Vite for web and mobile development. My goal is to secure a junior role where I can learn industry best practices through real professional experience.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
