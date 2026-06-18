import { nhost, nhostConfigured, isOwnerUser } from './nhost.js'

export async function signIn(email, password) {
  if (!nhostConfigured || !nhost) throw new Error('Nhost is not configured.')
  const { session, error } = await nhost.auth.signIn({ email, password })
  if (error) throw new Error(error.message)
  return session?.user || null
}

export async function signOut() {
  if (nhost) await nhost.auth.signOut()
}

export function currentUser() {
  return nhost?.auth.getUser() || null
}

// Subscribe to auth changes. Returns an unsubscribe function.
export function onAuthChange(cb) {
  if (!nhost) {
    cb(null)
    return () => {}
  }
  // fire current state immediately
  cb(nhost.auth.getUser() || null)
  const { unsubscribe } = nhost.auth.onAuthStateChanged((_event, session) => {
    cb(session?.user || null)
  })
  return unsubscribe
}

export { isOwnerUser }
