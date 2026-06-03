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

    // Trade-off: advancing the cursor per-post gives "at most once" delivery (no
    // duplicate alerts). The stored `signature` is informational only. The sole
    // residual gap is the rare case where the function crashes mid-batch among
    // sales sharing the exact same blockTime (same second): the strict `>` filter
    // in getRecentSales would skip the remaining same-second sales on the next run.
    // Acceptable for a low-volume collection on 5-minute polling.
    for (const sale of sales) {
      await postMessage(config.SALES_CHANNEL_ID, { embeds: [buildSaleEmbed(sale)] }, { token: config.BOT_TOKEN })
      await setState('sales_cursor', { blockTime: sale.blockTime, signature: sale.signature })
    }
    return res.status(200).json({ ok: true, posted: sales.length })
  } catch (err) {
    console.error('sales-alerts error', err)
    return res.status(500).json({ error: 'failed', detail: String(err) })
  }
}
