import { useEffect, useState } from 'react'
import { nhostConfigured } from '../lib/nhost.js'
import { signIn, signOut, onAuthChange, isOwnerUser } from '../lib/auth.js'
import {
  listIdeas,
  listFeedback,
  setBuilderResponse,
  deleteIdea,
  setFeedbackReply,
  deleteFeedback,
  listSubscribers,
  deleteSubscriber,
  listUpdates,
  createUpdate
} from '../lib/api.js'
import { builderStatuses } from '../data/billboard.js'
import { feedbackTypes } from '../data/feedback.js'
import { apps } from '../data/apps.js'
import { analyzeIdea } from '../lib/spamFilter.js'
import { timeAgo } from '../lib/format.js'
import { LogoMark } from './Logo.jsx'
import { sendUpdateEmail, resendConfigured } from '../lib/email.js'

const appName = (id) => apps.find((a) => a.id === id)?.name || id

export default function Admin({ onClose }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u)
      setReady(true)
    })
    return unsub
  }, [])

  const owner = isOwnerUser(user)

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/95 backdrop-blur-xl">
      <div className="container-px py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-display text-lg font-bold">
              Admin <span className="gradient-text">console</span>
            </span>
          </div>
          <a href="#top" onClick={onClose} className="btn-ghost">
            ← Back to site
          </a>
        </div>

        {!nhostConfigured ? (
          <NotConfigured />
        ) : !ready ? (
          <p className="text-iris-100/60">Checking session…</p>
        ) : !user ? (
          <SignIn onSignedIn={setUser} />
        ) : !owner ? (
          <NotAuthorized email={user.email} />
        ) : (
          <Moderation />
        )}
      </div>
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="glass max-w-lg p-6">
      <h2 className="font-display text-xl font-bold">Nhost isn&rsquo;t configured yet</h2>
      <p className="mt-2 text-sm text-iris-100/70">
        Add <code className="font-mono text-spark">VITE_NHOST_SUBDOMAIN</code> and{' '}
        <code className="font-mono text-spark">VITE_NHOST_REGION</code> to your{' '}
        <code className="font-mono">.env</code>, then restart the dev server. See{' '}
        <code className="font-mono">SETUP-NHOST.md</code>.
      </p>
    </div>
  )
}

function NotAuthorized({ email }) {
  return (
    <div className="glass max-w-lg p-6">
      <h2 className="font-display text-xl font-bold">Not the owner account</h2>
      <p className="mt-2 text-sm text-iris-100/70">
        You&rsquo;re signed in as <span className="font-mono text-iris-200">{email}</span>, which
        isn&rsquo;t the owner email. Even if you tried, the database blocks edits and deletes for
        non-owner accounts.
      </p>
      <button onClick={() => signOut()} className="btn-ghost mt-4">
        Sign out
      </button>
    </div>
  )
}

