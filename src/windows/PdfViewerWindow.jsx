import { useState, useEffect } from 'react';
import './PdfViewerWindow.css';

export default function PdfViewer({ onClose, onMinimize, onMaximize, onFocus, zIndex, isMaximized, isMinimized }) {
  const TASKBAR_HEIGHT = 60;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  // Initialize position to center on mount
  useEffect(() => {
    const centerX = window.innerWidth / 2 - 400;
    const centerY = window.innerHeight / 2 - 300; 
    setPosition({ x: centerX, y: centerY });
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.pdf-controls') || e.target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeStart = (e, type) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y
    });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const MIN_VISIBLE = 100;
        const HEADER_GRAB_HEIGHT = 60;
        const clampedX = Math.min(
          Math.max(newX, -size.width + MIN_VISIBLE),
          window.innerWidth - MIN_VISIBLE
        );
        const clampedY = Math.min(
          Math.max(newY, -HEADER_GRAB_HEIGHT),
          window.innerHeight - MIN_VISIBLE
        );
        setPosition({ x: clampedX, y: clampedY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        // Handle different resize types
        if (resizeType.includes('right')) {
          newWidth = Math.max(300, resizeStart.width + deltaX);
          newWidth = Math.min(newWidth, window.innerWidth - resizeStart.posX);
        }
        if (resizeType.includes('left')) {
          newWidth = Math.max(300, resizeStart.width - deltaX);
          newX = resizeStart.posX + (resizeStart.width - newWidth);
          if (newX < 0) {
            newX = 0;
            newWidth = resizeStart.width + resizeStart.posX;
          }
        }
        if (resizeType.includes('bottom')) {
          newHeight = Math.max(200, resizeStart.height + deltaY);
          const maxHeight = window.innerHeight - resizeStart.posY;
          newHeight = Math.min(newHeight, maxHeight);
        }
        if (resizeType.includes('top')) {
          newHeight = Math.max(200, resizeStart.height - deltaY);
          newY = resizeStart.posY + (resizeStart.height - newHeight);
          if (newY < 0) {
            newY = 0;
            newHeight = resizeStart.height + resizeStart.posY;
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeType]);

  return (
    <div 
      className={`pdf-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
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
        if (onFocus) onFocus();
      }}
    >
      {/* Resize handles */}
      {!isMaximized && !isMinimized && (
        <>
          <div className="resize-handle resize-top" onMouseDown={(e) => handleResizeStart(e, 'top')}></div>
          <div className="resize-handle resize-right" onMouseDown={(e) => handleResizeStart(e, 'right')}></div>
          <div className="resize-handle resize-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')}></div>
          <div className="resize-handle resize-left" onMouseDown={(e) => handleResizeStart(e, 'left')}></div>
          <div className="resize-handle resize-top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')}></div>
          <div className="resize-handle resize-top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')}></div>
          <div className="resize-handle resize-bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}></div>
          <div className="resize-handle resize-bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}></div>
        </>
      )}
      <div className="pdf-header" onMouseDown={handleMouseDown}>
        <div className="pdf-title">Resume</div>
        <div className="pdf-controls">
          <button 
            className="pdf-control-btn minimize" 
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }} 
            title="Minimize"
          >
            −
          </button>
          <button 
            className="pdf-control-btn maximize" 
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }} 
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? '❒' : '□'}
          </button>
          <button 
            className="pdf-control-btn close" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="pdf-content">
        <iframe
          src="/assets/resume.pdf#toolbar=1&navpanes=0&scrollbar=1&view=FitH"
          width="100%"
          height="100%"
          title="Resume PDF"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}