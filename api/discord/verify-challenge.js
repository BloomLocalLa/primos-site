import { loadConfig, assertVerifyConfig } from './_lib/config.js'
import { getNonce } from './_lib/holders.js'
import { buildChallenge } from './_lib/verify-core.js'

// GET /api/discord/verify-challenge?t=<nonceId>
// Returns the exact message the wallet must sign for this verification request.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })
  try {
    const config = loadConfig()
    assertVerifyConfig(config)

    const nonceId = (req.query && req.query.t) ||
      new URL(req.url, 'http://localhost').searchParams.get('t')

    const result = await buildChallenge({ nonceId }, { getNonce })
    if (!result.ok) {
      const code = result.reason === 'not_found' ? 404 : 410
      return res.status(code).json({ error: result.reason })
    }
    return res.status(200).json({ message: result.message, expiresAt: result.expiresAt })
  } catch (err) {
    console.error('verify-challenge error', err)
    return res.status(500).json({ error: 'server_error' })
  }
}
