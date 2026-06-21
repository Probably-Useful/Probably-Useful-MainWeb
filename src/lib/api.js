// All data access goes through here. Nhost (Hasura GraphQL) is the single
// source of truth in both dev and production. Owner-only writes are sent
// with the `owner` Hasura role; that role must be granted to your user in
// the Nhost dashboard (see SETUP-NHOST.md).

import { nhost, nhostConfigured } from './nhost.js'

function ensure() {
  if (!nhostConfigured || !nhost) {
    throw new Error(
      'Nhost is not configured. Set VITE_NHOST_SUBDOMAIN and VITE_NHOST_REGION in your .env.'
    )
  }
}

async function gql(query, variables, asOwner = false) {
  ensure()
  const options = asOwner ? { headers: { 'x-hasura-role': 'owner' } } : undefined
  const { data, error } = await nhost.graphql.request(query, variables, options)
  if (error) {
    const message = Array.isArray(error) ? error[0]?.message : error.message
    throw new Error(message || 'Request failed')
  }
  return data
}

const IDEA_FIELDS = `id text author votes builder_status builder_note created_at`
const FEEDBACK_FIELDS = `id app_id type text author builder_note created_at`

// Lightweight real counts for headline stats (select-only, no extra perms).
export async function getCounts() {
  const data = await gql(`query { ideas { votes } feedback { id } }`)
  return {
    ideas: data.ideas.length,
    votes: data.ideas.reduce((s, i) => s + (i.votes || 0), 0),
    feedback: data.feedback.length
  }
}

// ── Ideas (public) ────────────────────────────────────────────
export async function listIdeas(asOwner = false) {
  const data = await gql(
    `query { ideas(order_by: { created_at: desc }) { ${IDEA_FIELDS} } }`,
    undefined,
    asOwner
  )
  return data.ideas
}

export async function createIdea({ text, author }) {
  const data = await gql(
    `mutation ($text: String!, $author: String!) {
       insert_ideas_one(object: { text: $text, author: $author, votes: 1 }) { ${IDEA_FIELDS} }
     }`,
    { text, author }
  )
  return data.insert_ideas_one
}

export async function changeVotes(id, delta) {
  const data = await gql(
    `mutation ($id: uuid!, $delta: Int!) {
       update_ideas_by_pk(pk_columns: { id: $id }, _inc: { votes: $delta }) { id votes }
     }`,
    { id, delta }
  )
  return data.update_ideas_by_pk
}

// ── Ideas (owner only) ────────────────────────────────────────
export async function setBuilderResponse(id, { status, note }) {
  const data = await gql(
    `mutation ($id: uuid!, $status: String, $note: String) {
       update_ideas_by_pk(pk_columns: { id: $id }, _set: { builder_status: $status, builder_note: $note }) {
         ${IDEA_FIELDS}
       }
     }`,
    { id, status: status ?? null, note: note ?? null },
    true
  )
  return data.update_ideas_by_pk
}

export async function deleteIdea(id) {
  await gql(`mutation ($id: uuid!) { delete_ideas_by_pk(id: $id) { id } }`, { id }, true)
}

// ── Feedback (public read/insert) ─────────────────────────────
export async function listFeedback(asOwner = false) {
  const data = await gql(
    `query { feedback(order_by: { created_at: desc }) { ${FEEDBACK_FIELDS} } }`,
    undefined,
    asOwner
  )
  return data.feedback
}

export async function createFeedback({ appId, type, text, author }) {
  const data = await gql(
    `mutation ($app_id: String!, $type: String!, $text: String!, $author: String!) {
       insert_feedback_one(object: { app_id: $app_id, type: $type, text: $text, author: $author }) {
         ${FEEDBACK_FIELDS}
       }
     }`,
    { app_id: appId, type, text, author }
  )
  return data.insert_feedback_one
}

// ── Feedback (owner only) ─────────────────────────────────────
export async function setFeedbackReply(id, note) {
  const data = await gql(
    `mutation ($id: uuid!, $note: String) {
       update_feedback_by_pk(pk_columns: { id: $id }, _set: { builder_note: $note }) {
         ${FEEDBACK_FIELDS}
       }
     }`,
    { id, note: note ?? null },
    true
  )
  return data.update_feedback_by_pk
}

export async function deleteFeedback(id) {
  await gql(`mutation ($id: uuid!) { delete_feedback_by_pk(id: $id) { id } }`, { id }, true)
}

// ── Subscribers (public insert) ───────────────────────────────
export async function subscribe(email) {
  try {
    const data = await gql(
      `mutation ($email: String!) {
         insert_subscribers_one(object: { email: $email }) { id email created_at }
       }`,
      { email }
    )
    return data.insert_subscribers_one
  } catch (err) {
    // Unique constraint violation means already subscribed — treat as success
    if (err.message && err.message.includes('Uniqueness violation')) return { email }
    throw err
  }
}

// ── Subscribers (owner only) ──────────────────────────────────
export async function listSubscribers() {
  const data = await gql(
    `query { subscribers(order_by: { created_at: desc }) { id email created_at } }`,
    undefined,
    true
  )
  return data.subscribers
}

export async function deleteSubscriber(id) {
  await gql(`mutation ($id: uuid!) { delete_subscribers_by_pk(id: $id) { id } }`, { id }, true)
}

// ── Updates / Broadcasts (owner only) ─────────────────────────
export async function listUpdates() {
  const data = await gql(
    `query { updates(order_by: { created_at: desc }) { id subject body sent_to created_at } }`,
    undefined,
    true
  )
  return data.updates
}

export async function createUpdate({ subject, body, sentTo }) {
  const data = await gql(
    `mutation ($subject: String!, $body: String!, $sent_to: Int!) {
       insert_updates_one(object: { subject: $subject, body: $body, sent_to: $sent_to }) {
         id subject body sent_to created_at
       }
     }`,
    { subject, body, sent_to: sentTo },
    true
  )
  return data.insert_updates_one
}
