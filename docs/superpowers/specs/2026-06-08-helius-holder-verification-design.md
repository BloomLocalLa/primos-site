# Helius Holder Verification — Design Spec

**Date:** 2026-06-08
**Status:** Awaiting review
**Goal:** Members prove they own a Solana wallet, the bot counts their Primos via Helius, and assigns a tier role. Roles re-checked nightly so sellers lose them automatically. Custom bot is the *authoritative* holder-role assigner; Atlas3 stays only for raffles/allowlist.

## Decisions (locked)
- **Highest tier only** — one tier role per member (25 held → El Jefe only).
- **Wallet-held only (v1)** — Primos sitting in marketplace escrow (listed) don't count until delisted. Listed-aware counting is a documented v2.
- **One wallet per Discord (v1)** — re-verifying replaces the linked wallet. Multi-wallet aggregation is v2.

## Tiers (Primos held → role)
| Tier | Threshold | Role |
|------|-----------|------|
| Primo | ≥ 1 | `TIER_ROLE_PRIMO` |
| Compadre | ≥ 5 | `TIER_ROLE_COMPADRE` |
| Tío | ≥ 10 | `TIER_ROLE_TIO` |
| El Jefe | ≥ 25 | `TIER_ROLE_ELJEFE` |

Hold count 0 → no tier role (and existing tier role removed on re-check).

## Flow
1. Member runs **`/verify`** (public slash command) → bot creates a single-use nonce bound to their Discord ID and replies **ephemerally** with a link: `https://primos-site.vercel.app/verify?t=<nonceId>`.
2. The **/verify page** fetches the challenge (`GET /api/discord/verify-challenge?t=…`), the member connects Phantom/Solflare and **signs the challenge message** (no transaction, no funds moved).
3. Page POSTs `{t, wallet, signature}` to `POST /api/discord/verify-complete`.
4. Server: validate nonce (unused + unexpired) → reconstruct the exact message → **verify the ed25519 signature** (`tweetnacl`) against the wallet pubkey → on success, query **Helius `searchAssets`** for that owner filtered to the Primos collection → `total` = count → compute tier → assign the tier role, strip the other three (highest-only) → upsert `holder_verifications` → mark nonce used.
5. **Nightly cron** (`cron-reverify`) re-checks every linked wallet, recomputes tier, adjusts/removes roles, updates the row. Paced for Helius free tier (2 DAS req/s).

## Security model
- Nonce is random, **single-use**, **10-min expiry**, stored server-side and **bound to the requesting Discord ID** — so a captured signature can't be replayed for a different user.
- The signed message embeds the Discord ID + nonce, so a signature for one challenge is useless elsewhere.
- Wallet ownership is proven by signature only; we never ask for seed phrases, private keys, or any transaction.
- Wallet is enforced **unique** across `holder_verifications` (one wallet can't farm roles on multiple Discord accounts).
- All assignment endpoints are server-side with the bot token; the page never sees the token.

## Components

### New
- `src/pages/Verify.jsx` + route in `src/App.jsx` — connect wallet (direct `window.solana`/`window.solflare` injection, **no new heavy deps** for v1), sign, submit, show result.
- `api/discord/verify-challenge.js` — `GET ?t=` → `{ message, discordTag, expiresAt }`.
- `api/discord/verify-complete.js` — `POST {t, wallet, signature}` → verify + assign + persist.
- `api/discord/cron-reverify.js` — auth via existing `cron-auth`; re-check all linked wallets.
- `api/discord/_lib/helius.js` — `countPrimos(wallet)` via Helius `searchAssets` (grouping = Primos collection).
- `api/discord/_lib/tiers.js` — `tierFor(count)` + role-id resolution (highest-only).
- `api/discord/_lib/holders.js` — Supabase access for `verify_nonces` + `holder_verifications`.
- Supabase tables (created via Supabase MCP migration):
  - `verify_nonces(id uuid pk, discord_user_id text, nonce text, expires_at timestamptz, used bool default false, created_at timestamptz default now())`
  - `holder_verifications(discord_user_id text pk, wallet text unique, count int, tier text, verified_at timestamptz)`

### Modified
- `api/discord/_lib/rest.js` — add `addGuildMemberRole`, `removeGuildMemberRole`, `getGuildMember`.
- `api/discord/_lib/router.js` — handle public `/verify` **before** the mod gate; create nonce via injected dep; return ephemeral link.
- `api/discord/interactions.js` — inject new deps (`createNonce`).
- `api/discord/_lib/config.js` — add `HELIUS_API_KEY`, `PRIMOS_COLLECTION_ADDRESS`, `TIER_ROLE_*` ids, `PUBLIC_BASE_URL`.
- `scripts/register-commands.js` — register `/verify`.
- GitHub Actions — add a scheduled job hitting `cron-reverify` (mirrors the existing cron scheduler).
- `docs/` operator guide + `.env.example` — new env vars.

## Env additions
- `HELIUS_API_KEY` — **you create** (free Helius account → API key).
- `PRIMOS_COLLECTION_ADDRESS` — *I resolve* (verified-collection address from a known Primos mint).
- `TIER_ROLE_PRIMO|COMPADRE|TIO|ELJEFE` — the 4 tier role IDs on guild `1513322208020135946`.
- `PUBLIC_BASE_URL` — e.g. `https://primos-site.vercel.app`.

## Prerequisites
- Custom bot must be **in the new server** with **Manage Roles**, and its highest role must sit **above** all four tier roles (Discord won't let a bot assign a role above its own).
- Bot Vercel env still points at the old guild (migration checklist) — repoint as part of this.

## Testing
- Unit: `tiers` (boundaries 0/1/4/5/9/10/24/25), signature verify (valid/invalid/replay/expired), helius count (mocked), rest role calls (mocked fetch). Follows the existing `deps`-injection + vitest pattern.

## Out of scope (v2)
- Listed/escrow-aware counting (ME + Tensor lookups).
- Multi-wallet aggregation per member.
- `@solana/wallet-adapter` upgrade for broader wallet UX.
