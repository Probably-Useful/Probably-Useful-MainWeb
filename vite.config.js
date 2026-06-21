import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { config as dotenvConfig } from 'dotenv'

// Load .env for server-side vars (RESEND_API_KEY, OWNER_EMAIL)
dotenvConfig()

// Local dev middleware that mimics the Netlify function for /api/send-update
function sendUpdatePlugin() {
  return {
    name: 'send-update-dev',
    configureServer(server) {
      server.middlewares.use('/api/send-update', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        for await (const chunk of req) body += chunk
        let payload
        try {
          payload = JSON.parse(body)
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
          return
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY
        const OWNER_EMAIL = process.env.OWNER_EMAIL || ''

        if (!RESEND_API_KEY) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'RESEND_API_KEY not set in .env' }))
          return
        }

        const { subject, body: emailBody, subscribers, ownerEmail } = payload
        if (!ownerEmail || ownerEmail.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
          res.statusCode = 403
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }
        if (!subject || !emailBody || !subscribers?.length) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Missing subject, body, or subscribers' }))
          return
        }

        const emails = subscribers.map((s) => s.email)
        const batchSize = 50
        try {
          for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize)
            const r = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Probably Useful <admin@probablyuseful.space>',
                to: 'admin@probablyuseful.space',
                bcc: batch,
                subject,
                text: emailBody,
                reply_to: 'admin@probablyuseful.space'
              })
            })
            if (!r.ok) {
              const err = await r.json().catch(() => ({}))
              res.statusCode = 502
              res.end(JSON.stringify({ error: err.message || `Resend error: ${r.status}` }))
              return
            }
          }
          res.statusCode = 200
          res.end(JSON.stringify({ success: true, sent: emails.length }))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sendUpdatePlugin()],
  server: {
    port: 5174,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
