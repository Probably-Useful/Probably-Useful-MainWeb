// Send newsletter updates via the Netlify serverless function at /api/send-update.
// The Resend API key stays server-side only — never exposed to the browser.

import { OWNER_EMAIL } from './nhost.js'

export const resendConfigured = true // handled server-side now

/**
 * Send an update email to all subscribers via the serverless function.
 */
export async function sendUpdateEmail({ subject, body, subscribers }) {
  if (!subscribers.length) {
    throw new Error('No subscribers to send to')
  }

  const res = await fetch('/api/send-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject,
      body,
      subscribers,
      ownerEmail: OWNER_EMAIL
    })
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Server error: ${res.status}`)
  }

  return data
}
