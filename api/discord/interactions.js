import { loadConfig, assertVerifyConfig } from './_lib/config.js'
import { verifyDiscordSignature } from './_lib/verify.js'
import { handleInteraction } from './_lib/router.js'
import { postMessage, editMessage } from './_lib/rest.js'
import { getCollectionStats, getHolderCount } from './_lib/magiceden.js'
import { getState, setState } from './_lib/state.js'
import { createNonce } from './_lib/holders.js'
import crypto from 'node:crypto'

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
    // Build a one-time, 10-minute verification link bound to this Discord user.
    // Returns null (→ "not live yet") until the Helius/tier-role env is set.
    createVerifyLink: async (discordUserId) => {
      try { assertVerifyConfig(config) } catch { return null }
      if (!discordUserId) return null
      const nonce = crypto.randomBytes(16).toString('hex')
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      const row = await createNonce({ discordUserId, nonce, expiresAt })
      return `${config.PUBLIC_BASE_URL}/verify?t=${row.id}`
    },
  }

  try {
    const response = await handleInteraction(interaction, deps)
    return res.status(200).json(response)
  } catch (err) {
    console.error('interaction error', err)
    return res.status(200).json({ type: 4, data: { flags: 64, content: '⚠️ Something went wrong handling that.' } })
  }
}
