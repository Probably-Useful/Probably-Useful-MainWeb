export function timeAgo(iso) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000))
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['w', 604800],
    ['d', 86400],
    ['h', 3600],
    ['m', 60]
  ]
  for (const [label, size] of units) {
    const v = Math.floor(secs / size)
    if (v >= 1) return `${v}${label} ago`
  }
  return 'just now'
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('en-US')
}
