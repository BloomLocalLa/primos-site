# Primos Discord Bot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, serverless Discord bot for the Primos server with four mod-gated slash commands (`/announce`, `/links`, `/stats`, `/say`) and three scheduled posts (daily stats, sales alerts, reminders).

**Architecture:** Discord HTTP interactions hit a single Vercel function (`api/discord/interactions.js`) that verifies the signature, gates on a mod role, and dispatches to a pure, dependency-injected `handleInteraction` router. Scheduled work runs as GitHub Actions cron calling secret-protected Vercel endpoints. The bot posts via the Discord REST API and keeps a small amount of state (sales cursor, official-links message ID, reminders) in Supabase. All command/cron handlers do their work synchronously within one request and return immediately (Magic Eden calls are fast), so no background worker is needed.

**Tech Stack:** Node 18+ Vercel serverless functions (ES modules), `tweetnacl` (Ed25519 verify), `@supabase/supabase-js`, native `fetch`, `vitest` for tests, GitHub Actions for cron. Spec: `docs/superpowers/specs/2026-06-02-discord-bot-design.md`.

**Conventions used in this plan:**
- All new code is ES modules (`import`/`export`), matching `"type":"module"` in `package.json`.
- Pure logic takes its I/O dependencies as **injected parameters** (e.g. `fetchImpl`, `deps`) so it is unit-testable without network.
- Tests live next to the file as `*.test.js` and run under `vitest`.
- Commit after every task.

---

## Task 1: Project setup — test runner, deps, config module

**Files:**
- Modify: `package.json` (scripts + deps)
- Create: `api/discord/_lib/config.js`
- Create: `api/discord/_lib/config.test.js`

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install tweetnacl @supabase/supabase-js
npm install -D vitest
```
Expected: packages added; `package.json` updated.

- [ ] **Step 2: Add the test script**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Write the failing test for the config loader**

Create `api/discord/_lib/config.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { loadConfig } from './config.js'

describe('loadConfig', () => {
  it('reads values from the provided env object', () => {
    const cfg = loadConfig({
      DISCORD_BOT_TOKEN: 'tok', DISCORD_PUBLIC_KEY: 'pk', DISCORD_APP_ID: 'app',
      DISCORD_GUILD_ID: 'g', DISCORD_MOD_ROLE_ID: 'role',
      ANNOUNCE_CHANNEL_ID: 'a', LINKS_CHANNEL_ID: 'l', STATS_CHANNEL_ID: 's', SALES_CHANNEL_ID: 'sa',
      CRON_SECRET: 'secret', SUPABASE_URL: 'url', SUPABASE_SERVICE_ROLE_KEY: 'key',
    })
    expect(cfg.BOT_TOKEN).toBe('tok')
    expect(cfg.MOD_ROLE_ID).toBe('role')
    expect(cfg.COLLECTION_SYMBOL).toBe('primos')
  })

  it('throws if a required variable is missing', () => {
    expect(() => loadConfig({})).toThrow(/DISCORD_BOT_TOKEN/)
  })
})
```

- [ ] **Step 4: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/config.test.js`
Expected: FAIL ("loadConfig is not a function" / module not found).

- [ ] **Step 5: Implement the config loader**

Create `api/discord/_lib/config.js`:
```js
const REQUIRED = [
  'DISCORD_BOT_TOKEN', 'DISCORD_PUBLIC_KEY', 'DISCORD_APP_ID',
  'DISCORD_GUILD_ID', 'DISCORD_MOD_ROLE_ID',
  'ANNOUNCE_CHANNEL_ID', 'LINKS_CHANNEL_ID', 'STATS_CHANNEL_ID', 'SALES_CHANNEL_ID',
  'CRON_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
]

export function loadConfig(env = process.env) {
  for (const key of REQUIRED) {
    if (!env[key]) throw new Error(`Missing required environment variable: ${key}`)
  }
  return {
    BOT_TOKEN: env.DISCORD_BOT_TOKEN,
    PUBLIC_KEY: env.DISCORD_PUBLIC_KEY,
    APP_ID: env.DISCORD_APP_ID,
    GUILD_ID: env.DISCORD_GUILD_ID,
    MOD_ROLE_ID: env.DISCORD_MOD_ROLE_ID,
    ANNOUNCE_CHANNEL_ID: env.ANNOUNCE_CHANNEL_ID,
    LINKS_CHANNEL_ID: env.LINKS_CHANNEL_ID,
    STATS_CHANNEL_ID: env.STATS_CHANNEL_ID,
    SALES_CHANNEL_ID: env.SALES_CHANNEL_ID,
    CRON_SECRET: env.CRON_SECRET,
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    COLLECTION_SYMBOL: env.VITE_COLLECTION_SYMBOL || 'primos',
  }
}
```

- [ ] **Step 6: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/config.test.js`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json api/discord/_lib/config.js api/discord/_lib/config.test.js
git commit -m "feat(bot): add test runner, deps, and config loader"
```

---

## Task 2: Ed25519 signature verification

**Files:**
- Create: `api/discord/_lib/verify.js`
- Create: `api/discord/_lib/verify.test.js`

- [ ] **Step 1: Write the failing test (sign with a known key, then verify)**

