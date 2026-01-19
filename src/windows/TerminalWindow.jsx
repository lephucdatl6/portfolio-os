import { useState, useEffect, useRef } from 'react';
import './TerminalWindow.css';

export default function TerminalWindow({ onClose, onMinimize, onMaximize, onFocus, zIndex, isMaximized, isMinimized }) {
  const TASKBAR_HEIGHT = 60;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 1100, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  const PROMPT = 'C:\\Users\\Dave>';
  const contentRef = useRef(null);
  const inputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');

  useEffect(() => {
    const centerX = window.innerWidth / 2 - size.width / 2;
    const centerY = (window.innerHeight - 70) / 2 - size.height / 2; 
    setPosition({ x: centerX, y: centerY });
  }, []);

  const handleMouseDown = (e) => {
    // Only allow dragging when clicking on the header
    if (!e.target.closest('.terminal-header')) return;
    if (e.target.closest('.terminal-controls') || e.target.closest('.resize-handle')) return;
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

    if (isResizing && resizeType) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.posX;
      let newY = resizeStart.posY;

      if (resizeType.includes('right')) {
        newWidth = Math.max(400, resizeStart.width + deltaX);
        // Prevent growing past right edge
        newWidth = Math.min(newWidth, window.innerWidth - resizeStart.posX);
      }
      if (resizeType.includes('left')) {
        newWidth = Math.max(400, resizeStart.width - deltaX);
        newX = resizeStart.posX + deltaX;
        // Clamp to viewport left
        if (newX < 0) {
          newX = 0;
          newWidth = resizeStart.width + resizeStart.posX; // maintain right edge
        }
        if (newWidth === 400) {
          newX = resizeStart.posX + (resizeStart.width - 400);
        }
      }
      if (resizeType.includes('bottom')) {
        newHeight = Math.max(300, resizeStart.height + deltaY);
        // Prevent growing past taskbar
        const maxHeight = window.innerHeight - resizeStart.posY;
        newHeight = Math.min(newHeight, maxHeight);
      }
      if (resizeType.includes('top')) {
        newHeight = Math.max(300, resizeStart.height - deltaY);
        newY = resizeStart.posY + deltaY;
        // Clamp to viewport top
        if (newY < 0) {
          newY = 0;
          newHeight = resizeStart.height + resizeStart.posY; // maintain bottom edge
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

  // Initialize terminal with hint and initial prompt
  useEffect(() => {
    setHistory([
      'Type "help" to see available commands.',
    ]);
  }, []);

  // Auto scroll to bottom on updates
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [history, currentInput]);

  // Focus input when window gets focus
  useEffect(() => {
    if (onFocus && inputRef.current) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      if (!isMobile) inputRef.current.focus();
    }
  }, [onFocus]);

  const commandOutput = (cmd) => {
    switch (cmd.toLowerCase()) {
      case 'help':
        return [
          'Available commands:',
          '- about      Short introduction',
          '- skills     Technical focus areas',
          '- projects   Featured and experimental work',
          '- contact    How to reach me',
          '- clear      Clear terminal',
        ];
      case 'about':
        return [
          'Hi, I\'m Dat.',
          'I\'m a final-year Computing student doing my OJT.',
          'I enjoy building applications and learning by doing.',
          'This portfolio is part of that learning.',
          '  ',
        ];
      case 'skills':
        return [
          'Frontend:',
          '- React, React Native, Vite',
          '- TypeScript, JavaScript, HTML, CSS',
          'Backend:',
          '- Node.js, Express, REST APIs',
          'Databases:',
          '- MongoDB, PostgreSQL, Firebase',
          ' ',
        ];
      case 'projects':
        return [
          'Featured Projects:',
          '- RecipeShare: A full-stack social platform for sharing recipes.',
          '- Portfolio OS: This interactive portfolio site simulating a desktop OS.',
          ' ',
          'Experimental Projects:',
          '- Classroom scheduler: A tool to help user plan their class schedules.',
          '- Web Stack & Databases: Comparative analysis of web stacks and databases.',
          '- Python Video Player: A video player built with Python and OOP principles.',
          '- Academic Records System: A CRUD application for managing student records.',
          ' ',
        ];
      case 'contact':
        return [
          'Contact:',
          '- Email: pdat.dev@gmail.com',
          '- Or use the Contact me from the desktop',
        ];
      case 'clear':
        return null;
      default:
        return [
          `\'${cmd}\' is not recognized as an internal or external command.`,
          'Type "help" to see available commands.',
        ];
    }
  };

  const onSubmitCommand = () => {
    const cmd = currentInput.trim();
    const promptLine = `${PROMPT} ${cmd}`;
    if (!cmd) {
      setHistory((prev) => [...prev, promptLine]);
      setCurrentInput('');
      return;
    }

    if (cmd.toLowerCase() === 'clear') {
      setHistory(['Type "help" to see available commands.']);
      setCurrentInput('');
      return;
    }

    const out = commandOutput(cmd);
    setHistory((prev) => [...prev, promptLine, ...(out || [])]);
    setCurrentInput('');
  };

  return (
    <div 
      className={`terminal-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
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
      <div className="terminal-header">
        <div className="terminal-title">
          <span>Terminal</span>
        </div>
        <div className="terminal-controls">
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

      {/* Terminal content */}
      <div
        className="terminal-content"
        ref={contentRef}
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        <div className="terminal-inner">
          {history.map((line, idx) => (
            <div key={idx} className="terminal-line">{line}</div>
          ))}
          <div className="terminal-prompt-line">
            <span className="terminal-prompt">{PROMPT}&nbsp;</span>
            <input
              ref={inputRef}
              className="terminal-input"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSubmitCommand();
                }
              }}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}