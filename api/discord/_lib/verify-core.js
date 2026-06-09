import { tierFor, tiersFor } from './tiers.js'
import { reconcileTierRole } from './assign.js'
import { buildChallengeMessage } from './challenge.js'

// Pure orchestration for holder verification, fully dependency-injected so it can
// be unit-tested without HTTP, Discord, Supabase, or Helius. The thin route
// handlers (verify-challenge.js / verify-complete.js) wire real deps in.

function nonceProblem(nonce, now) {
  if (!nonce) return 'not_found'
  if (nonce.used) return 'used'
  if (new Date(nonce.expires_at).getTime() < now) return 'expired'
  return null
}

// Issue the message the wallet must sign for a given nonce id.
export async function buildChallenge({ nonceId, now = Date.now() }, deps) {
  if (!nonceId) return { ok: false, reason: 'bad_request' }
  const nonce = await deps.getNonce(nonceId)
  const bad = nonceProblem(nonce, now)
  if (bad) return { ok: false, reason: bad }
  return {
    ok: true,
    message: buildChallengeMessage({ discordUserId: nonce.discord_user_id, nonce: nonce.nonce }),
    expiresAt: nonce.expires_at,
  }
}

// Verify a signed challenge, count holdings, assign the tier role, persist.
export async function completeVerification({ nonceId, wallet, signature, now = Date.now() }, deps) {
  const { config } = deps
  if (!nonceId || !wallet || !signature) return { ok: false, reason: 'bad_request' }

  const nonce = await deps.getNonce(nonceId)
  const bad = nonceProblem(nonce, now)
  if (bad) return { ok: false, reason: bad }

  const discordUserId = nonce.discord_user_id
  const message = buildChallengeMessage({ discordUserId, nonce: nonce.nonce })
  if (!deps.verifyWalletSignature(message, signature, wallet)) {
    return { ok: false, reason: 'bad_signature' }
  }

  // One wallet per Discord (v1): block a wallet already linked to someone else.
  const existing = await deps.getVerificationByWallet(wallet)
  if (existing && existing.discord_user_id !== discordUserId) {
    return { ok: false, reason: 'wallet_taken' }
  }

  // Link/refresh this wallet, then total Primos across ALL the member's wallets.
  const walletCount = await deps.countPrimos(wallet)
  await deps.upsertVerification({ discordUserId, wallet, count: walletCount })
  const wallets = await deps.listWalletsForUser(discordUserId)
  const total = wallets.reduce((sum, w) => sum + (w.count || 0), 0)
  const tier = tierFor(total)

  // Member may have left the server between /verify and signing — tolerate it.
  const member = await deps.getGuildMember(config.GUILD_ID, discordUserId).catch(() => null)
  const result = await reconcileTierRole(
    { currentRoleIds: member?.roles || [], count: total, config },
    {
      addRole: (roleId) => deps.addGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
      removeRole: (roleId) => deps.removeGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
    },
  )

  await deps.markNonceUsed(nonceId)

  return {
    ok: true,
    walletCount,
    total,
    walletsLinked: wallets.length,
    tier: tier ? tier.name : null, // highest tier (headline)
    tierKey: tier ? tier.key : null,
    tiers: tiersFor(total).map((t) => t.name), // all qualifying tier names (roles stack)
    rolesAdded: result.added,
    rolesRemoved: result.removed,
  }
}

// Re-check ALL of a member's wallets (used by the nightly cron). Re-counts each,
// drops emptied wallets, sums the rest, and reconciles the member's tier role
// from the total. Returns what changed for logging.
export async function recheckUser({ discordUserId, wallets, now = Date.now() }, deps) {
  const { config } = deps

  // Left the server? Drop all their wallets and skip the Helius calls.
  const member = await deps.getGuildMember(config.GUILD_ID, discordUserId).catch(() => null)
  if (!member) {
    await deps.deleteForUser(discordUserId)
    return { discordUserId, left: true }
  }

  let total = 0
  for (const w of wallets) {
    const c = await deps.countPrimos(w.wallet)
    if (c <= 0) {
      await deps.deleteWallet(w.wallet) // forget emptied wallets
    } else {
      total += c
      await deps.upsertVerification({ discordUserId, wallet: w.wallet, count: c, verifiedAt: new Date(now).toISOString() })
    }
  }

  const tier = tierFor(total)
  const result = await reconcileTierRole(
    { currentRoleIds: member.roles || [], count: total, config },
    {
      addRole: (roleId) => deps.addGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
      removeRole: (roleId) => deps.removeGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
    },
  )

  return { discordUserId, total, tierKey: tier ? tier.key : null, added: result.added, removed: result.removed }
}
