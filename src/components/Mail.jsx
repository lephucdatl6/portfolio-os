import { useState, useEffect } from 'react';
import './Mail.css';

export default function Mail({ onClose, onMinimize, onMaximize, isMaximized, isMinimized }) {
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize position to center on mount
  useEffect(() => {
    const centerX = window.innerWidth / 2 - 300;
    const centerY = window.innerHeight / 2 - 350; 
    setPosition({ x: centerX, y: centerY });
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.mail-controls')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleSend = async () => {
    setError('');
    
    if (!fromEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    setSending(true);
    try {
      // Send email via email service or API
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: 'pdat.dev@gmail.com',
          subject: subject,
          message: message,
        }),
      });

      if (response.ok) {
        setError('success');
        setFromEmail('');
        setSubject('');
        setMessage('');
        setTimeout(() => setError(''), 3000);
      } else {
        setError('Failed to send email. Please try again.');
      }
    } catch (error) {
      setError('Error sending email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div 
      className={`mail-window ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
      style={!isMaximized ? { left: `${position.x}px`, top: `${position.y}px` } : {}}
    >
      <div className="mail-header" onMouseDown={handleMouseDown}>
        <div className="mail-title">Mail</div>
        <div className="mail-controls">
          <button className="mail-control-btn minimize" onClick={onMinimize} title="Minimize">−</button>
          <button className="mail-control-btn maximize" onClick={onMaximize} title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? '❒' : '□'}
          </button>
          <button className="mail-control-btn close" onClick={onClose} title="Close">×</button>
        </div>
      </div>

      <div className="mail-toolbar">
        <button className="mail-send-btn" onClick={handleSend} disabled={sending}>
          ➤ Send
        </button>
      </div>

      <div className="mail-content">
        {error && (
          <div className={`mail-error ${error === 'success' ? 'success' : 'error'}`}>
            {error === 'success' ? '✓ Email sent successfully!' : error}
          </div>
        )}
        <div className="mail-field">
          <label>To:</label>
          <input
            type="email"
            value="pdat.dev@gmail.com"
            disabled
            className="mail-input disabled"
          />
        </div>

        <div className="mail-field">
          <label>From:</label>
          <input
            type="email"
            placeholder="Your email address"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            className="mail-input"
          />
        </div>

        <div className="mail-field">
          <label>Subject:</label>
          <input
            type="text"
            placeholder="Subject of your message"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mail-input"
          />
        </div>

        <textarea
          placeholder="Write your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mail-message"
        />
      </div>
    </div>
  );
}
