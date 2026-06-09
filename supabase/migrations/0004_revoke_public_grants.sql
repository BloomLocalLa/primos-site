-- Defense in depth: these tables are server-only (accessed via service role,
-- which bypasses RLS). Revoke the default PostgREST grants from the public
-- API roles so a future RLS misconfiguration can't expose them.
-- Applied to production 2026-06-09 as `revoke_public_grants_bot_tables`.
revoke all on table public.holder_verifications, public.verify_nonces,
                public.bot_state, public.bot_reminders
from anon, authenticated;

-- Also stop future default grants on sequences owned by these tables, if any
-- exist now or later (currently none use serial/identity, this is a no-op guard).
revoke all on all sequences in schema public from anon, authenticated;
