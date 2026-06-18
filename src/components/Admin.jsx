import { useEffect, useState } from 'react'
import { nhostConfigured } from '../lib/nhost.js'
import { signIn, signOut, onAuthChange, isOwnerUser } from '../lib/auth.js'
import {
  listIdeas,
  listFeedback,
  setBuilderResponse,
  deleteIdea,
  setFeedbackReply,
  deleteFeedback
} from '../lib/api.js'
import { builderStatuses } from '../data/billboard.js'
import { feedbackTypes } from '../data/feedback.js'
import { apps } from '../data/apps.js'
import { analyzeIdea } from '../lib/spamFilter.js'
import { timeAgo } from '../lib/format.js'
import { LogoMark } from './Logo.jsx'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('ideas')

  function reload() {
    setLoading(true)
    Promise.all([listIdeas(true), listFeedback(true)])
      .then(([i, f]) => {
        setIdeas(i)
        setFeedback(f)
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
            ['feedback', `Feedback (${feedback.length})`]
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
      ) : (
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
