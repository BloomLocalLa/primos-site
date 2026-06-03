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
