import { useState } from 'react'
import { apps } from '../data/apps.js'
import AppCard from './AppCard.jsx'

const LIMIT = 9 // show this many before a "view all" appears

export default function AppsSection({ onFeedback }) {
  const [showAll, setShowAll] = useState(false)
  const visibleApps = showAll ? apps : apps.slice(0, LIMIT)

  return (
    <section id="apps" className="scroll-mt-24 py-20">
      <div className="container-px">
        <div className="max-w-2xl">
          <span className="section-eyebrow">
            <span className="h-px w-6 bg-spark/60" /> The tools
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Things I&rsquo;ve shipped
          </h2>
          <p className="mt-3 text-iris-100/70">
            Each one started as a problem I had. Some are live, some are still taking shape. Tap the
            chat icon on any card to leave feedback for that specific tool.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleApps.map((app) => (
            <AppCard key={app.id} app={app} onFeedback={onFeedback} />
          ))}

          {/* "more coming" tile keeps the grid feeling alive + hints extensibility */}
          <div className="glass flex min-h-[16rem] flex-col items-center justify-center gap-3 border-dashed p-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-dashed border-white/15 text-xl text-iris-300">
              +
            </div>
            <p className="text-sm font-medium text-iris-100/70">More on the way</p>
            <a href="#billboard" className="text-sm font-semibold text-spark hover:underline">
              Suggest the next one →
            </a>
          </div>
        </div>

        {apps.length > LIMIT && (
          <div className="mt-8 text-center">
            <button onClick={() => setShowAll((v) => !v)} className="btn-ghost">
              {showAll ? 'Show fewer' : `View all ${apps.length} tools`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
