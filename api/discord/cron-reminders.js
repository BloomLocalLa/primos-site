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
