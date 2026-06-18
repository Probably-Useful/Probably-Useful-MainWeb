-- Run this ONCE in the Nhost SQL Editor if you already created the
-- `feedback` table before builder replies were added.
alter table public.feedback add column if not exists builder_note text;