Create `api/discord/_lib/verify.test.js`:
```js
import { describe, it, expect } from 'vitest'
import nacl from 'tweetnacl'
import { verifyDiscordSignature } from './verify.js'

function hex(uint8) {
  return Buffer.from(uint8).toString('hex')
}

describe('verifyDiscordSignature', () => {
  const pair = nacl.sign.keyPair()
  const publicKeyHex = hex(pair.publicKey)
  const timestamp = '1700000000'
  const body = JSON.stringify({ type: 1 })

  it('returns true for a valid signature', () => {
    const message = Buffer.from(timestamp + body)
    const sig = hex(nacl.sign.detached(message, pair.secretKey))
    expect(verifyDiscordSignature(body, sig, timestamp, publicKeyHex)).toBe(true)
  })

  it('returns false for a tampered body', () => {
    const message = Buffer.from(timestamp + body)
    const sig = hex(nacl.sign.detached(message, pair.secretKey))
    expect(verifyDiscordSignature('{"type":2}', sig, timestamp, publicKeyHex)).toBe(false)
  })

  it('returns false for missing signature/timestamp', () => {
    expect(verifyDiscordSignature(body, undefined, timestamp, publicKeyHex)).toBe(false)
    expect(verifyDiscordSignature(body, 'aa', undefined, publicKeyHex)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/verify.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the verifier**

Create `api/discord/_lib/verify.js`:
```js
import nacl from 'tweetnacl'

