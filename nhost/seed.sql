-- ─────────────────────────────────────────────────────────────
--  Probably Useful — seed data (the original mock content)
--  Run AFTER schema.sql, once, in the Nhost SQL Editor.
-- ─────────────────────────────────────────────────────────────

insert into public.ideas (text, author, votes, builder_status, builder_note, created_at) values
  ('An app that batches all my recurring subscriptions and reminds me before each renewal so I stop getting surprise charges.',
   'probably-fox', 47, 'building', 'This one bites me every month too. Started on it, early version soon.', '2026-06-10T09:24:00Z'),
  ('A tiny tool to turn a messy meeting transcript into a clean list of action items with owners.',
   'probably-wren', 39, 'planned', 'Love it. On the shortlist right after the current build.', '2026-06-12T14:02:00Z'),
  ('Something like Carbon but for screenshots: a searchable history of every screenshot I take, with OCR.',
   'probably-otter', 33, 'considering', null, '2026-06-13T18:45:00Z'),
  ('A focus timer that actually blocks the specific sites I doomscroll, not just a generic countdown.',
   'probably-lynx', 28, null, null, '2026-06-14T07:11:00Z'),
  ('Knox but it can also securely share one password with a teammate that auto-expires.',
   'probably-heron', 21, null, null, '2026-06-15T11:30:00Z'),
  ('A self-hosted read-it-later that strips ads and saves a clean markdown copy.',
   'probably-sable', 14, null, null, '2026-06-16T16:20:00Z');

insert into public.feedback (app_id, type, text, author, created_at) values
  ('carbon', 'improvement', 'Pinned clips would be amazing, let me keep a few favourites at the top.',
   'probably-koi', '2026-06-11T10:00:00Z'),
  ('carbon', 'feedback', 'Honestly saved me today. Pasted back a config I thought I lost.',
   'probably-crow', '2026-06-12T13:40:00Z'),
  ('carbon', 'improvement', 'A global hotkey to open the history overlay would make it instant.',
   'probably-moth', '2026-06-14T08:15:00Z'),
  ('knox', 'feedback', 'The breach check is a really nice touch. Felt reassuring.',
   'probably-ibex', '2026-06-10T19:05:00Z'),
  ('knox', 'improvement', 'Would love a browser extension to autofill instead of copy-paste.',
   'probably-sable', '2026-06-13T22:30:00Z');
