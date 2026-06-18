// ─────────────────────────────────────────────────────────────
//  ADD A NEW APP HERE.
//  Just append an object to this array and it renders automatically
//  across the landing page (apps grid + feedback product picker).
//
//  Fields:
//   id          unique slug (used for feedback routing) — required
//   name        display name — required
//   tagline     one short line under the name — required
//   description longer blurb for the card — required
//   status      'live' | 'beta' | 'soon'
//   url         live link ('' if none yet)
//   tags        array of short labels
//   accent      'iris' | 'spark' | 'amber' | 'rose'  (card glow color)
//   icon        single emoji/char shown in the tile (cheap, swap for SVG later)
// ─────────────────────────────────────────────────────────────

export const apps = [
  {
    id: 'carbon',
    name: 'Carbon',
    tagline: 'Your clipboard, with a memory.',
    description:
      'A desktop clipboard manager that keeps a searchable history of everything you copy, text and snippets alike, so you never lose that thing you copied five minutes ago.',
    status: 'live',
    url: '',
    tags: ['Desktop', 'Productivity', 'Electron'],
    accent: 'spark',
    icon: '⌘'
  },
  {
    id: 'knox',
    name: 'Knox',
    tagline: 'A vault only you can open.',
    description:
      'A zero-knowledge password manager that encrypts everything in your browser before it ever leaves your device. Generate strong passwords, check for breaches, stay locked down.',
    status: 'live',
    url: '',
    tags: ['Security', 'Web', 'Privacy'],
    accent: 'iris',
    icon: '🔐'
  },
  {
    id: 'relay',
    name: 'Relay',
    tagline: 'Coming soon.',
    description:
      'Something to move your stuff from here to there without the friction. Still in the workshop, so drop a note on the billboard if you want a say in what it becomes.',
    status: 'soon',
    url: '',
    tags: ['In the works'],
    accent: 'amber',
    icon: '📡'
  },
  {
    id: 'rune',
    name: 'Rune',
    tagline: 'Coming soon.',
    description:
      'A small bit of magic for a problem I keep running into. Details are still taking shape, so feedback is welcome before it ships.',
    status: 'soon',
    url: '',
    tags: ['In the works'],
    accent: 'rose',
    icon: '🪄'
  }
]

export const statusMeta = {
  live: { label: 'Live', dot: 'bg-spark', text: 'text-spark' },
  beta: { label: 'Beta', dot: 'bg-iris-400', text: 'text-iris-300' },
  soon: { label: 'Coming soon', dot: 'bg-amber-400', text: 'text-amber-300' }
}

export const accentMap = {
  iris: { glow: 'hover:shadow-[0_24px_70px_-24px_rgba(109,94,252,0.6)]', ring: 'group-hover:border-iris-400/50', tile: 'from-iris-500/30 to-iris-700/10' },
  spark: { glow: 'hover:shadow-[0_24px_70px_-24px_rgba(55,230,201,0.5)]', ring: 'group-hover:border-spark/40', tile: 'from-spark/25 to-iris-700/10' },
  amber: { glow: 'hover:shadow-[0_24px_70px_-24px_rgba(251,191,36,0.45)]', ring: 'group-hover:border-amber-400/40', tile: 'from-amber-400/25 to-iris-700/10' },
  rose: { glow: 'hover:shadow-[0_24px_70px_-24px_rgba(244,114,182,0.45)]', ring: 'group-hover:border-rose-400/40', tile: 'from-rose-400/25 to-iris-700/10' }
}
