import { useEffect, useMemo, useState } from 'react'
import { apps } from '../data/apps.js'
import { feedbackTypes } from '../data/feedback.js'
import { analyzeIdea } from '../lib/spamFilter.js'
import { getHandle } from '../lib/storage.js'
import { listFeedback, createFeedback } from '../lib/api.js'
import { timeAgo } from '../lib/format.js'
import { LogoMark } from './Logo.jsx'

export default function Feedback({ product, setProduct }) {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [type, setType] = useState('improvement')
  const [filter, setFilter] = useState('all')
  const [text, setText] = useState('')
  const [err, setErr] = useState(null)
  const [sending, setSending] = useState(false)
  const [shown, setShown] = useState(6)

  const activeId = product || apps[0].id
  const activeApp = apps.find((a) => a.id === activeId) || apps[0]

  useEffect(() => {
    let alive = true
    listFeedback()
      .then((rows) => alive && setAll(rows))
      .catch((e) => alive && setLoadError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const items = useMemo(() => all.filter((f) => f.app_id === activeId), [all, activeId])
  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.type === filter)),
    [items, filter]
  )

  useEffect(() => setShown(6), [activeId, filter])

  async function handleSubmit(e) {
    e.preventDefault()
    const clean = text.trim()
    if (clean.length < 4) {
      setErr('A little more detail would help.')
      return
    }
    const verdict = analyzeIdea(clean)
    if (!verdict.ok) {
      setErr(verdict.reason || 'That looks like spam.')
      return
    }
    setSending(true)
    try {
      const created = await createFeedback({ appId: activeId, type, text: clean, author: getHandle() })
      setAll((prev) => [created, ...prev])
      setText('')
      setErr(null)
    } catch (e2) {
      setErr(`Could not send: ${e2.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="feedback" className="scroll-mt-24 py-20">
      <div className="container-px">
        <div className="max-w-2xl">
          <span className="section-eyebrow">
            <span className="h-px w-6 bg-spark/60" /> Feedback
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Help shape each tool
          </h2>
          <p className="mt-3 text-iris-100/70">
            Pick a tool, then leave an <span className="text-spark">improvement</span> idea or general{' '}
            <span className="text-iris-300">feedback</span>. It goes straight into that product&rsquo;s
            thread.
          </p>
        </div>

        {/* product picker */}
        <div className="mt-8 flex flex-wrap gap-2">
          {apps.map((a) => (
            <button
              key={a.id}
              onClick={() => setProduct(a.id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                a.id === activeId
                  ? 'border-iris-400/60 bg-iris-500/15 text-white'
                  : 'border-white/10 bg-white/[0.02] text-iris-100/70 hover:border-white/25'
              }`}
            >
              <span>{a.icon}</span>
              {a.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* compose */}
          <form onSubmit={handleSubmit} className="glass h-fit p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeApp.icon}</span>
              <div>
                <div className="font-display font-bold text-white">{activeApp.name}</div>
                <div className="text-xs text-iris-300/60">Leave a note</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(feedbackTypes).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    type === key
                      ? 'border-iris-400/60 bg-white/[0.06]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${meta.accent}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-iris-300/55">{meta.hint}</div>
                </button>
              ))}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 400))}
              rows={4}
              placeholder={
                type === 'improvement' ? 'It would be better if…' : 'What I think / what broke…'
              }
              className="field mt-3 resize-none"
            />
            {err && <p className="mt-2 text-xs text-rose-300">{err}</p>}

            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="btn-primary mt-3 w-full disabled:opacity-40"
            >
              {sending ? 'Sending…' : `Send to ${activeApp.name}`}
            </button>
          </form>

          {/* thread */}
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {['all', 'improvement', 'feedback'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    filter === f ? 'bg-iris-500 text-white' : 'text-iris-100/70 hover:text-white'
                  }`}
                >
                  {f}
                  <span className="ml-1.5 text-iris-100/40">
                    {f === 'all' ? items.length : items.filter((i) => i.type === f).length}
                  </span>
                </button>
              ))}
            </div>

            {loadError ? (
              <div className="glass p-6 text-sm text-rose-200">
                Couldn&rsquo;t load feedback. {loadError}
              </div>
            ) : loading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="glass h-20 animate-pulse opacity-50" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="glass flex flex-col items-center gap-2 px-6 py-14 text-center">
                <span className="text-2xl">🌱</span>
                <p className="text-sm text-iris-100/60">
                  No notes here yet. Be the first to shape <strong>{activeApp.name}</strong>.
                </p>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {visible.slice(0, shown).map((item) => {
                    const meta = feedbackTypes[item.type]
                    return (
                      <li key={item.id} className="glass p-4">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${meta.accent}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                          <span className="text-xs text-iris-300/50">{timeAgo(item.created_at)}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-iris-50">{item.text}</p>
                        <div className="mt-2 font-mono text-xs text-iris-300/50">{item.author}</div>
                        {item.builder_note && (
                          <div className="mt-3 flex gap-2.5 rounded-xl border border-spark/25 bg-spark/[0.06] p-3">
                            <LogoMark size={20} className="mt-0.5 shrink-0" />
                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-wide text-spark">
                                From the builder
                              </div>
                              <p className="mt-0.5 text-sm leading-relaxed text-iris-50">{item.builder_note}</p>
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>

                {visible.length > shown && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <button onClick={() => setShown((s) => s + 6)} className="btn-ghost">
                      Show more
                    </button>
                    <span className="text-xs text-iris-300/50">
                      Showing {shown} of {visible.length}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
