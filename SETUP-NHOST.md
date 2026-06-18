# Connecting Probably Useful to Nhost

The app uses **Nhost only** for ideas + feedback, in both development and
production. There's no mock fallback: until the env vars below are set, the
site shows a "configure Nhost" notice. Follow these steps once.

## 1. Create the project
1. Sign up at [nhost.io](https://nhost.io) and create a new project (free tier).
2. In **Project → Settings**, copy your **Subdomain** and **Region**.

## 2. Add env vars
Edit `.env` (it's git-ignored) and fill in:

```
VITE_NHOST_SUBDOMAIN=your-subdomain
VITE_NHOST_REGION=your-region
VITE_OWNER_EMAIL=demetrius.mmiii@gmail.com
```

Restart the dev server after editing (`npm run dev`).
For production (Netlify), add the same three variables in the site's
environment settings.

## 3. Create the tables
Open **Nhost dashboard → Database → SQL Editor**:
1. Paste the contents of `nhost/schema.sql` and run it.
   Make sure **"Track this"** is enabled so Hasura exposes the tables.
2. Paste the contents of `nhost/seed.sql` and run it once to load the
   starter ideas and feedback.

## 4. Set permissions
Open **Hasura Console** (from the Nhost dashboard) and apply the rules in
`nhost/permissions.md` for the `public` and `owner` roles on both tables.
This is what keeps builder replies and deletes owner-only.

## 5. Create your owner account + the `owner` role
The admin console runs entirely as a dedicated `owner` role. Your account's
default Nhost roles (`user`, `me`, `anonymous`) are NOT enough — `me` is shared
by every signed-in user, so it can't be the moderator role. Do this:

1. **Make `owner` a valid role:** Nhost dashboard → Settings → Roles and
   Permissions → add `owner` to the Allowed Roles list and save.
2. **Grant it to you:** Auth → Users → open `demetrius.mmiii@gmail.com` → add
   `owner` to its Allowed Roles (keep default role as `user`). Sign out/in after.
3. If you don't have the account yet, create it (enable email sign-up or add the
   user in Auth → Users), then do step 2.

## 6. Permissions
Apply `nhost/permissions.md`:
- `public` role: select + insert on both tables, plus update `votes` on `ideas`
  (this is what makes the public site work).
- `owner` role: select + update (`builder_status`, `builder_note`, `votes`) +
  delete on `ideas`, and select + delete on `feedback`.

## 7. Use it
- Public site: anyone can post ideas, vote, and leave feedback (anonymously).
- Admin: visit `/#admin`, sign in with the owner email, and you can:
  - delete spam ideas and feedback (likely-spam is sorted to the top),
  - set an idea's status (Considering / Planned / Building / Shipped),
  - write the public "From the builder" note.

## What stays in code (not Nhost)
- The **apps catalog** (`src/data/apps.js`) — your product list, edited in code.
- The **dashboard numbers** (`src/data/metrics.js`) — still illustrative; wire to
  real aggregates whenever you like.
- The **support link** (`src/components/Support.jsx`) — paste your Razorpay link
  into `AGGREGATOR_LINK` after deploy.
