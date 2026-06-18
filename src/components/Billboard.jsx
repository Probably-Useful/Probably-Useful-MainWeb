import { useEffect, useMemo, useState } from 'react'
import { builderStatuses } from '../data/billboard.js'
import { analyzeIdea } from '../lib/spamFilter.js'
import { getVotedIds, toggleVote, getHandle } from '../lib/storage.js'
import { listIdeas, createIdea, changeVotes } from '../lib/api.js'
import { timeAgo, formatNumber } from '../lib/format.js'
import { LogoMark } from './Logo.jsx'

const MAX = 280

export default function Billboard() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [voted, setVoted] = useState(() => getVotedIds())
  const [text, setText] = useState('')
  const [sort, setSort] = useState('top')
  const [notice, setNotice] = useState(null)
  const [visible, setVisible] = useState(3)
  const [posting, setPosting] = useState(false)

  const live = useMemo(() => (text.trim() ? analyzeIdea(text) : null), [text])

  useEffect(() => {
    let alive = true
    listIdeas()
      .then((rows) => alive && setIdeas(rows))
      .catch((e) => alive && setLoadError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const sorted = useMemo(() => {
    const copy = [...ideas]
    if (sort === 'top') copy.sort((a, b) => b.votes - a.votes)
    else copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return copy
  }, [ideas, sort])

  const totalVotes = useMemo(() => ideas.reduce((s, i) => s + i.votes, 0), [ideas])
  const topId = useMemo(
    () => ideas.reduce((top, i) => (i.votes > (top?.votes ?? -1) ? i : top), null)?.id,
    [ideas]
  )

  async function handleVote(id) {
    const nowVoted = toggleVote(id)
    setVoted(getVotedIds())
    const delta = nowVoted ? 1 : -1
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, votes: i.votes + delta } : i)))
    try {
      await changeVotes(id, delta)
    } catch {
      // revert on failure
      toggleVote(id)
      setVoted(getVotedIds())
      setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, votes: i.votes - delta } : i)))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const clean = text.trim()
    const verdict = analyzeIdea(clean)
    if (!verdict.ok) {
      setNotice({ kind: 'error', msg: verdict.reason || 'That looks like spam. Try rephrasing.' })
      return
    }
    setPosting(true)
    try {
      const created = await createIdea({ text: clean, author: getHandle() })
      toggleVote(created.id)
      setIdeas((prev) => [created, ...prev])
      setVoted(getVotedIds())
      setText('')
      setNotice({ kind: 'success', msg: 'Posted. Thanks! Others can vote on it now.' })
      setSort('new')
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      setNotice({ kind: 'error', msg: `Could not post: ${err.message}` })
    } finally {
      setPosting(false)
    }
  }

  const remaining = MAX - text.length

  return (
    <section id="billboard" className="scroll-mt-24 py-20">
      <div className="container-px">
        {/* signboard */}
        <div className="relative mx-auto max-w-3xl">
          <div className="glass relative overflow-hidden rounded-3xl border-white/15 px-6 py-9 text-center shadow-glow sm:px-12">
            <div className="absolute inset-x-0 top-0 flex justify-center gap-2 py-2">
              {Array.from({ length: 11 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-spark/70"
                  style={{ animation: `fade-in 1.2s ${i * 0.12}s ease-in-out infinite alternate` }}
                />
              ))}
            </div>
            <span className="section-eyebrow justify-center">📣 The idea board</span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Tell me what to build <span className="gradient-text">next</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-iris-100/70">
              Wish a tool existed? Post it. Like someone&rsquo;s idea? Vote it up. The most-wanted
              ideas get built, and I&rsquo;ll mark right here what I&rsquo;m working on.
            </p>
            <div className="mt-5 flex items-center justify-center gap-5 text-sm">
              <span className="text-iris-100/80">
                <strong className="font-display text-white">{ideas.length}</strong> ideas
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="text-iris-100/80">
                <strong className="font-display text-white">{formatNumber(totalVotes)}</strong> votes
              </span>
            </div>
          </div>
          <div className="mx-auto flex w-40 justify-between">
            <span className="h-6 w-2 rounded-b bg-white/10" />
            <span className="h-6 w-2 rounded-b bg-white/10" />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* compose */}
          <form onSubmit={handleSubmit} className="glass h-fit p-6 lg:sticky lg:top-24">
            <label className="text-sm font-semibold text-iris-100">Your idea</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              rows={5}
              placeholder="An app that…"
              className="field mt-2 resize-none"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <SpamHint live={live} />
              <span className={remaining < 30 ? 'text-amber-300' : 'text-iris-300/50'}>{remaining}</span>
            </div>
            {notice && (
              <div
                className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
                  notice.kind === 'error'
                    ? 'border-rose-400/30 bg-rose-400/10 text-rose-200'
                    : 'border-spark/30 bg-spark/10 text-spark'
                }`}
              >
                {notice.msg}
              </div>
            )}
            <button
              type="submit"
              disabled={!text.trim() || (live && !live.ok) || posting}
              className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              {posting ? 'Posting…' : 'Post to the board'}
            </button>
            <p className="mt-3 text-center text-xs text-iris-300/50">
              Posted anonymously as <span className="font-mono text-iris-200">{getHandle()}</span>
            </p>
          </form>

          {/* list */}
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm text-iris-100/60">
                {loading ? 'Loading…' : `${ideas.length} ideas`}
              </span>
              <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                {['top', 'new'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      sort === s ? 'bg-iris-500 text-white' : 'text-iris-100/70 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {loadError ? (
              <div className="glass p-6 text-sm text-rose-200">
                Couldn&rsquo;t load ideas. {loadError}
              </div>
            ) : loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="glass h-24 animate-pulse opacity-50" />
                ))}
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {sorted.slice(0, visible).map((idea, idx) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      rank={sort === 'top' ? idx + 1 : null}
                      isTop={idea.id === topId}
                      hasVoted={voted.has(idea.id)}
                      onVote={() => handleVote(idea.id)}
                    />
                  ))}
                </ul>

                {sorted.length > visible ? (
                  <div className="mt-5 flex flex-col items-center gap-2">
                    <button onClick={() => setVisible((v) => v + 3)} className="btn-ghost">
                      Show more ideas
                    </button>
                    <span className="text-xs text-iris-300/50">
                      Showing {visible} of {sorted.length}
                    </span>
                  </div>
                ) : (
                  visible > 3 && (
                    <div className="mt-5 text-center">
                      <button onClick={() => setVisible(3)} className="text-xs font-semibold text-iris-300/60 hover:text-white">
                        Collapse
                      </button>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function IdeaCard({ idea, rank, isTop, hasVoted, onVote }) {
  const status = idea.builder_status ? builderStatuses[idea.builder_status] : null

  return (
    <li className="group relative pt-2.5">
      <span className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <span className="block h-3 w-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_2px_6px_rgba(0,0,0,0.5)] ring-2 ring-white/30" />
      </span>

      <div
        className={`glass flex gap-4 p-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-0.4deg] ${
          status ? status.ring : 'group-hover:border-white/20'
        }`}
      >
        <button
          onClick={onVote}
          className={`flex h-fit w-14 shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition ${
            hasVoted
              ? 'border-iris-400/60 bg-iris-500/20 text-white'
              : 'border-white/10 bg-white/[0.02] text-iris-100/70 hover:border-iris-400/40'
          }`}
          aria-pressed={hasVoted}
          title={hasVoted ? 'Remove vote' : 'Upvote'}
        >
          <span className="text-base leading-none">▲</span>
          <span className="mt-1 font-display text-sm font-bold">{idea.votes}</span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isTop && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                🔥 Most wanted
              </span>
            )}
            {!isTop && rank && rank <= 3 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[11px] font-bold text-iris-200">
                {rank}
              </span>
            )}
            {status && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold ${status.ring} ${status.text}`}>
                {status.emoji} {status.label}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-iris-50">{idea.text}</p>

          <div className="mt-2 flex items-center gap-2 text-xs text-iris-300/50">
            <span className="font-mono">{idea.author}</span>
            <span>·</span>
            <span>{timeAgo(idea.created_at)}</span>
          </div>

          {idea.builder_note && (
            <div className="mt-3 flex gap-2.5 rounded-xl border border-spark/25 bg-spark/[0.06] p-3">
              <LogoMark size={22} className="mt-0.5 shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-spark">From the builder</div>
                <p className="mt-0.5 text-sm leading-relaxed text-iris-50">{idea.builder_note}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

function SpamHint({ live }) {
  if (!live) return <span className="text-iris-300/50">Spam filter is on</span>
  if (live.ok)
    return (
      <span className="inline-flex items-center gap-1.5 text-spark">
        <span className="h-1.5 w-1.5 rounded-full bg-spark" /> Looks good
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-rose-300">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> {live.reason || 'Might be flagged'}
    </span>
  )
}
