-- Multi-wallet holder verification: holder_verifications becomes ONE ROW PER WALLET
-- (a member can link many). A member's tier = tierFor(SUM of counts across their
-- wallets). Existing rows are preserved (wallet was already unique).
--
-- ⚠️ Apply to the PRIMOS Supabase project (akupbtypgrzbrgvyjmct) via the SQL editor.

alter table public.holder_verifications drop constraint if exists holder_verifications_pkey;
alter table public.holder_verifications drop constraint if exists holder_verifications_wallet_key;
alter table public.holder_verifications add constraint holder_verifications_pkey primary key (wallet);
create index if not exists holder_verifications_discord_idx on public.holder_verifications (discord_user_id);

-- Tier is now computed per-member at runtime (from the summed count), not stored.
alter table public.holder_verifications drop column if exists tier;
