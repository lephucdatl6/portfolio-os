import { useState, useEffect } from 'react';
import './ProjectsWindow.css';

export default function ProjectsWindow({ onClose, onMinimize, onMaximize, onFocus, zIndex, isMaximized, isMinimized }) {
  const TASKBAR_HEIGHT = 60;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  // Initialize position to center on mount
  useEffect(() => {
    const centerX = window.innerWidth / 2 - 450;
    const centerY = window.innerHeight / 2 - 350; 
    setPosition({ x: centerX, y: centerY });
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.projects-controls') || e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const clampedX = Math.min(Math.max(newX, 0), Math.max(0, window.innerWidth - size.width));
      const maxY = Math.max(0, window.innerHeight - TASKBAR_HEIGHT - size.height);
      const clampedY = Math.min(Math.max(newY, 0), maxY);
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
        if (newX < 0) {
          newX = 0;
          newWidth = resizeStart.width + resizeStart.posX;
        }
        if (newWidth === 400) {
          newX = resizeStart.posX + (resizeStart.width - 400);
        }
      }
      if (resizeType.includes('bottom')) {
        newHeight = Math.max(300, resizeStart.height + deltaY);
        const maxHeight = window.innerHeight - TASKBAR_HEIGHT - resizeStart.posY;
        newHeight = Math.min(newHeight, maxHeight);
      }
      if (resizeType.includes('top')) {
        newHeight = Math.max(300, resizeStart.height - deltaY);
        newY = resizeStart.posY + deltaY;
        if (newY < 0) {
          newY = 0;
          newHeight = resizeStart.height + resizeStart.posY;
        }
        if (newHeight === 300) {
          newY = resizeStart.posY + (resizeStart.height - 300);
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeType('');
  };

  const handleResizeStart = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    });
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

  return (
    <div 
      className={`projects-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={!isMaximized ? { 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex || 1000
      } : {
        zIndex: zIndex || 1000
      }}
      onMouseDown={(e) => {
        handleMouseDown(e);
        if (onFocus) onFocus();
      }}
    >
      {/* Resize handles */}
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

      {/* Window header */}
      <div className="projects-header">
        <div className="projects-title">
          <span>Projects</span>
        </div>
        <div className="projects-controls">
          <button className="control-btn minimize-btn" onClick={onMinimize}>
            <span>−</span>
          </button>
          <button className="control-btn maximize-btn" onClick={onMaximize}>
            <span>{isMaximized ? '❐' : '□'}</span>
          </button>
          <button className="control-btn close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
      </div>

      {/* Projects content */}
      <div className="projects-content">
        {/* Projects will be added here */}
      </div>
    </div>
  );
}