-- Bot operational tables: key/value state (sales + reverify cursors, links msg id)
-- and scheduled reminders.
--
-- ⚠️ Apply to the PRIMOS Supabase project (akupbtypgrzbrgvyjmct) — same place as
-- the verify tables. Run via the SQL editor (the Claude Supabase MCP can't reach
-- this project — it's a different account).

create table if not exists public.bot_state (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_reminders (
  id           uuid primary key default gen_random_uuid(),
  enabled      boolean not null default true,
  schedule     text not null default 'daily',
  channel_id   text not null,
  content      text not null,
  last_sent_at timestamptz,
  created_at   timestamptz not null default now()
);

-- Bot backend uses the service-role key (bypasses RLS); enable RLS with no public
-- policies so nothing else can read these.
alter table public.bot_state enable row level security;
alter table public.bot_reminders enable row level security;
