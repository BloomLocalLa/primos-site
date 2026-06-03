# Primos Discord Bot — Design Spec

- **Date:** 2026-06-02
- **Status:** Design approved — pending implementation plan
- **Repo:** `primos-site` (React + Vite, deployed on Vercel; Supabase free tier available)
- **Target server:** `Primos | PrimosNFT` (guild ID `1277996118059253821`)

## 1. Overview

A free, serverless Discord bot for the Primos NFT community. The mod team posts
formatted content on demand via slash commands, and the bot posts scheduled
updates automatically. It runs on the **existing Vercel deployment** (Discord
HTTP interactions) and uses the **existing Supabase project** for a small amount
of state. There is **no always-on host and no AI/LLM**, so there is **zero
ongoing cost**.

## 2. Goals

- Mods post formatted **announcements, official links, stats, and custom messages** via slash commands.
- **Automated** daily stats, sales alerts, and scheduled reminders.
- **$0 ongoing cost**; reuse Vercel + Supabase + the existing Magic Eden integration (`src/lib/magiceden.js`, `api/magiceden.js`).
- Public-posting commands require a **preview → confirm** step to prevent mistakes.

## 3. Non-goals (explicitly out of scope)

- **No conversational AI / LLM** — dropped for cost.
- **No community-facing chat** — this is an admin/mod tool only.
- **No new-listing alerts** — sales alerts only.
- **No always-on gateway bot / paid hosting.**

> **Future / phase 2 (not now):** a conversational AI assistant and/or community
> Q&A. That path requires a paid always-on host + an LLM API key, so it is
> deliberately deferred. The architecture below does not block adding it later.

## 4. Constraints

- **Free tiers only:** Vercel Hobby, GitHub Actions, Supabase free, Magic Eden public API.
- **Serverless & stateless** → all persistence lives in Supabase.
- **Discord's 3-second interaction rule** → any handler that fetches data uses a **deferred response** (ack immediately, then edit).
- **Signature verification needs the raw request body** → the interactions function must read the raw body *before* JSON parsing (see §10).

## 5. Architecture

```
                    ┌─────────────────── DISCORD ───────────────────┐
   mod runs         │  /announce   /links   /stats   /say            │
   a slash cmd ───► │            │                                   │
                    └────────────┼───────────────────────────────────┘
                                 │ signed HTTPS POST (interaction)
                                 ▼
                  Vercel: api/discord/interactions.js
                  verify signature → route by type → mod-role gate
                  → run command handler → reply (ephemeral / deferred)
                                 │ posts via bot token (Discord REST)
                                 ▼
                  #announcements / #official-links / chosen channel

   GitHub Actions cron ──► Vercel: api/discord/cron-*.js ──► Magic Eden ──► post
   (free scheduler)        (CRON_SECRET-protected)           (existing code)
                                 ▲
                                 │ read/write cursor, message IDs, reminders
                            Supabase (free tier)
```

- A **Discord Application** (bot) is registered once in the Developer Portal (free).
- **Slash commands and button clicks** arrive as HTTP interactions at a single
  endpoint, `api/discord/interactions.js`.
- **Scheduled jobs** are driven by **GitHub Actions cron**, which calls
  secret-protected Vercel endpoints. GitHub Actions is used (rather than Vercel
  Cron) because it allows sub-daily frequency for free, which sales alerts need.
- **All posting** uses the **Discord REST API** with the bot token.

## 6. Components / file structure

Added to the existing repo:

```
api/discord/
  interactions.js          # webhook for slash commands + button (component) interactions
  cron-daily-stats.js      # endpoint invoked by GitHub Actions
  cron-sales-alerts.js     # endpoint invoked by GitHub Actions
  cron-reminders.js        # endpoint invoked by GitHub Actions
  _lib/                    # (underscore prefix = not a Vercel route)
    verify.js              # Ed25519 signature verification
    rest.js                # Discord REST helpers: postMessage, editMessage, deferred replies
    permissions.js         # mod-role gate
    embeds.js              # builds the stats / announcement / official-links embeds
    magiceden.js           # thin server-side ME fetch (or reuse api/magiceden logic)
    supabase.js            # state helpers (get/set cursor, message IDs, reminders)
    commands/
      announce.js
      links.js
      stats.js
      say.js
scripts/
  register-commands.js     # one-time: registers the 4 commands with Discord
.github/workflows/
  discord-cron.yml         # the free scheduler (3 cron jobs)
docs/superpowers/specs/
  2026-06-02-discord-bot-design.md   # this file
```

