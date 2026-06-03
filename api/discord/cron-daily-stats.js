import { loadConfig } from './_lib/config.js'
import { isCronAuthorized } from './_lib/cron-auth.js'
import { getCollectionStats, getHolderCount } from './_lib/magiceden.js'
import { buildStatsEmbed } from './_lib/embeds.js'
import { postMessage } from './_lib/rest.js'

export default async function handler(req, res) {
  const config = loadConfig()
  if (!isCronAuthorized(req.headers, config.CRON_SECRET)) {
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
