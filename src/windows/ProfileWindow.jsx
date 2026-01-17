import { useState, useEffect } from 'react';
import './ProfileWindow.css';

export default function ProfileWindow({ onClose, onMinimize, onMaximize, onFocus, zIndex, isMaximized, isMinimized }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 900, height: 650 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  const basePath = ['Profile'];
  const [path, setPath] = useState(basePath);

  useEffect(() => {
    const centerX = window.innerWidth / 2 - size.width / 2;
    const centerY = window.innerHeight / 2 - size.height / 2;
    setPosition({ x: centerX, y: centerY });
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

  if (isMinimized) return null;

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
        <div className="profile-title"><span>Profile</span></div>
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
          </div>
          <div className="address-bar" role="navigation" aria-label="Address bar">
            <div className="address-path">
              {path.map((segment, idx) => (
                <span key={idx} className="path-wrapper">
                  <button className="path-segment" onClick={() => goToIndex(idx)} disabled={idx < basePath.length - 1} aria-current={idx === path.length - 1 ? 'page' : undefined}>
                    {segment}
                  </button>
                  {idx < path.length - 1 && (<img src="/assets/icons/arrow_right.svg" alt="" className="chevron-icon" />)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="explorer-body">
          <aside className="profile-sidebar" aria-label="Profile sections">
            <div className="sidebar-section">
              <div className="sidebar-title">Social Links</div>
              <div className="sidebar-list">
                <button className="sidebar-item" onClick={() => window.open('https://github.com/lephucdatl6', '_blank')} title="GitHub">
                  <img className="icon" src="/assets/icons/github.svg" alt="" /><span>GitHub</span>
                </button>
                <button className="sidebar-item" onClick={() => window.open('https://www.linkedin.com/in/dat-le-b500a61bb', '_blank')} title="LinkedIn">
                  <img className="icon" src="/assets/icons/linkedin.png" alt="" /><span>LinkedIn</span>
                </button>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Skills</div>
              <div className="sidebar-list">
                <div className="sidebar-item"><img className="icon" src="/assets/icons/placeholder.png" alt="" /><span>Placeholder</span></div>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Software</div>
              <div className="sidebar-list">
                <div className="sidebar-item"><img className="icon" src="/assets/icons/placeholder.png" alt="" /><span>Placeholder</span></div>
              </div>
            </div>
          </aside>

          <div className="profile-main" />
        </div>
      </div>
    </div>
  );
}
