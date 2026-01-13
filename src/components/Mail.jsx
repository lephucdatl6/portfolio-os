import { useState, useEffect } from 'react';
import './Mail.css';

export default function Mail({ onClose, onMinimize, onMaximize, isMaximized, isMinimized }) {
  const [fromEmail, setFromEmail] = useState('');
  const [name, setName] = useState('');
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
    // name is optional; no validation required
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    
    // Validate email format
    if (!/\S+@\S+\.\S+/.test(fromEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      // Send email via serverless API (Resend) - match handler payload { name, email, message }
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: fromEmail,
          subject,
          message,
        }),
      });


      if (response.ok) {
        setError('success');
        setFromEmail('');
        setName('');
        setSubject('');
        setMessage('');
        setTimeout(() => setError(''), 3000);
      } else {
        // Try to parse JSON error from server, otherwise get text
        let body = {};
        try { body = await response.json(); } catch (e) { /* ignore */ }
        const msg = body && (body.error || body.message) ? (body.error || body.message) : await response.text().catch(()=>response.statusText);
        setError(msg || 'Failed to send email. Please try again.');
      }
    } catch (error) {
      setError('Error sending email: ' + error.message);
    } finally {
      setSending(false);
    }
  };
    const to = 'pdat.dev@gmail.com';
    const bodyBase = fromEmail ? `From: ${fromEmail}\n\n${message || ''}` : `${message || ''}`;
    const mailtoHref = `mailto:${to}?subject=${encodeURIComponent(subject||'')}&body=${encodeURIComponent(bodyBase)}`;
    const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject||'')}&body=${encodeURIComponent(bodyBase)}`;

  const openGmailApp = (e) => {
    if (e) e.preventDefault();
    
    // Try to open Gmail app first (mobile)
    const gmailAppHref = `googlegmail://co?to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject||'')}&body=${encodeURIComponent(bodyBase)}`;
    
    // Create a temporary iframe to try opening the app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = gmailAppHref;
    document.body.appendChild(iframe);
    
    // Fallback to web Gmail after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
      window.open(gmailHref, '_blank', 'noopener,noreferrer');
    }, 500);
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
        {(() => {
          const to = 'pdat.dev@gmail.com';
          const body = fromEmail ? `From: ${fromEmail}\n\n${message || ''}` : `${message || ''}`;
          const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject||'')}&body=${encodeURIComponent(body)}`;
          return (
            <div className="mail-toolbar-right">
              <a
                className="mail-compose-link"
                href="https://www.linkedin.com/in/dat-le-b500a61bb"
                aria-label="Open LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/assets/icons/linkedin.png" alt="LinkedIn" className="mail-compose-icon" />
                <span className="tooltip-text">Open LinkedIn</span>
              </a>
              <a className="mail-compose-link" href={gmailHref} aria-label="Open in Gmail" onClick={openGmailApp}>
                <img src="/assets/icons/gmail.png" alt="Gmail" className="mail-compose-icon" />
                <span className="tooltip-text">Open in Gmail</span>
              </a>
            </div>
          );
        })()}
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
