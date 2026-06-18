// ─────────────────────────────────────────────────────────────
//  Lightweight client-side spam / relevance filter.
//  No ML, no dependencies — just fast heuristics tuned for an
//  "ideas billboard". Returns { ok, score, reasons }.
//
//  score: 0 (clean) → 100 (almost certainly spam)
//  ok:    true if score < BLOCK_THRESHOLD
// ─────────────────────────────────────────────────────────────

const BLOCK_THRESHOLD = 60

// Obvious spam / commercial / abuse signals
const SPAM_WORDS = [
  'viagra', 'casino', 'porn', 'xxx', 'bitcoin', 'crypto giveaway', 'forex',
  'make money', 'work from home', 'click here', 'buy now', 'free money',
  'loan', 'betting', 'seo services', 'cheap', 'discount code', 'promo code',
  'subscribe to my', 'follow me', 'dm me', 'whatsapp', 'telegram', 'gmail.com',
  'investment', 'earn $', 'guaranteed', 'winner', 'congratulations you'
]

const PROFANITY = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'cunt']

// Relevance hints — content should sound like a tool/app idea
const RELEVANCE_HINTS = [
  'app', 'tool', 'feature', 'build', 'idea', 'wish', 'would love', 'could',
  'something that', 'a way to', 'manage', 'track', 'automate', 'remind',
  'organise', 'organize', 'website', 'extension', 'dashboard', 'integrate',
  'sync', 'export', 'import', 'productivity', 'workflow', 'i want', 'need'
]

const URL_RE = /(https?:\/\/|www\.)\S+/gi
const REPEAT_CHAR_RE = /(.)\1{4,}/i // e.g. "aaaaa", "!!!!!"

function countMatches(haystack, needles) {
  let n = 0
  for (const w of needles) if (haystack.includes(w)) n++
  return n
}

export function analyzeIdea(rawText) {
  const reasons = []
  let score = 0
  const text = (rawText || '').trim()
  const lower = text.toLowerCase()
  const letters = (text.match(/[a-z]/gi) || []).length

  // 1. Length checks
  if (text.length < 12) {
    score += 45
    reasons.push('Too short to be a real idea. Add a little detail.')
  }
  if (text.length > 600) {
    score += 15
    reasons.push('Very long. Try trimming to the core idea.')
  }

  // 2. Spam vocabulary
  const spamHits = countMatches(lower, SPAM_WORDS)
  if (spamHits > 0) {
    score += spamHits * 40
    reasons.push('Looks promotional / spammy.')
  }

  // 3. Profanity
  if (PROFANITY.some((w) => new RegExp(`\\b${w}`, 'i').test(lower))) {
    score += 35
    reasons.push('Contains language that gets flagged. Keep it civil.')
  }

  // 4. Links (a single link is suspicious on an ideas board)
  const urls = lower.match(URL_RE) || []
  if (urls.length > 0) {
    score += 30 + (urls.length - 1) * 20
    reasons.push('Links are not allowed here.')
  }

  // 5. Shouting / repetition
  if (REPEAT_CHAR_RE.test(text)) {
    score += 20
    reasons.push('Too much repetition.')
  }
  const upper = (text.match(/[A-Z]/g) || []).length
  if (letters > 10 && upper / letters > 0.6) {
    score += 20
    reasons.push('Please don\u2019t type in all caps.')
  }

  // 6. Gibberish — very low ratio of letters/spaces to total
  const wordCount = (text.match(/\b[\w']+\b/g) || []).length
  if (text.length > 15 && wordCount < 3) {
    score += 25
    reasons.push('Doesn\u2019t read like a sentence.')
  }

  // 7. Relevance — nudge down the score if it sounds on-topic
  const relevanceHits = countMatches(lower, RELEVANCE_HINTS)
  if (relevanceHits === 0 && text.length < 40) {
    score += 20
    reasons.push('Not sure this is a tool/app idea. Be a bit more specific.')
  } else if (relevanceHits >= 1) {
    score = Math.max(0, score - 10)
  }

  score = Math.max(0, Math.min(100, score))
  const ok = score < BLOCK_THRESHOLD

  return {
    ok,
    score,
    // surface the single most useful reason to the user
    reason: reasons[0] || null,
    reasons
  }
}

export { BLOCK_THRESHOLD }