New dependencies (all free): a signature-verify lib (`tweetnacl` or
`discord-interactions`) and `@supabase/supabase-js`.

## 7. Slash commands

All commands are **gated to the configured mod role** (`DISCORD_MOD_ROLE_ID`) and
registered with `default_member_permissions` so non-mods do not see them. The
in-code role check is the authoritative gate.

| Command | Options | Behavior |
|---|---|---|
| `/announce` | `title` (string, req), `message` (string, req), `image` (string url, opt) | Replies with an **ephemeral preview embed + [Confirm] [Cancel]**. On Confirm, posts the embed to `ANNOUNCE_CHANNEL_ID`; preview updates to "✅ Posted". |
| `/links` | none (uses a maintained template) | Shows a **preview + [Confirm] [Cancel]**, then posts the official-links embed to `LINKS_CHANNEL_ID`. Stores the resulting message ID in Supabase; if an ID already exists, **edits that message** instead of reposting. |
| `/stats` | none | **Deferred reply**; fetches floor/volume/listed/holders from Magic Eden; posts a stats embed in the channel where it was invoked. |
| `/say` | `channel` (channel, req), `message` (string, req), `as_embed` (bool, opt) | **Ephemeral preview + [Confirm] [Cancel]**; on Confirm, sends the message/embed to the chosen channel. |

**Interaction routing** in `interactions.js`:
- Type `1` (PING) → respond pong (used for Discord endpoint validation).
- Type `2` (APPLICATION_COMMAND) → mod-gate, then dispatch to the command handler.
- Type `3` (MESSAGE_COMPONENT) → handle Confirm / Cancel buttons; the button
  `custom_id` carries which action to perform.

The official-links embed content is the verified set already agreed:
Website (`primos-site.vercel.app`), X (`x.com/PrimosNFT`), Telegram, Discord
(`discord.gg/XhCcZNfEVn`), Magic Eden (`magiceden.io/marketplace/primos`),
Tensor (`tensor.trade/trade/primos`). Maintained in `_lib/embeds.js`.

## 8. Scheduled jobs

Driven by `.github/workflows/discord-cron.yml`; each job hits its Vercel endpoint
with the `CRON_SECRET`.

| Job | Endpoint | Schedule (configurable) | Behavior |
|---|---|---|---|
| Daily stats | `cron-daily-stats.js` | once/day (e.g. `0 16 * * *` UTC) | Posts the daily floor/volume/listed/holders embed to `STATS_CHANNEL_ID`. |
| Sales alerts | `cron-sales-alerts.js` | every ~5 min (`*/5 * * * *`) | Fetches recent ME sale activities, filters to those newer than the stored cursor, posts each new sale embed to `SALES_CHANNEL_ID`, then advances the cursor. |
| Reminders | `cron-reminders.js` | hourly (`0 * * * *`) | Reads enabled reminders from Supabase, posts any that are due to their target channel, updates `last_sent_at`. |

## 9. State — Supabase

Two small tables (free tier):

```sql
-- generic key/value state
create table bot_state (
  key         text primary key,      -- e.g. 'sales_cursor', 'links_message_id'
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- scheduled reminders
create table bot_reminders (
  id            bigint generated always as identity primary key,
  channel_id    text not null,
  content       text not null,
  schedule      text not null,        -- human-readable cadence, e.g. 'daily 12:00'
  enabled       boolean not null default true,
  last_sent_at  timestamptz
);
```

- `sales_cursor` stores the last processed sale's `blockTime` (and last
  `signature` for tie-breaking) so alerts never repeat.
- `links_message_id` stores the official-links message ID so `/links` can edit
  rather than repost.
- The cursor is advanced **only after** a successful post.

For v1, reminders may be seeded directly in the table (a `/reminder` management
command is a possible later addition, not in scope now).

## 10. Security

- **Signature verification:** every interaction is verified with the Discord
  app's Ed25519 **public key** against the `X-Signature-Ed25519` /
  `X-Signature-Timestamp` headers and the **raw request body**. Invalid → `401`,
  no processing. The function must therefore read the raw body before any JSON
  parsing.
- **Mod-role gate:** the handler checks `interaction.member.roles` includes
  `DISCORD_MOD_ROLE_ID`; otherwise it returns an ephemeral "no permission"
  message and performs no action.
