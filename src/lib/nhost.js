import { NhostClient } from '@nhost/nhost-js'

const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN
const region = import.meta.env.VITE_NHOST_REGION

// The app talks to Nhost only. If these aren't set yet, `nhost` is null
// and the UI shows a "configure Nhost" notice instead of silently using
// fake data.
export const nhostConfigured = Boolean(subdomain && region)

export const nhost = nhostConfigured
  ? new NhostClient({ subdomain, region })
  : null

export const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL || '').toLowerCase()

export function isOwnerUser(user) {
  return Boolean(user?.email && OWNER_EMAIL && user.email.toLowerCase() === OWNER_EMAIL)
}
