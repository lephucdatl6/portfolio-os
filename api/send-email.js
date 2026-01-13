export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, subject, message } = req.body || {};

    // Basic validation
    if (!email || typeof email !== 'string' || !message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid payload. `email` and `message` are required.' });
    }

    const FORM_ID = process.env.FORMSPREE_FORM_ID;

    if (!FORM_ID) {
      console.error('Missing Formspree configuration (FORMSPREE_FORM_ID is not set)');
      return res.status(500).json({ error: 'Mailer not configured' });
    }

    // Post to Formspree
    const endpoint = `https://formspree.io/f/${FORM_ID}`;
    // Include subject if provided; Formspree accepts arbitrary fields
    const payload = { name: name || 'Anonymous', email, message };
    if (subject && typeof subject === 'string') payload.subject = subject;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return res.status(200).json({ ok: true });
    }

    const text = await response.text();
    console.error('Formspree error', response.status, text);
    return res.status(502).json({ error: 'Formspree error', status: response.status, body: text });
  } catch (err) {
    console.error('Unexpected error in send-email:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
