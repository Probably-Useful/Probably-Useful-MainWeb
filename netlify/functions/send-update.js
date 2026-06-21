// Netlify serverless function — sends newsletter emails via Resend API.
// Expects POST with JSON body: { subject, body, subscribers: [{ email }] }
// Protected by checking the owner email in the request.

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    return Response.json({ error: 'RESEND_API_KEY not configured on server' }, { status: 500 })
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { subject, body, subscribers, ownerEmail } = payload

  // Basic auth check — only the owner can trigger sends
  const OWNER_EMAIL = process.env.OWNER_EMAIL || ''
  if (!ownerEmail || ownerEmail.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (!subject || !body || !subscribers?.length) {
    return Response.json({ error: 'Missing subject, body, or subscribers' }, { status: 400 })
  }

  const FROM_EMAIL = 'Probably Useful <admin@probablyuseful.space>'
  const emails = subscribers.map((s) => s.email)
  const batchSize = 50

  try {
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: 'admin@probablyuseful.space',
          bcc: batch,
          subject,
          text: body,
          reply_to: 'admin@probablyuseful.space'
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return Response.json({ error: err.message || `Resend error: ${res.status}` }, { status: 502 })
      }
    }

    return Response.json({ success: true, sent: emails.length })
  } catch (err) {
    return Response.json({ error: err.message || 'Failed to send' }, { status: 500 })
  }
}

export const config = { path: '/api/send-update' }
