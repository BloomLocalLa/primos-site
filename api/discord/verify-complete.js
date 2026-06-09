import { loadConfig, assertVerifyConfig } from './_lib/config.js'
import {
  getNonce, getVerificationByWallet, upsertVerification, markNonceUsed, listWalletsForUser,
} from './_lib/holders.js'
import { verifyWalletSignature } from './_lib/wallet.js'
import { countPrimos } from './_lib/helius.js'
import { getGuildMember, addGuildMemberRole, removeGuildMemberRole } from './_lib/rest.js'
import { completeVerification } from './_lib/verify-core.js'

function readJson(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => { data += c })
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) } })
    req.on('error', () => resolve({}))
  })
}

// POST /api/discord/verify-complete  { t, wallet, signature }
// Verifies the signature, counts Primos via Helius, assigns the tier role, persists.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  try {
    const config = loadConfig()
    assertVerifyConfig(config)

    const { t: nonceId, wallet, signature } = await readJson(req)

    const deps = {
      config,
      getNonce,
      verifyWalletSignature,
      getVerificationByWallet,
      listWalletsForUser,
      countPrimos: (w) => countPrimos(w, { apiKey: config.HELIUS_API_KEY, collection: config.PRIMOS_COLLECTION_ADDRESS }),
      getGuildMember: (g, u) => getGuildMember(g, u, { token: config.BOT_TOKEN }),
      addGuildMemberRole: (g, u, r) => addGuildMemberRole(g, u, r, { token: config.BOT_TOKEN }),
      removeGuildMemberRole: (g, u, r) => removeGuildMemberRole(g, u, r, { token: config.BOT_TOKEN }),
      upsertVerification,
      markNonceUsed,
    }

    const result = await completeVerification({ nonceId, wallet, signature }, deps)
    if (!result.ok) {
      const codes = { bad_request: 400, bad_signature: 401, wallet_taken: 409, not_found: 404, used: 410, expired: 410 }
      return res.status(codes[result.reason] || 400).json({ error: result.reason })
    }
    return res.status(200).json(result)
  } catch (err) {
    console.error('verify-complete error', err)
    return res.status(500).json({ error: 'server_error' })
  }
}
