import { useEffect, useState } from 'react'
import { LogoMark } from './Logo.jsx'
import { apps } from '../data/apps.js'
import { getCounts } from '../lib/api.js'
import { formatNumber } from '../lib/format.js'

export default function Hero() {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    let alive = true
    getCounts()
      .then((c) => alive && setCounts(c))
      .catch(() => alive && setCounts(null))
    return () => {
      alive = false
    }
  }, [])

  const toolsLive = apps.filter((a) => a.status === 'live').length

  const stats = [
    { id: 'tools', label: 'Tools live', value: toolsLive, ready: true },
    { id: 'ideas', label: 'Ideas on the board', value: counts?.ideas, ready: !!counts },
    { id: 'votes', label: 'Votes cast', value: counts?.votes, ready: !!counts },
    { id: 'feedback', label: 'Notes received', value: counts?.feedback, ready: !!counts }
  ]

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 sm:pt-36">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-60"
        style={{ backgroundSize: '48px 48px', maskImage: 'radial-gradient(70% 60% at 50% 0%, black, transparent)' }}
      />

      <div className="container-px relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center animate-fade-in">
            <div className="relative">
              <span className="absolute inset-0 rounded-[20px] bg-iris-500/40 blur-2xl" />
              <LogoMark size={72} className="relative animate-float" />
            </div>
          </div>

          <span className="chip mb-5 animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-spark" />
            Built in the open · shaped by you
          </span>

          <h1 className="animate-fade-up font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Turning personal fixes
            <br />
            into <span className="gradient-text">public utilities.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-iris-100/70 sm:text-lg">
            I build apps to fix my own problems, then ship them hoping they fix yours too. Got
            something that keeps bugging you? Tell me about it. I love building, and I&rsquo;ll
            happily turn the good ideas into real tools in my free time.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#apps" className="btn-primary w-full sm:w-auto">
              Explore the tools
            </a>
            <a href="#billboard" className="btn-ghost w-full sm:w-auto">
              Post an idea →
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id} className="glass animate-fade-up px-4 py-5 text-center">
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                {s.ready ? formatNumber(s.value) : <span className="text-iris-300/40">…</span>}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-iris-100/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
