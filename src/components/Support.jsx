// ── Payment config ───────────────────────────────────────────
// Paste your hosted payment link here after deploy (Razorpay /
// Cashfree / Instamojo payment page or button URL). Until it is set,
// the section shows a tasteful "coming soon" state. Your personal
// payment details never live in this codebase.
const AGGREGATOR_LINK = '' // e.g. 'https://rzp.io/l/probably-useful'

export default function Support() {
  const ready = AGGREGATOR_LINK.trim().length > 0

  return (
    <section id="support" className="scroll-mt-24 py-20">
      <div className="container-px">
        <div className="glass relative overflow-hidden p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-spark/10 blur-3xl" />

          <div className="max-w-2xl">
            <span className="section-eyebrow">
              <span className="h-px w-6 bg-spark/60" /> Support
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Buy me a coffee, only if it helped
            </h2>
            <p className="mt-3 text-iris-100/70">
              Everything here is free and built in my spare time. No paywalls, no nags. If a tool
              saved you some trouble and you feel like chipping in, it genuinely helps me keep
              building and keeps the lights on. Totally optional, and zero pressure.
            </p>

            <div className="mt-6">
              {ready ? (
                <a href={AGGREGATOR_LINK} target="_blank" rel="noreferrer" className="btn-spark">
                  Support securely ↗
                </a>
              ) : (
                <span className="btn-ghost cursor-default opacity-70">
                  Support link going live soon ☕
                </span>
              )}
            </div>

            {ready && (
              <p className="mt-3 text-xs text-iris-300/50">
                Payments are handled by a secure provider. Thanks for even considering it.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
