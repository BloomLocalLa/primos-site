-- Holder verification (custom Helius bot).
--
-- ⚠️ Apply to the PRIMOS Supabase project (the one whose URL/key are in the bot's
-- Vercel env as SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — NOT any other project.
-- Run via the Supabase MCP `apply_migration` once that project is connected.

-- Single-use, expiring challenges bound to a Discord user.
create table if not exists public.verify_nonces (
  id              uuid primary key default gen_random_uuid(),
  discord_user_id text not null,
  nonce           text not null,
  expires_at      timestamptz not null,
  used            boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists verify_nonces_discord_idx on public.verify_nonces (discord_user_id);
create index if not exists verify_nonces_expires_idx on public.verify_nonces (expires_at);

-- Current linked wallet + tier per Discord user. One wallet per Discord (v1).
create table if not exists public.holder_verifications (
  discord_user_id text primary key,
  wallet          text not null unique,
  count           integer not null default 0,
  tier            text,
  verified_at     timestamptz not null default now()
);

-- The bot backend talks to these with the service-role key (which bypasses RLS).
-- Enable RLS with no public policies so nothing else can read wallet links.
alter table public.verify_nonces enable row level security;
alter table public.holder_verifications enable row level security;
