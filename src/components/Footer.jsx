import { useState } from 'react'
import { LogoMark } from './Logo.jsx'

function encode(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&')
}

function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [bot, setBot] = useState('') // honeypot
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  async function submit(e) {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', email, message, 'bot-field': bot })
      })
      if (!res.ok) throw new Error('failed')
      setStatus('done')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-3 rounded-xl border border-spark/30 bg-spark/10 p-4 text-sm text-spark">
        Got it, thanks. If you left an email, I&rsquo;ll get back to you.
      </div>
    )
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={submit}
      className="mt-3"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>
          Don&rsquo;t fill this out: <input name="bot-field" value={bot} onChange={(e) => setBot(e.target.value)} />
        </label>
      </p>
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email (optional, for a reply)"
        className="field"
        autoComplete="email"
      />
      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
        rows={3}
        required
        placeholder="Something just for me…"
        className="field mt-2 resize-none"
      />
      {status === 'error' && (
        <p className="mt-2 text-xs text-rose-300">Couldn&rsquo;t send just now. Please try again in a moment.</p>
      )}
      <button
        type="submit"
        disabled={!message.trim() || status === 'sending'}
        className="btn-primary mt-2 disabled:opacity-40"
      >
        {status === 'sending' ? 'Sending…' : 'Send privately'}
      </button>
    </form>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="container-px">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} />
              <span className="font-display text-base font-bold">
                <span className="text-iris-100">Probably</span>
                <span className="gradient-text"> Useful</span>
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-white">Got something just for me?</h3>
            <p className="mt-1 text-sm leading-relaxed text-iris-100/60">
              Not for the public board. A private note straight to my inbox, for anything you&rsquo;d
              rather say one to one.
            </p>
            <ContactForm />
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <a href="#apps" className="text-iris-100/70 hover:text-white">Tools</a>
            <a href="#billboard" className="text-iris-100/70 hover:text-white">Idea Board</a>
            <a href="#feedback" className="text-iris-100/70 hover:text-white">Feedback</a>
            <a href="#dashboard" className="text-iris-100/70 hover:text-white">Dashboard</a>
            <a href="#support" className="text-iris-100/70 hover:text-white">Support</a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-iris-300/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Probably Useful · probablyuseful.space</span>
          <span className="font-mono">Made to be probably useful</span>
        </div>
      </div>
    </footer>
  )
}