function SignIn({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const u = await signIn(email, password)
      onSignedIn(u)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass max-w-sm p-6">
      <h2 className="font-display text-xl font-bold">Owner sign in</h2>
      <p className="mt-1 text-sm text-iris-100/60">Manage ideas and feedback.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="field mt-4"
        autoComplete="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="field mt-3"
        autoComplete="current-password"
      />
      {err && <p className="mt-2 text-xs text-rose-300">{err}</p>}
      <button type="submit" disabled={busy} className="btn-primary mt-4 w-full disabled:opacity-40">
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

function Moderation() {
  const [ideas, setIdeas] = useState([])
  const [feedback, setFeedback] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('ideas')

  function reload() {
    setLoading(true)
    Promise.all([listIdeas(true), listFeedback(true), listSubscribers(), listUpdates()])
      .then(([i, f, s, u]) => {
        setIdeas(i)
        setFeedback(f)
        setSubscribers(s)
        setUpdates(u)
        setError(null)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  // spammiest first to make moderation fast
  const ideasByRisk = [...ideas].sort(
    (a, b) => analyzeIdea(b.text).score - analyzeIdea(a.text).score
  )

  async function onSetStatus(id, status) {
    const idea = ideas.find((i) => i.id === id)
    const updated = await setBuilderResponse(id, { status, note: idea?.builder_note ?? null })
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)))
  }

  async function onSaveNote(id, note) {
    const idea = ideas.find((i) => i.id === id)
    const updated = await setBuilderResponse(id, { status: idea?.builder_status ?? null, note: note || null })
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)))
  }

  async function onDeleteIdea(id) {
    if (!confirm('Delete this idea permanently?')) return
    await deleteIdea(id)
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  async function onDeleteFeedback(id) {
    if (!confirm('Delete this feedback permanently?')) return
    await deleteFeedback(id)
    setFeedback((prev) => prev.filter((f) => f.id !== id))
  }

  async function onSaveReply(id, note) {
    const updated = await setFeedbackReply(id, note || null)
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)))
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {[
            ['ideas', `Ideas (${ideas.length})`],
            ['feedback', `Feedback (${feedback.length})`],
            ['updates', `Updates (${subscribers.length} subs)`]
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                tab === key ? 'bg-iris-500 text-white' : 'text-iris-100/70 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={reload} className="btn-ghost text-xs">Refresh</button>
          <button onClick={() => signOut()} className="btn-ghost text-xs">Sign out</button>
        </div>
      </div>

      {error && <div className="glass mb-4 p-4 text-sm text-rose-200">{error}</div>}
      {loading ? (
        <p className="text-iris-100/60">Loading…</p>
      ) : tab === 'ideas' ? (
        <div className="space-y-3">
          {ideasByRisk.map((idea) => (
            <IdeaRow
              key={idea.id}
              idea={idea}
              onSetStatus={onSetStatus}
              onSaveNote={onSaveNote}
              onDelete={onDeleteIdea}
            />
          ))}
        </div>
      ) : tab === 'feedback' ? (
        <div className="space-y-3">
          {feedback.map((f) => (
            <FeedbackRow
              key={f.id}
              item={f}
              onDelete={onDeleteFeedback}
              onSaveReply={onSaveReply}
            />
          ))}
        </div>
      ) : (
        <UpdatesPanel
          subscribers={subscribers}
          updates={updates}
          onDeleteSubscriber={async (id) => {
            await deleteSubscriber(id)
            setSubscribers((prev) => prev.filter((s) => s.id !== id))
          }}
          onSent={(u) => setUpdates((prev) => [u, ...prev])}
        />
      )}
    </div>
  )
}

