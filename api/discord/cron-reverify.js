import { loadConfig, assertVerifyConfig } from './_lib/config.js'
import { isCronAuthorized } from './_lib/cron-auth.js'
import { listVerifications, upsertVerification, deleteVerification } from './_lib/holders.js'
import { getState, setState } from './_lib/state.js'
import { countPrimos } from './_lib/helius.js'
import { getGuildMember, addGuildMemberRole, removeGuildMemberRole } from './_lib/rest.js'
import { recheckHolder } from './_lib/verify-core.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PACE_MS = 600 // ~1.6 req/s, under the Helius free-tier 2 DAS req/s cap
const BUDGET_MS = Number(process.env.REVERIFY_BUDGET_MS || 8000) // stay under the serverless limit

// Re-check linked wallets and reconcile tier roles. Cursor-based: each run handles
// a slice (ordered by discord id) within a time budget and saves its position, so
// a large holder list is covered across many runs without ever timing out. Sellers
// lose roles; members who left are dropped; idempotent for everyone unchanged.
export default async function handler(req, res) {
  const config = loadConfig()
  if (!isCronAuthorized(req.headers, config.CRON_SECRET)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    assertVerifyConfig(config)
    const all = (await listVerifications()).sort((a, b) =>
      a.discord_user_id < b.discord_user_id ? -1 : a.discord_user_id > b.discord_user_id ? 1 : 0)
    if (all.length === 0) return res.status(200).json({ ok: true, checked: 0 })

    const cursor = (await getState('reverify_cursor'))?.id || ''
    let start = all.findIndex((r) => r.discord_user_id > cursor)
    if (start < 0) start = 0 // cursor past the end → wrap to the beginning

    const deps = {
      config,
      countPrimos: (w) => countPrimos(w, { apiKey: config.HELIUS_API_KEY, collection: config.PRIMOS_COLLECTION_ADDRESS }),
      getGuildMember: (g, u) => getGuildMember(g, u, { token: config.BOT_TOKEN }),
      addGuildMemberRole: (g, u, r) => addGuildMemberRole(g, u, r, { token: config.BOT_TOKEN }),
      removeGuildMemberRole: (g, u, r) => removeGuildMemberRole(g, u, r, { token: config.BOT_TOKEN }),
      upsertVerification,
      deleteVerification,
    }

    const startedAt = Date.now()
    let checked = 0
    let changed = 0
    let dropped = 0
    let lastId = ''
    for (let i = start; i < all.length; i++) {
      if (Date.now() - startedAt > BUDGET_MS) break
      const record = all[i]
      try {
        const r = await recheckHolder({ record }, deps)
        if (r.left || r.tierKey === null) dropped++
        else if (r.added || (r.removed && r.removed.length)) changed++
      } catch (e) {
        console.error('reverify failed for', record.discord_user_id, e)
      }
      lastId = record.discord_user_id
      checked++
      await sleep(PACE_MS)
    }

    // Reached the end → reset cursor so the next run starts over.
    const reachedEnd = start + checked >= all.length
    await setState('reverify_cursor', { id: reachedEnd ? '' : lastId })

    return res.status(200).json({ ok: true, total: all.length, checked, changed, dropped, wrapped: reachedEnd })
  } catch (err) {
    console.error('reverify error', err)
    return res.status(500).json({ error: 'failed', detail: String(err) })
  }
}
