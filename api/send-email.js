/* Vercel Serverless Function — sends delegate emails via Resend.
 *
 * The Resend API key lives here (server-side) only, read from the
 * RESEND_API_KEY environment variable set in the Vercel dashboard. The
 * browser never sees it; it just POSTs { type, to, name } to this route.
 */

const EVENT_LABEL = 'Episcopal Consultation 2026';
const EVENT_DATES = '13–17 July 2026';
const HOST = 'Diocese of Niger Delta North';

/* Returns { subject, intro, body } for each notification type. */
function template(type, name, { diocese, province } = {}) {
  const greeting = name ? `Dear ${name},` : 'Dear Delegate,';
  const location = [diocese, province].filter(Boolean).join(', ');
  switch (type) {
    case 'approved':
      return {
        subject: `Your registration is approved — ${EVENT_LABEL}`,
        intro: 'Registration approved',
        body: `${greeting}</p><p>Your registration for the ${EVENT_LABEL} (${EVENT_DATES}), hosted by the ${HOST}, has been <strong>approved</strong>. Your accreditation is confirmed.</p><p>Accommodation, airport pickup and protocol arrangements will be scheduled from the travel details you provided. We look forward to welcoming you.`,
      };
    case 'declined':
      return {
        subject: `Update on your registration — ${EVENT_LABEL}`,
        intro: 'Registration update',
        body: `${greeting}</p><p>Thank you for your interest in the ${EVENT_LABEL}. After review, we are unable to confirm your registration at this time.</p><p>If you believe this is in error, please reply to this message or contact the host secretariat and we will be glad to assist.`,
      };
    case 'new-registration':
      return {
        subject: `New registration: ${name || 'Delegate'} — ${EVENT_LABEL}`,
        intro: 'New registration received',
        body: `A new delegate registration has been submitted for the ${EVENT_LABEL}.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:8px;">
            <tr><td style="padding:6px 0;color:#666;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${name || '—'}</td></tr>
            ${location ? `<tr><td style="padding:6px 0;color:#666;font-size:13px;">Diocese / Province</td><td style="padding:6px 0;font-size:13px;">${location}</td></tr>` : ''}
            <tr><td style="padding:6px 0;color:#666;font-size:13px;">Submitted</td><td style="padding:6px 0;font-size:13px;">${new Date().toUTCString()}</td></tr>
          </table>
          <p style="margin-top:16px;">Log into the secretariat console to review and approve this registration.`,
      };
    case 'confirmation':
    default:
      return {
        subject: `We received your registration — ${EVENT_LABEL}`,
        intro: 'Registration received',
        body: `${greeting}</p><p>Thank you for registering for the ${EVENT_LABEL} (${EVENT_DATES}), hosted by the ${HOST}. We have received your details.</p><p>The secretariat will review your registration and confirm your accreditation shortly. You will receive a further email once your registration is approved.`,
      };
  }
}

/* Minimal branded HTML wrapper. */
function renderHtml(intro, body) {
  return `<!doctype html><html><body style="margin:0;background:#0c0608;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e2d8;">
      <div style="background:#0c0608;padding:24px 28px;color:#e0b25a;font-size:12px;letter-spacing:2px;text-transform:uppercase;">DNDN 2026 Secretariat</div>
      <div style="padding:28px;font-size:15px;line-height:1.7;color:#2a2a2a;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#0c0608;">${intro}</h1>
        <p style="margin:0 0 14px;">${body}</p>
        <p style="margin:24px 0 0;">Warm regards,<br/><strong>Episcopal Consultation Planning Committee</strong><br/>${HOST}</p>
      </div>
    </div>
    <p style="text-align:center;color:#8a8378;font-size:11px;margin-top:18px;">© DNDN 2026 · ${HOST}</p>
  </div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.error('Email not sent: RESEND_API_KEY or RESEND_FROM is not configured.');
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const { type, to, name, diocese, province } = req.body || {};
  const validTypes = ['confirmation', 'approved', 'declined', 'new-registration'];
  /* `to` may be a single string or an array of strings. */
  const toValue = Array.isArray(to) ? to.filter((a) => typeof a === 'string' && a.trim()) : to;
  if (!validTypes.includes(type) || !toValue || (typeof toValue !== 'string' && !toValue.length)) {
    return res.status(400).json({ error: 'Invalid request payload.' });
  }

  const { subject, intro, body } = template(
    type,
    (name || '').toString().trim(),
    { diocese: diocese || '', province: province || '' }
  );

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: toValue, subject, html: renderHtml(intro, body) }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`Resend rejected the email: ${response.status} ${detail}`);
      return res.status(502).json({ error: 'Email provider error.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
}
