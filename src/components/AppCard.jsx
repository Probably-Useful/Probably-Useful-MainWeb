import { statusMeta, accentMap } from '../data/apps.js'

export default function AppCard({ app, onFeedback }) {
  const status = statusMeta[app.status] || statusMeta.soon
  const accent = accentMap[app.accent] || accentMap.iris
  const isLive = app.status !== 'soon'

  return (
    <article
      className={`group glass relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 ${accent.glow}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br text-xl ${accent.tile}`}
        >
          {app.icon}
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${app.status === 'live' ? 'animate-pulse' : ''}`} />
          {status.label}
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl font-bold text-white">{app.name}</h3>
      <p className="mt-0.5 text-sm font-medium text-iris-300/90">{app.tagline}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-iris-100/65">{app.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {app.tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
        {isLive ? (
          app.url ? (
            <a href={app.url} target="_blank" rel="noreferrer" className="btn-primary flex-1">
              Open {app.name}
            </a>
          ) : (
            <span className="btn-ghost flex-1 cursor-default opacity-70">Link coming</span>
          )
        ) : (
          <span className="btn-ghost flex-1 cursor-default opacity-70">In the workshop</span>
        )}
        <button onClick={() => onFeedback(app.id)} className="btn-ghost px-3" title={`Feedback for ${app.name}`}>
          💬
        </button>
      </div>
    </article>
  )
}
