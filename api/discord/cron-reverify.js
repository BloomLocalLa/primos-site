import { loadConfig, assertVerifyConfig } from './_lib/config.js'
import { isCronAuthorized } from './_lib/cron-auth.js'
import { listVerifications, upsertVerification, deleteWallet, deleteForUser } from './_lib/holders.js'
import { getState, setState } from './_lib/state.js'
import { countPrimos } from './_lib/helius.js'
import { getGuildMember, addGuildMemberRole, removeGuildMemberRole } from './_lib/rest.js'
import { recheckUser } from './_lib/verify-core.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PACE_MS = 600 // ~1.6 Helius DAS req/s, under the free-tier 2 req/s cap
const BUDGET_MS = Number(process.env.REVERIFY_BUDGET_MS || 8000) // stay under the serverless limit

// Re-check linked wallets and reconcile each MEMBER's tier from the sum across
// their wallets. Cursor-based by member id: each run handles a slice within a time
// budget, so a large holder base is covered across runs without ever timing out.
export default async function handler(req, res) {
  const config = loadConfig()
  if (!isCronAuthorized(req.headers, config.CRON_SECRET)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    assertVerifyConfig(config)

    // Group wallet rows by member.
    const byUser = new Map()
    for (const row of await listVerifications()) {
      if (!byUser.has(row.discord_user_id)) byUser.set(row.discord_user_id, [])
      byUser.get(row.discord_user_id).push({ wallet: row.wallet, count: row.count })
    }
    const users = [...byUser.keys()].sort()
    if (users.length === 0) return res.status(200).json({ ok: true, checked: 0 })

    const cursor = (await getState('reverify_cursor'))?.id || ''
    let start = users.findIndex((u) => u > cursor)
    if (start < 0) start = 0 // cursor past the end → wrap to the beginning

    const deps = {
      config,
      // Pace each Helius DAS call to stay under the free-tier 2 req/s cap.
      countPrimos: async (w) => {
        await sleep(PACE_MS)
        return countPrimos(w, { apiKey: config.HELIUS_API_KEY, collection: config.PRIMOS_COLLECTION_ADDRESS })
      },
      getGuildMember: (g, u) => getGuildMember(g, u, { token: config.BOT_TOKEN }),
      addGuildMemberRole: (g, u, r) => addGuildMemberRole(g, u, r, { token: config.BOT_TOKEN }),
      removeGuildMemberRole: (g, u, r) => removeGuildMemberRole(g, u, r, { token: config.BOT_TOKEN }),
      upsertVerification,
      deleteWallet,
      deleteForUser,
    }

    const startedAt = Date.now()
    let checked = 0
    let changed = 0
    let dropped = 0
    let lastId = ''
    for (let i = start; i < users.length; i++) {
      if (Date.now() - startedAt > BUDGET_MS) break
      const discordUserId = users[i]
      try {
        const r = await recheckUser({ discordUserId, wallets: byUser.get(discordUserId) }, deps)
        if (r.left || r.tierKey === null) dropped++
        else if (r.added || (r.removed && r.removed.length)) changed++
      } catch (e) {
        console.error('reverify failed for', discordUserId, e)
      }
      lastId = discordUserId
      checked++
    }

    const reachedEnd = start + checked >= users.length
    await setState('reverify_cursor', { id: reachedEnd ? '' : lastId })

    return res.status(200).json({ ok: true, members: users.length, checked, changed, dropped, wrapped: reachedEnd })
  } catch (err) {
    console.error('reverify error', err)
    return res.status(500).json({ error: 'failed', detail: String(err) })
  }
}
