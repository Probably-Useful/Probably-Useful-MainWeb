import { useEffect, useMemo, useState } from 'react'
import { apps } from '../data/apps.js'
import { builderStatuses } from '../data/billboard.js'
import { listIdeas, listFeedback } from '../lib/api.js'
import { formatNumber } from '../lib/format.js'

export default function Dashboard() {
  const [ideas, setIdeas] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([listIdeas(), listFeedback()])
      .then(([i, f]) => {
        if (!alive) return
        setIdeas(i)
        setFeedback(f)
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const totalVotes = useMemo(() => ideas.reduce((s, i) => s + (i.votes || 0), 0), [ideas])
  const toolsLive = apps.filter((a) => a.status === 'live').length

  const pipeline = useMemo(() => {
    const counts = { considering: 0, planned: 0, building: 0, shipped: 0, open: 0 }
    for (const i of ideas) {
      if (i.builder_status && counts[i.builder_status] !== undefined) counts[i.builder_status] += 1
      else counts.open += 1
    }
    return counts
  }, [ideas])

  const perApp = useMemo(() => {
    return apps.map((a) => {
      const items = feedback.filter((f) => f.app_id === a.id)
      return {
        id: a.id,
        name: a.name,
        improvements: items.filter((f) => f.type === 'improvement').length,
        feedback: items.filter((f) => f.type === 'feedback').length,
        replied: items.filter((f) => f.builder_note).length,
        total: items.length
      }
    })
  }, [feedback])

  const headline = [
    { id: 'tools', label: 'Tools live', value: toolsLive },
    { id: 'ideas', label: 'Ideas on the board', value: ideas.length },
    { id: 'votes', label: 'Votes cast', value: totalVotes },
    { id: 'feedback', label: 'Notes received', value: feedback.length }
  ]

  return (
    <section id="dashboard" className="scroll-mt-24 py-20">
      <div className="container-px">
        <div className="max-w-2xl">
          <span className="section-eyebrow">
            <span className="h-px w-6 bg-spark/60" /> Dashboard
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How it&rsquo;s going
          </h2>
          <p className="mt-3 text-iris-100/70">
            Real numbers, straight from the board. These update live as people post ideas, vote, and
            leave feedback. Nothing here is made up.
          </p>
        </div>

        {error ? (
          <div className="glass mt-8 p-6 text-sm text-rose-200">Couldn&rsquo;t load metrics. {error}</div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {headline.map((s) => (
                <div key={s.id} className="glass px-4 py-5 text-center">
                  <div className="font-display text-3xl font-bold text-white">
                    {loading ? <span className="text-iris-300/40">…</span> : formatNumber(s.value)}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-iris-100/60">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <GrowthCard ideas={ideas} loading={loading} />
              <PipelineCard pipeline={pipeline} total={ideas.length} loading={loading} />
            </div>

            <FeedbackTable rows={perApp} loading={loading} />
          </>
        )}
      </div>
    </section>
  )
}

function GrowthCard({ ideas, loading }) {
  const w = 520
  const h = 180
  const pad = 8

  const series = useMemo(() => {
    const sorted = [...ideas].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return sorted.map((_, i) => i + 1) // cumulative idea count over time
  }, [ideas])

  const path = useMemo(() => {
    if (series.length < 2) return null
    const max = series[series.length - 1]
    const stepX = (w - pad * 2) / (series.length - 1)
    const y = (v) => h - pad - (v / max) * (h - pad * 2)
    const pts = series.map((v, i) => [pad + i * stepX, y(v)])
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pad},${h - pad} Z`
    return { line, area, last: pts[pts.length - 1] }
  }, [series])

  return (
    <div className="glass p-6 lg:col-span-2">
      <div className="text-sm font-semibold text-iris-100">Ideas posted over time</div>
      <div className="font-display text-3xl font-bold text-white">
        {loading ? '…' : formatNumber(series.length)}
      </div>
      {!loading && path ? (
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6d5efc" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6d5efc" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={path.area} fill="url(#area)" />
          <path d={path.line} fill="none" stroke="#8b8cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={path.last[0]} cy={path.last[1]} r="4" fill="#37e6c9" />
        </svg>
      ) : (
        <p className="mt-6 text-sm text-iris-300/50">
          {loading ? 'Loading…' : 'Not enough data yet for a trend. It fills in as ideas come in.'}
        </p>
      )}
    </div>
  )
}

function PipelineCard({ pipeline, total, loading }) {
  const rows = [
    ['building', builderStatuses.building],
    ['planned', builderStatuses.planned],
    ['considering', builderStatuses.considering],
    ['shipped', builderStatuses.shipped],
    ['open', { label: 'Not triaged yet', emoji: '⬚', dot: 'bg-white/30', text: 'text-iris-100/70' }]
  ]
  return (
    <div className="glass flex flex-col p-6">
      <div className="text-sm font-semibold text-iris-100">Idea pipeline</div>
      <ul className="mt-3 space-y-3">
        {rows.map(([key, meta]) => {
          const n = pipeline[key] || 0
          const pct = total ? Math.round((n / total) * 100) : 0
          return (
            <li key={key}>
              <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center gap-1.5 ${meta.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
                <span className="font-semibold text-white">{loading ? '…' : n}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${meta.dot}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function FeedbackTable({ rows, loading }) {
  return (
    <div className="glass mt-5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-iris-300/60">
              <th className="px-6 py-4 font-semibold">Tool</th>
              <th className="px-6 py-4 font-semibold">Improvements</th>
              <th className="px-6 py-4 font-semibold">Feedback</th>
              <th className="px-6 py-4 font-semibold">Replied</th>
              <th className="px-6 py-4 font-semibold">Total notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-0 transition hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-semibold text-white">{r.name}</td>
                <td className="px-6 py-4 text-iris-100/80">{loading ? '…' : r.improvements}</td>
                <td className="px-6 py-4 text-iris-100/80">{loading ? '…' : r.feedback}</td>
                <td className="px-6 py-4 text-iris-100/80">{loading ? '…' : r.replied}</td>
                <td className="px-6 py-4 font-semibold text-white">{loading ? '…' : r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
