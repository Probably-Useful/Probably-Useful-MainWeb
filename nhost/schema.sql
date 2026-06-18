-- ─────────────────────────────────────────────────────────────
--  Probably Useful — database schema
--  Run this in the Nhost dashboard: SQL Editor (tick "track this"
--  so Hasura exposes the tables over GraphQL). See SETUP-NHOST.md.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Ideas posted on the billboard ------------------------------------------
create table if not exists public.ideas (
  id              uuid primary key default gen_random_uuid(),
  text            text not null,
  author          text not null default 'probably-anon',
  votes           integer not null default 1,
  builder_status  text,                 -- considering | planned | building | shipped | null
  builder_note    text,                 -- public "from the builder" note | null
  created_at      timestamptz not null default now()
);

create index if not exists ideas_created_at_idx on public.ideas (created_at desc);
create index if not exists ideas_votes_idx on public.ideas (votes desc);

-- Per-product feedback ---------------------------------------------------
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  app_id      text not null,            -- matches an id in src/data/apps.js
  type        text not null check (type in ('improvement', 'feedback')),
  text        text not null,
  author      text not null default 'probably-anon',
  builder_note text,                    -- public "from the builder" reply | null
  created_at  timestamptz not null default now()
);

create index if not exists feedback_app_idx on public.feedback (app_id, created_at desc);
