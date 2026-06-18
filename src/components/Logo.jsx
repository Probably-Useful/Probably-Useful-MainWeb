// The "Probably Useful" mark: a centered "P" monogram with a matched-width
// mint tilde tucked beneath it as a baseline (~ = "probably"). Reads as one
// designed mark rather than a letter with a stray squiggle.

export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="puTileC" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6d5efc" />
          <stop offset="1" stopColor="#4a36c4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#puTileC)" />
      <rect x="2.5" y="2.5" width="59" height="59" rx="15.5" stroke="#ffffff" strokeOpacity="0.18" />
      <path d="M23 16 V41" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" />
      <path
        d="M23 17 H33 A8.5 8.5 0 0 1 33 34 H23"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 47 q5 -5 10 0 t 10 0"
        fill="none"
        stroke="#37e6c9"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ size = 36 }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <LogoMark size={size} className="transition-transform duration-300 group-hover:rotate-[-6deg]" />
      <span className="font-display text-lg font-bold leading-none tracking-tight">
        <span className="text-iris-100">Probably</span>
        <span className="gradient-text"> Useful</span>
      </span>
    </a>
  )
}

export default Logo