function hexToUint8(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

export function verifyDiscordSignature(rawBody, signature, timestamp, publicKeyHex) {
  if (!signature || !timestamp || !rawBody || !publicKeyHex) return false
  try {
    const message = new TextEncoder().encode(timestamp + rawBody)
    return nacl.sign.detached.verify(
      message,
      hexToUint8(signature),
      hexToUint8(publicKeyHex),
    )
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/verify.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/discord/_lib/verify.js api/discord/_lib/verify.test.js
git commit -m "feat(bot): add Ed25519 interaction signature verification"
```

---

## Task 3: Mod-role permission gate

**Files:**
- Create: `api/discord/_lib/permissions.js`
- Create: `api/discord/_lib/permissions.test.js`

- [ ] **Step 1: Write the failing test**

Create `api/discord/_lib/permissions.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { isAuthorized } from './permissions.js'

describe('isAuthorized', () => {
  it('is true when the member has the mod role', () => {
    expect(isAuthorized({ roles: ['111', '222'] }, '222')).toBe(true)
  })
  it('is false when the member lacks the mod role', () => {
    expect(isAuthorized({ roles: ['111'] }, '222')).toBe(false)
  })
  it('is false for missing member or roles', () => {
    expect(isAuthorized(undefined, '222')).toBe(false)
    expect(isAuthorized({}, '222')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/permissions.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement the gate**

Create `api/discord/_lib/permissions.js`:
```js
export function isAuthorized(member, modRoleId) {
  if (!member || !Array.isArray(member.roles)) return false
  return member.roles.includes(modRoleId)
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/permissions.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/discord/_lib/permissions.js api/discord/_lib/permissions.test.js
git commit -m "feat(bot): add mod-role permission gate"
```

---

## Task 4: Embed builders

**Files:**
- Create: `api/discord/_lib/embeds.js`
- Create: `api/discord/_lib/embeds.test.js`

- [ ] **Step 1: Write the failing test**

Create `api/discord/_lib/embeds.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { buildStatsEmbed, buildAnnounceEmbed, buildLinksEmbed, buildSaleEmbed } from './embeds.js'

describe('embeds', () => {
  it('buildStatsEmbed includes floor, listed, volume, holders', () => {
    const e = buildStatsEmbed({ floorSol: 0.022, listedCount: 120, volumeAllSol: 540.5, holders: 300 })
    const text = JSON.stringify(e)
    expect(text).toContain('0.022')
    expect(text).toContain('120')
    expect(text).toContain('540.5')
    expect(text).toContain('300')
  })

  it('buildAnnounceEmbed sets title, description, optional image', () => {
    const e = buildAnnounceEmbed({ title: 'Mint Live', message: 'Now!', image: 'https://x/y.png' })
    expect(e.title).toBe('Mint Live')
    expect(e.description).toBe('Now!')
    expect(e.image.url).toBe('https://x/y.png')
  })

  it('buildAnnounceEmbed omits image when not provided', () => {
    const e = buildAnnounceEmbed({ title: 'T', message: 'M' })
    expect(e.image).toBeUndefined()
  })

  it('buildLinksEmbed contains the verified official links', () => {
    const text = JSON.stringify(buildLinksEmbed())
    expect(text).toContain('primos-site.vercel.app')
    expect(text).toContain('discord.gg/XhCcZNfEVn')
    expect(text).toContain('magiceden.io/marketplace/primos')
    expect(text).toContain('tensor.trade/trade/primos')
    expect(text).toContain('x.com/PrimosNFT')
  })

  it('buildSaleEmbed shows price and links to the token', () => {
    const e = buildSaleEmbed({ priceSol: 0.05, tokenMint: 'MINT123', signature: 'SIG' })
    const text = JSON.stringify(e)
    expect(text).toContain('0.05')
    expect(text).toContain('MINT123')
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/embeds.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement the embed builders**

Create `api/discord/_lib/embeds.js`:
```js
const PRIMO_PINK = 0xe91e8c

export function buildStatsEmbed({ floorSol, listedCount, volumeAllSol, holders }) {
  return {
    title: 'PRIMOS — Collection Stats',
    color: PRIMO_PINK,
    fields: [
      { name: 'Floor', value: `${floorSol} SOL`, inline: true },
      { name: 'Listed', value: `${listedCount}`, inline: true },
      { name: 'Holders', value: `${holders}`, inline: true },
      { name: 'Total Volume', value: `${volumeAllSol} SOL`, inline: true },
    ],
    footer: { text: 'Source: Magic Eden' },
  }
}

export function buildAnnounceEmbed({ title, message, image }) {
  const embed = { title, description: message, color: PRIMO_PINK }
  if (image) embed.image = { url: image }
  return embed
}

export function buildLinksEmbed() {
  return {
    title: '🔗 PRIMOS — Official Links',
    color: PRIMO_PINK,
    description:
      'These are our ONLY official links. Never trust links posted by anyone else.\n\n' +
      '🌐 **Website:** https://primos-site.vercel.app/\n' +
      '𝕏 **Twitter/X:** https://x.com/PrimosNFT\n' +
      '✈️ **Telegram:** https://t.me/+WVTm5HcUKb8OMzYx\n' +
      '💬 **Discord:** https://discord.gg/XhCcZNfEVn\n\n' +
      '**Marketplaces**\n' +
      '🟣 Magic Eden: https://magiceden.io/marketplace/primos\n' +
      '⚡ Tensor: https://www.tensor.trade/trade/primos',
  }
}

export function buildSaleEmbed({ priceSol, tokenMint, signature }) {
  return {
    title: '💰 New Primos Sale',
    color: PRIMO_PINK,
    description: `Sold for **${priceSol} SOL**`,
    url: `https://magiceden.io/item-details/${tokenMint}`,
    fields: [{ name: 'Mint', value: tokenMint }],
    footer: { text: signature ? `tx ${signature.slice(0, 8)}…` : 'Magic Eden' },
  }
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/embeds.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add api/discord/_lib/embeds.js api/discord/_lib/embeds.test.js
git commit -m "feat(bot): add embed builders for stats/announce/links/sale"
```

---

## Task 5: Magic Eden data helpers (server-side)

**Files:**
- Create: `api/discord/_lib/magiceden.js`
- Create: `api/discord/_lib/magiceden.test.js`

- [ ] **Step 1: Write the failing test (inject a fake fetch)**

Create `api/discord/_lib/magiceden.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'
import { lamportsToSol, getCollectionStats, getRecentSales } from './magiceden.js'

const okJson = (data) => ({ ok: true, json: async () => data })

describe('magiceden helpers', () => {
  it('lamportsToSol converts and rounds', () => {
    expect(lamportsToSol(1_000_000_000)).toBe(1)
    expect(lamportsToSol(22_000_000)).toBeCloseTo(0.022)
  })

  it('getCollectionStats maps ME stats to SOL', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({
      floorPrice: 22_000_000, listedCount: 120, volumeAll: 540_000_000_000,
    }))
    const stats = await getCollectionStats('primos', fetchImpl)
    expect(stats.floorSol).toBeCloseTo(0.022)
    expect(stats.listedCount).toBe(120)
    expect(stats.volumeAllSol).toBeCloseTo(540)
  })

  it('getRecentSales returns only buyNow newer than the cursor, ascending', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson([
      { type: 'buyNow', signature: 'b', price: 0.05, tokenMint: 'M2', blockTime: 200 },
      { type: 'list',   signature: 'x', price: 0.04, tokenMint: 'M3', blockTime: 150 },
      { type: 'buyNow', signature: 'a', price: 0.03, tokenMint: 'M1', blockTime: 100 },
    ]))
    const sales = await getRecentSales('primos', 100, fetchImpl)
    expect(sales.map((s) => s.signature)).toEqual(['b'])
    expect(sales[0].priceSol).toBeCloseTo(0.05)
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/magiceden.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement the ME helpers**

Create `api/discord/_lib/magiceden.js`:
```js
const ME_BASE = 'https://api-mainnet.magiceden.dev/v2'

export function lamportsToSol(lamports) {
  return Math.round((lamports / 1e9) * 1000) / 1000
}

export async function getCollectionStats(symbol, fetchImpl = fetch) {
  const res = await fetchImpl(`${ME_BASE}/collections/${symbol}/stats`)
  if (!res.ok) throw new Error(`ME stats failed: ${res.status}`)
  const d = await res.json()
  return {
    floorSol: lamportsToSol(d.floorPrice || 0),
    listedCount: d.listedCount || 0,
    volumeAllSol: lamportsToSol(d.volumeAll || 0),
  }
}

export async function getHolderCount(symbol, fetchImpl = fetch) {
  const res = await fetchImpl(`${ME_BASE}/collections/${symbol}/holder_stats`)
  if (!res.ok) throw new Error(`ME holder_stats failed: ${res.status}`)
  const d = await res.json()
  return d.uniqueHolders || d.totalSupply || 0
}

// Returns sales (buyNow) strictly newer than sinceBlockTime, oldest first.
export async function getRecentSales(symbol, sinceBlockTime, fetchImpl = fetch) {
  const res = await fetchImpl(`${ME_BASE}/collections/${symbol}/activities?offset=0&limit=100`)
  if (!res.ok) throw new Error(`ME activities failed: ${res.status}`)
  const activities = await res.json()
  return activities
    .filter((a) => a.type === 'buyNow' && (a.blockTime || 0) > (sinceBlockTime || 0))
    .map((a) => ({
      signature: a.signature,
      priceSol: a.price,
      tokenMint: a.tokenMint,
      blockTime: a.blockTime,
    }))
    .sort((a, b) => a.blockTime - b.blockTime)
}
```

> **Note on `price` units:** Magic Eden's `activities` endpoint returns `price`
> already in SOL (not lamports); the `stats` endpoint returns lamports. The code
> above reflects that — do not convert `a.price`.

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/magiceden.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/discord/_lib/magiceden.js api/discord/_lib/magiceden.test.js
git commit -m "feat(bot): add server-side Magic Eden stats/sales helpers"
```

---

## Task 6: Discord REST helpers

**Files:**
- Create: `api/discord/_lib/rest.js`
- Create: `api/discord/_lib/rest.test.js`

- [ ] **Step 1: Write the failing test (inject a fake fetch)**

Create `api/discord/_lib/rest.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'
import { postMessage, editMessage } from './rest.js'

describe('discord rest', () => {
  it('postMessage POSTs to the channel with bot auth and JSON body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'm1' }) })
    const out = await postMessage('chan1', { content: 'hi' }, { token: 'tok', fetchImpl })
    expect(out.id).toBe('m1')
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('/channels/chan1/messages')
    expect(opts.method).toBe('POST')
    expect(opts.headers.Authorization).toBe('Bot tok')
    expect(JSON.parse(opts.body)).toEqual({ content: 'hi' })
  })

  it('editMessage PATCHes the specific message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'm1' }) })
    await editMessage('chan1', 'm1', { content: 'edited' }, { token: 'tok', fetchImpl })
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('/channels/chan1/messages/m1')
    expect(opts.method).toBe('PATCH')
  })

  it('throws on non-ok response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => 'no' })
    await expect(postMessage('c', {}, { token: 't', fetchImpl })).rejects.toThrow(/403/)
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/rest.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement the REST helpers**

Create `api/discord/_lib/rest.js`:
```js
const DISCORD_API = 'https://discord.com/api/v10'

async function discordFetch(path, { method, token, body, fetchImpl = fetch }) {
  const res = await fetchImpl(`${DISCORD_API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Discord ${method} ${path} failed: ${res.status} ${detail}`)
  }
  return res.json()
}

export function postMessage(channelId, payload, { token, fetchImpl } = {}) {
  return discordFetch(`/channels/${channelId}/messages`, { method: 'POST', token, body: payload, fetchImpl })
}

export function editMessage(channelId, messageId, payload, { token, fetchImpl } = {}) {
  return discordFetch(`/channels/${channelId}/messages/${messageId}`, { method: 'PATCH', token, body: payload, fetchImpl })
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/rest.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/discord/_lib/rest.js api/discord/_lib/rest.test.js
git commit -m "feat(bot): add Discord REST post/edit helpers"
```

---

## Task 7: Supabase state helpers

**Files:**
- Create: `api/discord/_lib/state.js`
- Create: `api/discord/_lib/state.test.js`
- Create: `supabase/migrations/` table via the Supabase MCP (see Step 6)

- [ ] **Step 1: Write the failing test (inject a fake client)**

Create `api/discord/_lib/state.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'
import { getState, setState } from './state.js'

function fakeClient(row) {
  return {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }
}

describe('state helpers', () => {
  it('getState returns the stored value for a key', async () => {
    const client = fakeClient({ key: 'sales_cursor', value: { blockTime: 123 } })
    expect(await getState('sales_cursor', client)).toEqual({ blockTime: 123 })
  })

  it('getState returns null when no row exists', async () => {
    const client = fakeClient(null)
    expect(await getState('missing', client)).toBeNull()
  })

  it('setState upserts the key/value', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    const client = { from: () => ({ upsert }) }
    await setState('links_message_id', { id: 'm1' }, client)
    expect(upsert).toHaveBeenCalledWith(
      { key: 'links_message_id', value: { id: 'm1' } },
      { onConflict: 'key' },
    )
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/state.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement the state helpers**

Create `api/discord/_lib/state.js`:
```js
import { createClient } from '@supabase/supabase-js'

let _default = null
function defaultClient() {
  if (!_default) {
    _default = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
  return _default
}

export async function getState(key, client = defaultClient()) {
  const { data, error } = await client
    .from('bot_state').select('value').eq('key', key).maybeSingle()
  if (error) throw new Error(`getState ${key}: ${error.message}`)
  return data ? data.value : null
}

export async function setState(key, value, client = defaultClient()) {
  const { error } = await client
    .from('bot_state').upsert({ key, value }, { onConflict: 'key' })
  if (error) throw new Error(`setState ${key}: ${error.message}`)
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/state.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/discord/_lib/state.js api/discord/_lib/state.test.js
git commit -m "feat(bot): add Supabase bot_state helpers"
```

- [ ] **Step 6: Create the Supabase tables (run via Supabase MCP `apply_migration`)**

Apply this migration (named `bot_tables`):
```sql
create table if not exists bot_state (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists bot_reminders (
  id            bigint generated always as identity primary key,
  channel_id    text not null,
  content       text not null,
  schedule      text not null,
  enabled       boolean not null default true,
  last_sent_at  timestamptz
);
```
Expected: both tables created. (No commit needed — managed in Supabase.)

---

## Task 8: Interaction router (the core dispatch logic)

**Files:**
- Create: `api/discord/_lib/router.js`
- Create: `api/discord/_lib/router.test.js`

This is the heart of the bot: a pure async function that takes an interaction
and an injected `deps` object and returns the Discord response JSON. It performs
side effects (posting) only through `deps`, so it is fully unit-testable.

- [ ] **Step 1: Write the failing test**

Create `api/discord/_lib/router.test.js`:
```js
import { describe, it, expect, vi } from 'vitest'
import { handleInteraction } from './router.js'

const CFG = {
  MOD_ROLE_ID: 'mod', ANNOUNCE_CHANNEL_ID: 'ann',
  LINKS_CHANNEL_ID: 'links', STATS_CHANNEL_ID: 'stats',
  SALES_CHANNEL_ID: 'sales', COLLECTION_SYMBOL: 'primos',
}
function baseDeps(over = {}) {
  return {
    config: CFG,
    postMessage: vi.fn().mockResolvedValue({ id: 'newmsg' }),
    editMessage: vi.fn().mockResolvedValue({ id: 'm1' }),
    getCollectionStats: vi.fn().mockResolvedValue({ floorSol: 0.02, listedCount: 10, volumeAllSol: 5 }),
    getHolderCount: vi.fn().mockResolvedValue(300),
    getState: vi.fn().mockResolvedValue(null),
    setState: vi.fn().mockResolvedValue(undefined),
    ...over,
  }
}
const mod = { roles: ['mod'] }
const nonMod = { roles: ['other'] }

describe('handleInteraction', () => {
  it('responds to PING with type 1', async () => {
    const r = await handleInteraction({ type: 1 }, baseDeps())
    expect(r).toEqual({ type: 1 })
  })

  it('rejects a command from a non-mod (ephemeral)', async () => {
    const r = await handleInteraction(
      { type: 2, member: nonMod, data: { name: 'stats' } }, baseDeps())
    expect(r.data.flags).toBe(64)
    expect(r.data.content).toMatch(/permission/i)
  })

  it('/stats fetches and returns a stats embed directly', async () => {
    const deps = baseDeps()
    const r = await handleInteraction({ type: 2, member: mod, data: { name: 'stats' } }, deps)
    expect(deps.getCollectionStats).toHaveBeenCalled()
    expect(r.type).toBe(4)
    expect(JSON.stringify(r.data.embeds[0])).toContain('0.02')
  })

  it('/announce returns an ephemeral preview with confirm/cancel buttons', async () => {
    const r = await handleInteraction({
      type: 2, member: mod,
      data: { name: 'announce', options: [
        { name: 'title', value: 'T' }, { name: 'message', value: 'M' }] },
    }, baseDeps())
    expect(r.type).toBe(4)
    expect(r.data.flags).toBe(64)
    expect(r.data.embeds[0].title).toBe('T')
    const btns = r.data.components[0].components
    expect(btns.map((b) => b.custom_id)).toEqual(['confirm:announce', 'cancel'])
  })

  it('confirm:announce posts the preview embed to the announce channel', async () => {
    const deps = baseDeps()
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:announce' },
      message: { embeds: [{ title: 'T', description: 'M' }] },
    }
    const r = await handleInteraction(interaction, deps)
    expect(deps.postMessage).toHaveBeenCalledWith('ann', { embeds: [{ title: 'T', description: 'M' }] })
    expect(r.type).toBe(7)
    expect(r.data.content).toMatch(/posted/i)
  })

  it('cancel clears the preview', async () => {
    const r = await handleInteraction(
      { type: 3, member: mod, data: { custom_id: 'cancel' } }, baseDeps())
    expect(r.type).toBe(7)
    expect(r.data.content).toMatch(/cancel/i)
  })

  it('confirm:links posts a new message and stores its id when none exists', async () => {
    const deps = baseDeps()
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:links' },
      message: { embeds: [{ title: 'Links' }] },
    }
    await handleInteraction(interaction, deps)
    expect(deps.postMessage).toHaveBeenCalledWith('links', { embeds: [{ title: 'Links' }] })
    expect(deps.setState).toHaveBeenCalledWith('links_message_id', { id: 'newmsg' })
  })

  it('confirm:links edits the existing message when an id is stored', async () => {
    const deps = baseDeps({ getState: vi.fn().mockResolvedValue({ id: 'old' }) })
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:links' },
      message: { embeds: [{ title: 'Links' }] },
    }
    await handleInteraction(interaction, deps)
    expect(deps.editMessage).toHaveBeenCalledWith('links', 'old', { embeds: [{ title: 'Links' }] })
  })

  it('confirm:say:CHAN:text posts the embed description as plain content', async () => {
    const deps = baseDeps()
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:say:chanX:text' },
      message: { embeds: [{ description: 'hello there' }] },
    }
    await handleInteraction(interaction, deps)
    expect(deps.postMessage).toHaveBeenCalledWith('chanX', { content: 'hello there' })
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/router.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement the router**

Create `api/discord/_lib/router.js`:
```js
import { isAuthorized } from './permissions.js'
import { buildStatsEmbed, buildAnnounceEmbed, buildLinksEmbed } from './embeds.js'

const EPHEMERAL = 64

function ephemeral(content) {
  return { type: 4, data: { flags: EPHEMERAL, content } }
}

function optionValue(data, name) {
  const opt = (data.options || []).find((o) => o.name === name)
  return opt ? opt.value : undefined
}

function confirmButtons(confirmId) {
  return [{
    type: 1,
    components: [
      { type: 2, style: 3, label: 'Confirm', custom_id: confirmId },
      { type: 2, style: 4, label: 'Cancel', custom_id: 'cancel' },
    ],
  }]
}

function previewWith(embed, confirmId, note) {
  return { type: 4, data: { flags: EPHEMERAL, content: note, embeds: [embed], components: confirmButtons(confirmId) } }
}

async function handleCommand(interaction, deps) {
  const { config } = deps
  if (!isAuthorized(interaction.member, config.MOD_ROLE_ID)) {
    return ephemeral('🚫 You do not have permission to use this command.')
  }
  const data = interaction.data
  switch (data.name) {
    case 'stats': {
      const stats = await deps.getCollectionStats(config.COLLECTION_SYMBOL)
      const holders = await deps.getHolderCount(config.COLLECTION_SYMBOL)
      return { type: 4, data: { embeds: [buildStatsEmbed({ ...stats, holders })] } }
    }
    case 'announce': {
      const embed = buildAnnounceEmbed({
        title: optionValue(data, 'title'),
        message: optionValue(data, 'message'),
        image: optionValue(data, 'image'),
      })
      return previewWith(embed, 'confirm:announce', 'Preview — Confirm to post to #announcements:')
    }
    case 'links': {
      return previewWith(buildLinksEmbed(), 'confirm:links', 'Preview — Confirm to publish/refresh #official-links:')
    }
    case 'say': {
      const channelId = optionValue(data, 'channel')
      const message = optionValue(data, 'message')
      const asEmbed = optionValue(data, 'as_embed') === true
      const embed = { description: message, color: 0xe91e8c }
      const confirmId = `confirm:say:${channelId}:${asEmbed ? 'embed' : 'text'}`
      return previewWith(embed, confirmId, `Preview — Confirm to send to <#${channelId}>:`)
    }
    default:
      return ephemeral('Unknown command.')
  }
}

async function handleComponent(interaction, deps) {
  const { config } = deps
  if (!isAuthorized(interaction.member, config.MOD_ROLE_ID)) {
    return ephemeral('🚫 You do not have permission.')
  }
  const customId = interaction.data.custom_id
  const previewEmbed = interaction.message?.embeds?.[0]

  if (customId === 'cancel') {
    return { type: 7, data: { content: '❌ Cancelled.', embeds: [], components: [] } }
  }
  if (customId === 'confirm:announce') {
    await deps.postMessage(config.ANNOUNCE_CHANNEL_ID, { embeds: [previewEmbed] })
    return { type: 7, data: { content: '✅ Posted to announcements.', embeds: [], components: [] } }
  }
  if (customId === 'confirm:links') {
    const stored = await deps.getState('links_message_id')
    if (stored && stored.id) {
      try {
        await deps.editMessage(config.LINKS_CHANNEL_ID, stored.id, { embeds: [previewEmbed] })
        return { type: 7, data: { content: '✅ Official links updated.', embeds: [], components: [] } }
      } catch {
        // stored message was deleted — fall through to repost
      }
    }
    const posted = await deps.postMessage(config.LINKS_CHANNEL_ID, { embeds: [previewEmbed] })
    await deps.setState('links_message_id', { id: posted.id })
    return { type: 7, data: { content: '✅ Official links posted.', embeds: [], components: [] } }
  }
  if (customId.startsWith('confirm:say:')) {
    const [, , channelId, mode] = customId.split(':')
    const payload = mode === 'text' ? { content: previewEmbed.description } : { embeds: [previewEmbed] }
    await deps.postMessage(channelId, payload)
    return { type: 7, data: { content: '✅ Sent.', embeds: [], components: [] } }
  }
  return ephemeral('Unknown action.')
}

export async function handleInteraction(interaction, deps) {
  if (interaction.type === 1) return { type: 1 }
  if (interaction.type === 2) return handleCommand(interaction, deps)
  if (interaction.type === 3) return handleComponent(interaction, deps)
  return ephemeral('Unsupported interaction.')
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/router.test.js`
Expected: PASS (9 tests).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add api/discord/_lib/router.js api/discord/_lib/router.test.js
git commit -m "feat(bot): add interaction router with command + button handling"
```

---

## Task 9: The interactions endpoint (Vercel handler wiring)

**Files:**
- Create: `api/discord/interactions.js`

This wires the verified raw body + router + real side effects. The handler must
read the **raw** request body for signature verification (the proven Vercel
pattern, same as Stripe webhooks): read the stream and never touch `req.body`.

- [ ] **Step 1: Write the handler**

Create `api/discord/interactions.js`:
```js
import { loadConfig } from './_lib/config.js'
import { verifyDiscordSignature } from './_lib/verify.js'
import { handleInteraction } from './_lib/router.js'
import { postMessage, editMessage } from './_lib/rest.js'
import { getCollectionStats, getHolderCount } from './_lib/magiceden.js'
import { getState, setState } from './_lib/state.js'

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const config = loadConfig()
  const raw = await readRawBody(req)
  const signature = req.headers['x-signature-ed25519']
  const timestamp = req.headers['x-signature-timestamp']

  if (!verifyDiscordSignature(raw, signature, timestamp, config.PUBLIC_KEY)) {
    return res.status(401).send('invalid request signature')
  }

  const interaction = JSON.parse(raw)
  const deps = {
    config,
    postMessage: (channelId, payload) => postMessage(channelId, payload, { token: config.BOT_TOKEN }),
    editMessage: (channelId, messageId, payload) => editMessage(channelId, messageId, payload, { token: config.BOT_TOKEN }),
    getCollectionStats,
    getHolderCount,
    getState,
    setState,
  }

  try {
    const response = await handleInteraction(interaction, deps)
    return res.status(200).json(response)
  } catch (err) {
    console.error('interaction error', err)
    return res.status(200).json({ type: 4, data: { flags: 64, content: '⚠️ Something went wrong handling that.' } })
  }
}
```

- [ ] **Step 2: Verify the build still succeeds**

Run: `npm run build`
Expected: exit 0 (the new `api/` files don't affect the client build, but this confirms nothing broke).

- [ ] **Step 3: Commit**

```bash
git add api/discord/interactions.js
git commit -m "feat(bot): add Discord interactions endpoint"
```

> **Manual integration gate (after deploy + env vars set):** In the Discord
> Developer Portal, set the Interactions Endpoint URL to
> `https://primos-site.vercel.app/api/discord/interactions`. Saving it triggers
> Discord's PING; it must succeed (proves raw-body + signature verification work).
> If it fails with a signature error, the body is being pre-parsed — confirm the
> handler reads the stream and does not reference `req.body`.

---

## Task 10: Slash command registration script

**Files:**
- Create: `scripts/register-commands.js`

- [ ] **Step 1: Write the registration script**

Create `scripts/register-commands.js`:
```js
// Run once (or after changing commands): node scripts/register-commands.js
// Requires env: DISCORD_BOT_TOKEN, DISCORD_APP_ID, DISCORD_GUILD_ID
const TOKEN = process.env.DISCORD_BOT_TOKEN
const APP_ID = process.env.DISCORD_APP_ID
const GUILD_ID = process.env.DISCORD_GUILD_ID

// default_member_permissions "0" hides commands from everyone except admins by
// default; the authoritative gate is the in-code mod-role check.
const commands = [
  {
    name: 'announce', description: 'Post a formatted announcement', default_member_permissions: '0',
    options: [
      { name: 'title', description: 'Announcement title', type: 3, required: true },
      { name: 'message', description: 'Announcement body', type: 3, required: true },
      { name: 'image', description: 'Optional image URL', type: 3, required: false },
    ],
  },
  { name: 'links', description: 'Publish or refresh the official links', default_member_permissions: '0' },
  { name: 'stats', description: 'Post current collection stats', default_member_permissions: '0' },
  {
    name: 'say', description: 'Send a custom message to a channel', default_member_permissions: '0',
    options: [
      { name: 'channel', description: 'Target channel', type: 7, required: true },
      { name: 'message', description: 'Message text', type: 3, required: true },
      { name: 'as_embed', description: 'Send as an embed?', type: 5, required: false },
    ],
  },
]

const res = await fetch(
  `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: 'PUT',
    headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  },
)
if (!res.ok) {
  console.error('Failed:', res.status, await res.text())
  process.exit(1)
}
console.log('Registered', (await res.json()).length, 'commands')
```

- [ ] **Step 2: Commit**

```bash
git add scripts/register-commands.js
git commit -m "feat(bot): add guild slash-command registration script"
```

> **Manual step (after env vars exist locally or via a one-off):** run
> `node scripts/register-commands.js` once. Guild commands appear immediately.

---

## Task 11: Cron — daily stats

**Files:**
- Create: `api/discord/_lib/cron-auth.js`
- Create: `api/discord/_lib/cron-auth.test.js`
- Create: `api/discord/cron-daily-stats.js`

- [ ] **Step 1: Write the failing test for the cron auth guard**

Create `api/discord/_lib/cron-auth.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { isCronAuthorized } from './cron-auth.js'

describe('isCronAuthorized', () => {
  it('accepts a matching bearer token', () => {
    expect(isCronAuthorized({ authorization: 'Bearer s3cret' }, 's3cret')).toBe(true)
  })
  it('accepts a matching secret query param', () => {
    expect(isCronAuthorized({}, 's3cret', { secret: 's3cret' })).toBe(true)
  })
  it('rejects a wrong/missing secret', () => {
    expect(isCronAuthorized({ authorization: 'Bearer nope' }, 's3cret')).toBe(false)
    expect(isCronAuthorized({}, 's3cret', {})).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run api/discord/_lib/cron-auth.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement the cron guard**

Create `api/discord/_lib/cron-auth.js`:
```js
export function isCronAuthorized(headers = {}, secret, query = {}) {
  const bearer = (headers.authorization || '').replace(/^Bearer\s+/i, '')
  return Boolean(secret) && (bearer === secret || query.secret === secret)
}
```

- [ ] **Step 4: Run the test, verify it passes**

Run: `npx vitest run api/discord/_lib/cron-auth.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the daily-stats endpoint**

Create `api/discord/cron-daily-stats.js`:
```js
import { loadConfig } from './_lib/config.js'
import { isCronAuthorized } from './_lib/cron-auth.js'
import { getCollectionStats, getHolderCount } from './_lib/magiceden.js'
import { buildStatsEmbed } from './_lib/embeds.js'
import { postMessage } from './_lib/rest.js'

export default async function handler(req, res) {
  const config = loadConfig()
  if (!isCronAuthorized(req.headers, config.CRON_SECRET, req.query)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    const stats = await getCollectionStats(config.COLLECTION_SYMBOL)
    const holders = await getHolderCount(config.COLLECTION_SYMBOL)
    await postMessage(config.STATS_CHANNEL_ID, { embeds: [buildStatsEmbed({ ...stats, holders })] }, { token: config.BOT_TOKEN })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('daily-stats error', err)
    return res.status(500).json({ error: 'failed', detail: String(err) })
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add api/discord/_lib/cron-auth.js api/discord/_lib/cron-auth.test.js api/discord/cron-daily-stats.js
git commit -m "feat(bot): add cron auth guard and daily-stats endpoint"
```

---

## Task 12: Cron — sales alerts (with cursor)

**Files:**
- Create: `api/discord/cron-sales-alerts.js`

The new-sale filtering and cursor advancement logic is already unit-tested in
`magiceden.test.js` (`getRecentSales` returns only sales newer than the cursor,
ascending). This task wires it to the cursor in Supabase.

- [ ] **Step 1: Implement the sales-alerts endpoint**

Create `api/discord/cron-sales-alerts.js`:
```js
import { loadConfig } from './_lib/config.js'
import { isCronAuthorized } from './_lib/cron-auth.js'
import { getRecentSales } from './_lib/magiceden.js'
import { buildSaleEmbed } from './_lib/embeds.js'
import { postMessage } from './_lib/rest.js'
import { getState, setState } from './_lib/state.js'

export default async function handler(req, res) {
  const config = loadConfig()
  if (!isCronAuthorized(req.headers, config.CRON_SECRET, req.query)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    const cursor = await getState('sales_cursor')
    const since = cursor?.blockTime || Math.floor(Date.now() / 1000) - 600 // first run: last 10 min
    const sales = await getRecentSales(config.COLLECTION_SYMBOL, since)

    for (const sale of sales) {
      await postMessage(config.SALES_CHANNEL_ID, { embeds: [buildSaleEmbed(sale)] }, { token: config.BOT_TOKEN })
      // advance the cursor after each successful post so a mid-batch failure resumes correctly
      await setState('sales_cursor', { blockTime: sale.blockTime, signature: sale.signature })
    }
    return res.status(200).json({ ok: true, posted: sales.length })
  } catch (err) {
    console.error('sales-alerts error', err)
    return res.status(500).json({ error: 'failed', detail: String(err) })
  }
}
```

> **Note:** `Date.now()` here is fine — these are serverless endpoints, not the
> workflow scripts that prohibit it. The first run seeds the cursor to "now − 10
> min" so it doesn't spam historical sales.

- [ ] **Step 2: Verify the build still succeeds**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add api/discord/cron-sales-alerts.js
git commit -m "feat(bot): add sales-alerts cron endpoint with Supabase cursor"
```

---

## Task 13: Cron — reminders

**Files:**
- Create: `api/discord/cron-reminders.js`

- [ ] **Step 1: Implement the reminders endpoint**

Create `api/discord/cron-reminders.js`:
```js
import { loadConfig } from './_lib/config.js'
import { isCronAuthorized } from './_lib/cron-auth.js'
import { postMessage } from './_lib/rest.js'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const config = loadConfig()
  if (!isCronAuthorized(req.headers, config.CRON_SECRET, req.query)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
    const { data: reminders, error } = await supabase
      .from('bot_reminders').select('*').eq('enabled', true)
    if (error) throw new Error(error.message)

    const nowMs = Date.now()
    let posted = 0
    for (const r of reminders || []) {
      if (isDue(r, nowMs)) {
        await postMessage(r.channel_id, { content: r.content }, { token: config.BOT_TOKEN })
        await supabase.from('bot_reminders').update({ last_sent_at: new Date(nowMs).toISOString() }).eq('id', r.id)
        posted++
      }
    }
    return res.status(200).json({ ok: true, posted })
  } catch (err) {
    console.error('reminders error', err)
    return res.status(500).json({ error: 'failed', detail: String(err) })
  }
}

// v1 cadence: 'daily' reminders fire if they haven't been sent in the last ~23h.
function isDue(reminder, nowMs) {
  if (reminder.schedule !== 'daily') return false
  if (!reminder.last_sent_at) return true
  const last = new Date(reminder.last_sent_at).getTime()
  return nowMs - last >= 23 * 60 * 60 * 1000
}
```

> **v1 scope:** only `schedule: 'daily'` is supported (the most common case).
> Richer schedules are a later addition; rows with other `schedule` values are
> simply skipped.

- [ ] **Step 2: Commit**

```bash
git add api/discord/cron-reminders.js
git commit -m "feat(bot): add reminders cron endpoint"
```

---

## Task 14: GitHub Actions scheduler

**Files:**
- Create: `.github/workflows/discord-cron.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/discord-cron.yml`:
```yaml
name: Discord bot cron

on:
  schedule:
    - cron: '*/5 * * * *'   # sales alerts (every 5 min)
    - cron: '0 16 * * *'    # daily stats (16:00 UTC)
    - cron: '0 * * * *'     # reminders (hourly)
  workflow_dispatch: {}

jobs:
  sales:
    if: github.event.schedule == '*/5 * * * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.VERCEL_BASE_URL }}/api/discord/cron-sales-alerts"

  daily-stats:
    if: github.event.schedule == '0 16 * * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.VERCEL_BASE_URL }}/api/discord/cron-daily-stats"

  reminders:
    if: github.event.schedule == '0 * * * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.VERCEL_BASE_URL }}/api/discord/cron-reminders"
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/discord-cron.yml
git commit -m "feat(bot): add GitHub Actions cron scheduler"
```

> **Manual step:** add repo secrets `CRON_SECRET` and `VERCEL_BASE_URL`
> (`https://primos-site.vercel.app`) under GitHub → Settings → Secrets → Actions.

---

## Task 15: Operator setup guide + env example

**Files:**
- Create: `api/discord/README.md`
- Modify: `.env.example`

- [ ] **Step 1: Add the bot env vars to `.env.example`**

Append to `.env.example`:
```bash

# --- Discord bot (server-side; set in Vercel, NOT prefixed with VITE_) ---
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_app_public_key
DISCORD_APP_ID=your_application_id
DISCORD_GUILD_ID=1277996118059253821
DISCORD_MOD_ROLE_ID=your_mod_role_id
ANNOUNCE_CHANNEL_ID=channel_id
LINKS_CHANNEL_ID=channel_id
STATS_CHANNEL_ID=channel_id
SALES_CHANNEL_ID=channel_id
CRON_SECRET=long_random_string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- [ ] **Step 2: Write the operator setup guide**

Create `api/discord/README.md` documenting, in order: create the Discord app +
bot; copy token/public key/app id; invite URL (scopes `bot applications.commands`,
perms Send Messages + Embed Links); add all env vars in Vercel; run the Supabase
migration (Task 7 Step 6); deploy; set the Interactions Endpoint URL; run
`node scripts/register-commands.js`; add GitHub secrets `CRON_SECRET` +
`VERCEL_BASE_URL`. Include the channel/role IDs the operator must gather (right-click
→ Copy ID with Developer Mode on).

- [ ] **Step 3: Run the full test suite and build**

Run: `npm test && npm run build`
Expected: all tests pass, build exit 0.

- [ ] **Step 4: Commit**

```bash
git add api/discord/README.md .env.example
git commit -m "docs(bot): add operator setup guide and env example"
```

---

## Final verification

- [ ] `npm test` — all unit tests pass.
- [ ] `npm run build` — exit 0.
- [ ] After deploy + env vars + command registration: Discord endpoint validation PING succeeds.
- [ ] Manual smoke test in a private channel: `/stats`, `/announce` (Confirm), `/links` (Confirm, then run again → edits), `/say` (Confirm).
- [ ] Trigger each cron via `workflow_dispatch` and confirm posts land in the right channels.

## Spec coverage map

- Slash commands `/announce` `/links` `/stats` `/say` → Tasks 8–10.
- Preview→confirm on public posts → Task 8 (router) + Task 9.
- Mod-role gate → Task 3 + router.
- Daily stats / sales alerts / reminders → Tasks 11–14.
- Supabase state (cursor, links message id, reminders) → Task 7 + Tasks 12–13.
- Signature verification + raw body → Task 2 + Task 9.
- Cron secret protection → Task 11 (`cron-auth`) used by 11–13.
- Setup steps + env vars → Task 15.