- **Cron protection:** `cron-*` endpoints require the `CRON_SECRET` (header or
  query); requests without it are rejected (`401`).
- **Secrets** (bot token, public key, Supabase service key, cron secret) live in
  **Vercel environment variables** and **GitHub Actions secrets** — never in the
  repo. The operator adds the bot token themselves.
- **Least privilege:** the bot is invited with only **Send Messages** and
  **Embed Links**. Editing its own messages (`/links`) needs no extra permission.
- **Preview → Confirm** on `/announce` and `/say` is the final guard against
  accidental public posts.

## 11. Error handling

- Magic Eden API error/timeout → commands reply with an ephemeral error; **cron
  jobs log and skip posting** (never post partial/garbage data).
- **Sales cursor advances only after a successful post**, preventing duplicates
  and missed sales.
- Data-fetching handlers use **deferred responses** (ack < 3s, then edit) so they
  never hit Discord's interaction timeout.
- Discord REST or Supabase failure → logged; cron retries on its next run.
- Unknown command / component `custom_id` → safe no-op with an ephemeral notice.

## 12. Testing

- **Unit:** signature verification (valid + invalid payloads); command routing
  for PING + each command type; mod-gate rejects a non-mod member.
- **Endpoint validation:** Discord's "Interactions Endpoint URL" PING must pass
  before commands are usable — first integration gate.
- **Manual:** post to a **private test channel** first, then switch to
  `#announcements`; trigger each `cron-*` endpoint via `curl` with the secret.

## 13. Configuration (environment variables)

| Variable | Where | Purpose |
|---|---|---|
| `DISCORD_BOT_TOKEN` | Vercel | Posting via REST. |
| `DISCORD_PUBLIC_KEY` | Vercel | Interaction signature verification. |
| `DISCORD_APP_ID` | Vercel + register script | App identity / command registration. |
| `DISCORD_GUILD_ID` | Vercel + register script | Primos server (`1277996118059253821`). |
| `DISCORD_MOD_ROLE_ID` | Vercel | Role allowed to run commands. |
| `ANNOUNCE_CHANNEL_ID` | Vercel | Target for `/announce`. |
| `LINKS_CHANNEL_ID` | Vercel | Target for `/links` (`#official-links`). |
| `STATS_CHANNEL_ID` | Vercel | Target for daily stats (may be set to the same channel as `#announcements`). |
| `SALES_CHANNEL_ID` | Vercel | Target for sales alerts. |
| `CRON_SECRET` | Vercel + GitHub secret | Protects cron endpoints. |
| `SUPABASE_URL` | Vercel | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Server-side Supabase access. |
| `VERCEL_BASE_URL` | GitHub secret | Base URL the Action calls (e.g. `https://primos-site.vercel.app`). |

## 14. Setup steps (free; operator-performed, guided)

1. **Discord Developer Portal:** create application → add Bot → copy **Bot
   Token, Public Key, Application ID**.
2. **Invite the bot** to the Primos server via an OAuth2 URL with scopes `bot` +
   `applications.commands` and permissions Send Messages + Embed Links.
3. **Add env vars** in Vercel (§13) and the cron secrets in GitHub.
4. **Deploy**, then set the **Interactions Endpoint URL** in the portal to
   `https://primos-site.vercel.app/api/discord/interactions`.
5. **Run `scripts/register-commands.js`** once to register the four commands.
6. **Create the Supabase tables** (§9) and seed any reminders.

## 15. Provided by the operator at build/deploy time

- The **mod/team role** (name or ID) for `DISCORD_MOD_ROLE_ID`.
- **Channel decisions:** daily-stats channel (dedicated or reuse
  `#announcements`?) and a **sales-alerts channel** (e.g. create `#sales`).
  `#announcements` and `#official-links` already exist.
- Creates the bot and adds all secrets to Vercel / GitHub (operator handles
  tokens directly; the build does not embed them).

## 16. Build order (high level — detailed plan to follow)

1. Discord REST + signature-verify helpers and the `interactions.js` skeleton (PING passes endpoint validation).
2. Mod-gate + `/stats` (read-only, simplest end-to-end command).
3. `/say` and `/announce` with the preview → confirm button flow.
4. Supabase state + `/links` (post then edit).
5. `cron-daily-stats` + GitHub Action.
6. `cron-sales-alerts` with the cursor.
7. `cron-reminders`.
