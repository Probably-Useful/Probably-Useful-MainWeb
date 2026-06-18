# Hasura permissions (Nhost)

Set these in the Nhost dashboard under **Hasura Console → Data → [table] → Permissions**.
Two roles matter:

- `public` — unauthenticated visitors (Nhost's default unauthorized role).
- `owner` — you, signed in. You must grant this role to your owner user (see SETUP-NHOST.md).

The point: visitors can read, post ideas, vote, and post feedback. Only `owner`
can write builder responses or delete anything. This is enforced at the database,
so it can't be bypassed from the browser.

---

## Table: `ideas`

### Role `public`
- **select**: allowed. Columns: all. Row filter: `{}` (no restriction).
- **insert**: allowed. Columns: `text`, `author`. Row check: `{}`.
  - Column presets / defaults handle `votes` (1), `builder_*` (null), `created_at`.
- **update**: allowed. Columns: `votes` ONLY. Row check: `{}`.
  - This is what lets anyone upvote. Do NOT allow `builder_status`/`builder_note` here.
- **delete**: NOT allowed.

### Role `owner`
- **select**: allowed, all columns.
- **update**: allowed. Columns: `builder_status`, `builder_note`, `votes`. Row check: `{}`.
- **delete**: allowed. Row check: `{}`.

---

## Table: `feedback`

### Role `public`
- **select**: allowed, all columns, filter `{}`.
- **insert**: allowed. Columns: `app_id`, `type`, `text`, `author`. Row check: `{}`.
- **update**: NOT allowed.
- **delete**: NOT allowed.

### Role `owner`
- **select**: allowed, all columns.
- **update**: allowed. Columns: `builder_note`. Row check: `{}`. (Lets you reply.)
- **delete**: allowed, row check `{}`.

---

## Notes

- The web app sends owner-only mutations with the header `x-hasura-role: owner`.
  That only works if your signed-in user actually has the `owner` role in its
  allowed roles, so the grant step in SETUP is required.
- Voting is a simple counter plus a per-browser `localStorage` guard. It's enough
  to stop casual double-voting. If you later want stronger anti-abuse, add an
  `idea_votes` table keyed by a device id and move the count to an aggregate.
