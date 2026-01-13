import { useState } from 'react';
import './ContactForm.css';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email || !subject || !message) return 'Email, subject and message are required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Send failed');
      setSuccess(true);
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="label">Name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="field">
        <label className="label">Email *</label>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label className="label">Message *</label>
        <textarea className="textarea" value={message} onChange={e=>setMessage(e.target.value)} rows={6} />
      </div>

      <div className="actions">
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send Message'}
        </button>
        {success && <span className="success">Sent.</span>}
        {error && <span className="error">{error}</span>}
      </div>
    </form>
  );
}
