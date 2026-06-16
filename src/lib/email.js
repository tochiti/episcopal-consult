/* Delegate email notifications.
 *
 * The Resend API key must never live in the browser, so this helper only
 * POSTs to the server-side function at /api/send-email, which holds the
 * key. Email is a best-effort side-channel: failures are logged but never
 * thrown, so a mail problem can never block or roll back a Firestore write
 * or a status change.
 */

const buildName = (registration = {}) =>
  [registration.title, registration.firstName, registration.lastName]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' ');

/**
 * @param {Object} params
 * @param {'confirmation'|'approved'|'declined'} params.type
 * @param {Object} params.registration  Saved registration record.
 */
export const sendDelegateEmail = async ({ type, registration }) => {
  const to = (registration?.emailAddress || '').trim();
  if (!to) return { ok: false, skipped: true };

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, name: buildName(registration) }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.warn(`Email (${type}) not sent: ${response.status} ${detail}`);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    console.warn(`Email (${type}) failed to send:`, error);
    return { ok: false };
  }
};

/** Fire emails for many delegates without letting one failure abort the rest. */
export const sendDelegateEmails = async (type, registrations = []) =>
  Promise.all(registrations.map((registration) => sendDelegateEmail({ type, registration })));