function FeedbackRow({ item, onDelete, onSaveReply }) {
  const [note, setNote] = useState(item.builder_note || '')
  const [saving, setSaving] = useState(false)

  return (
    <div className="glass p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="chip">{appName(item.app_id)}</span>
            <span className={feedbackTypes[item.type]?.accent}>{feedbackTypes[item.type]?.label}</span>
            <span className="text-iris-300/50">{timeAgo(item.created_at)}</span>
          </div>
          <p className="mt-2 text-sm text-iris-50">{item.text}</p>
          <div className="mt-1 font-mono text-xs text-iris-300/50">{item.author}</div>
        </div>
        <button onClick={() => onDelete(item.id)} className="btn-ghost shrink-0 text-xs text-rose-200">
          Delete
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          placeholder="Reply publicly (From the builder)…"
          className="field flex-1 py-2 text-sm"
        />
        <button
          onClick={async () => {
            setSaving(true)
            try {
              await onSaveReply(item.id, note.trim())
            } finally {
              setSaving(false)
            }
          }}
          className="btn-spark px-3 py-2 text-xs"
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function IdeaRow({ idea, onSetStatus, onSaveNote, onDelete }) {
  const [note, setNote] = useState(idea.builder_note || '')
  const [savingNote, setSavingNote] = useState(false)
  const risk = analyzeIdea(idea.text)

  return (
    <div className="glass p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-iris-50">{idea.text}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-iris-300/50">
            <span className="font-mono">{idea.author}</span>
            <span>· {idea.votes} votes ·</span>
            <span>{timeAgo(idea.created_at)}</span>
            {!risk.ok && (
              <span className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 font-bold text-rose-300">
                likely spam
              </span>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(idea.id)} className="btn-ghost shrink-0 text-xs text-rose-200">
          Delete
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => onSetStatus(idea.id, null)}
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
            !idea.builder_status ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-iris-100/60 hover:text-white'
          }`}
        >
          None
        </button>
        {Object.entries(builderStatuses).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => onSetStatus(idea.id, key)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
              idea.builder_status === key ? `${meta.ring} bg-white/10 ${meta.text}` : 'border-white/10 text-iris-100/60 hover:text-white'
            }`}
          >
            {meta.emoji} {meta.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          placeholder="Public note (From the builder)…"
          className="field flex-1 py-2 text-sm"
        />
        <button
          onClick={async () => {
            setSavingNote(true)
            try {
              await onSaveNote(idea.id, note.trim())
            } finally {
              setSavingNote(false)
            }
          }}
          className="btn-spark px-3 py-2 text-xs"
        >
          {savingNote ? '…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function UpdatesPanel({ subscribers, updates, onDeleteSubscriber, onSent }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState(null)

  async function send(e) {
    e.preventDefault()
    if (!subject.trim() || !body.trim() || subscribers.length === 0) return
    setSending(true)
    setSendError(null)
    try {
      // Send actual emails via Resend
      if (resendConfigured) {
        await sendUpdateEmail({ subject: subject.trim(), body: body.trim(), subscribers })
      }
      // Log the update to the database
      const u = await createUpdate({ subject: subject.trim(), body: body.trim(), sentTo: subscribers.length })
      onSent(u)
      setSent(true)
      setSubject('')
      setBody('')
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      setSendError(err.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Compose */}
      <div className="glass p-5">
        <h3 className="font-display text-base font-bold text-white">Send an Update</h3>
        <p className="mt-1 text-xs text-iris-100/60">
          {resendConfigured
            ? `Emails will be sent from admin@probablyuseful.space to ${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}.`
            : 'VITE_RESEND_API_KEY not set — update will be logged but no emails sent.'}
        </p>
        <form onSubmit={send} className="mt-3 space-y-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value.slice(0, 150))}
            placeholder="Subject"
            className="field"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 5000))}
            placeholder="Write your update here…"
            rows={5}
            className="field resize-none"
            required
          />
          {sent && <p className="text-sm text-spark">Update sent successfully!</p>}
          {sendError && <p className="text-sm text-rose-300">{sendError}</p>}
          <button
            type="submit"
            disabled={sending || !subject.trim() || !body.trim() || subscribers.length === 0}
            className="btn-primary disabled:opacity-40"
          >
            {sending ? 'Sending…' : `Send update to ${subscribers.length} subscriber${subscribers.length !== 1 ? 's' : ''}`}
          </button>
        </form>
      </div>

      {/* Subscribers list */}
      <div className="glass p-5">
        <h3 className="font-display text-base font-bold text-white">
          Subscribers ({subscribers.length})
        </h3>
        {subscribers.length === 0 ? (
          <p className="mt-2 text-sm text-iris-100/60">No subscribers yet.</p>
        ) : (
          <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto">
            {subscribers.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2">
                <span className="font-mono text-sm text-iris-100">{s.email}</span>
                <button
                  onClick={() => onDeleteSubscriber(s.id)}
                  className="btn-ghost text-xs text-rose-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Past updates */}
      {updates.length > 0 && (
        <div className="glass p-5">
          <h3 className="font-display text-base font-bold text-white">Past Updates</h3>
          <div className="mt-3 space-y-3">
            {updates.map((u) => (
              <div key={u.id} className="rounded-xl border border-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-iris-300/50">
                  <span className="font-semibold text-iris-100">{u.subject}</span>
                  <span>Sent to {u.sent_to} · {timeAgo(u.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-iris-100/70">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
