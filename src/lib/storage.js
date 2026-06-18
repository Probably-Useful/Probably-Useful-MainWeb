// localStorage helpers. Keeps anonymous-vote state and a stable
// per-browser handle so a person can't spam votes from one device.
// (When Nhost lands, voting can move server-side; this stays as a
//  cheap client guard.)

import { handleParts } from '../data/billboard.js'

const VOTES_KEY = 'pu.billboard.votes'
const HANDLE_KEY = 'pu.handle'
const BUILDER_MODE_KEY = 'pu.builder.mode'
const BUILDER_UPDATES_KEY = 'pu.builder.updates'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked — fail quietly */
  }
}

export function getVotedIds() {
  return new Set(read(VOTES_KEY, []))
}

export function toggleVote(id) {
  const ids = read(VOTES_KEY, [])
  const set = new Set(ids)
  let voted
  if (set.has(id)) {
    set.delete(id)
    voted = false
  } else {
    set.add(id)
    voted = true
  }
  write(VOTES_KEY, [...set])
  return voted
}

export function getHandle() {
  let handle = read(HANDLE_KEY, null)
  // migrate any older 'anon-' handles to the 'probably-' style
  if (!handle || !String(handle).startsWith('probably-')) {
    const { animals } = handleParts
    const b = animals[Math.floor(Math.random() * animals.length)]
    handle = `probably-${b}`
    write(HANDLE_KEY, handle)
  }
  return handle
}

// ── Builder mode (founder controls) ───────────────────────────
// NOTE: this is an unauthenticated client flag for now — it only
// gates UI, not data. Move this behind real Nhost auth before any
// of these updates actually persist server-side.

export function getBuilderMode() {
  return read(BUILDER_MODE_KEY, false) === true
}

export function setBuilderMode(on) {
  write(BUILDER_MODE_KEY, !!on)
  return !!on
}

// Builder updates are stored as { [ideaId]: { builderStatus, builderNote } }
// and layered over the seed data so they survive reloads (mock persistence).
export function getBuilderUpdates() {
  return read(BUILDER_UPDATES_KEY, {})
}

export function saveBuilderUpdate(ideaId, update) {
  const all = read(BUILDER_UPDATES_KEY, {})
  all[ideaId] = { ...(all[ideaId] || {}), ...update }
  write(BUILDER_UPDATES_KEY, all)
  return all
}
