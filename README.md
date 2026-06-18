# Probably Useful

The home for small tools built to solve real problems — mine first, hopefully yours too.
Landing page + idea billboard + per-product feedback + a metrics dashboard.

Live at **probablyuseful.space**.

## Stack

- React 18 + Vite
- Tailwind CSS
- **Nhost** (Hasura GraphQL + Postgres + Auth) is the backend for ideas and
  feedback, in both dev and production. There is no mock fallback: set up Nhost
  before running (see `SETUP-NHOST.md`). Until configured, the site shows a
  "configure Nhost" notice.
- Note: the project pins `@nhost/nhost-js@^2` (stable). Nhost has since shipped
  a v4 SDK with a different API; migrate when convenient.

## Run it

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # outputs to /dist
npm run preview
```

## How to add a new app/tool

Open `src/data/apps.js` and append one object to the `apps` array:

```js
{
  id: 'myapp',                 // unique slug (also used for its feedback thread)
  name: 'MyApp',
  tagline: 'One short line.',
  description: 'A sentence or two about what it does.',
  status: 'live',              // 'live' | 'beta' | 'soon'
  url: 'https://myapp.example',// '' if no link yet
  tags: ['Web', 'Productivity'],
  accent: 'iris',              // 'iris' | 'spark' | 'amber' | 'rose'
  icon: '🚀'
}
```

That's it — it renders automatically in the tools grid and the feedback
product picker. No other file needs editing.

## Features

- **Idea Billboard** (`src/components/Billboard.jsx`) — anyone can post a tool idea
  and upvote others (anonymous, votes guarded per-browser via `localStorage`).
  Ideas live in Nhost.
- **Spam filter** (`src/lib/spamFilter.js`) — lightweight, dependency-free
  heuristics. Runs live as you type and blocks on submit. Also used in the admin
  panel to sort likely-spam to the top.
- **Per-product feedback** (`src/components/Feedback.jsx`) — pick a tool, leave an
  *Improvement* or general *Feedback* note; stored in Nhost per product.
- **Admin console** (`src/components/Admin.jsx`, at `/#admin`) — owner-only,
  Nhost-auth gated. Delete spam, set an idea's status, and write the public
  "From the builder" note. Enforced by Hasura permissions, not just the UI.
- **Dashboard** (`src/components/Dashboard.jsx`) — headline stats, growth chart,
  donut, per-tool table. Numbers are still illustrative (`src/data/metrics.js`).

## Backend

See `SETUP-NHOST.md` for the full setup, and `nhost/` for `schema.sql`,
`seed.sql`, and `permissions.md`.

## Logo

The mark is a tilde (`~` = "approximately / probably") inside a gradient tile
with a spark dot (the "useful" payoff). Source: `public/favicon.svg` and the
React version in `src/components/Logo.jsx`.
