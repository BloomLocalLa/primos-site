import { tierFor } from './tiers.js'
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

  const count = await deps.countPrimos(wallet)
  const tier = tierFor(count)

  // Member may have left the server between /verify and signing — tolerate it.
  const member = await deps.getGuildMember(config.GUILD_ID, discordUserId).catch(() => null)
  const result = await reconcileTierRole(
    { currentRoleIds: member?.roles || [], count, config },
    {
      addRole: (roleId) => deps.addGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
      removeRole: (roleId) => deps.removeGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
    },
  )

  await deps.upsertVerification({ discordUserId, wallet, count, tier: tier ? tier.key : null })
  await deps.markNonceUsed(nonceId)

  return {
    ok: true,
    count,
    tier: tier ? tier.name : null,
    tierKey: tier ? tier.key : null,
    roleAssigned: result.targetRoleId,
    rolesRemoved: result.removed,
  }
}

// Re-check one already-linked wallet (used by the nightly cron). Returns the new
// tier/count and what changed, so the caller can log/aggregate.
export async function recheckHolder({ record, now = Date.now() }, deps) {
  const { config } = deps
  const discordUserId = record.discord_user_id
  const count = await deps.countPrimos(record.wallet)
  const tier = tierFor(count)

  const member = await deps.getGuildMember(config.GUILD_ID, discordUserId).catch(() => null)
  if (!member) {
    // They left the server; drop the stale link so we stop re-checking it.
    await deps.deleteVerification(discordUserId)
    return { discordUserId, left: true, count }
  }

  const result = await reconcileTierRole(
    { currentRoleIds: member.roles || [], count, config },
    {
      addRole: (roleId) => deps.addGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
      removeRole: (roleId) => deps.removeGuildMemberRole(config.GUILD_ID, discordUserId, roleId),
    },
  )

  if (count <= 0) {
    // No longer a holder — forget them (roles already stripped above).
    await deps.deleteVerification(discordUserId)
  } else {
    await deps.upsertVerification({
      discordUserId, wallet: record.wallet, count, tier: tier ? tier.key : null, verifiedAt: new Date(now).toISOString(),
    })
  }

  return { discordUserId, count, tierKey: tier ? tier.key : null, added: result.added, removed: result.removed }
}
