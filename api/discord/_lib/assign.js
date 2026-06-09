import { tierFor, allTierRoleIds } from './tiers.js'

// Reconcile a member's tier role to match their hold count, "highest tier only":
// ensure they have exactly the one role they qualify for and none of the other
// three. Idempotent — only adds/removes what's actually needed, so re-running
// (e.g. the nightly cron) is a no-op when nothing changed.
//
//   currentRoleIds — the member's current role IDs (from getGuildMember)
//   count          — Primos held
//   config         — provides TIER_ROLE_* ids
//   deps           — { addRole(roleId), removeRole(roleId) }
export async function reconcileTierRole({ currentRoleIds = [], count, config }, deps) {
  const tier = tierFor(count)
  const targetRoleId = tier ? config[tier.configKey] : null
  const allIds = allTierRoleIds(config)
  const have = new Set(currentRoleIds)

  const toAdd = targetRoleId && !have.has(targetRoleId) ? targetRoleId : null
  const toRemove = allIds.filter((id) => id !== targetRoleId && have.has(id))

  if (toAdd) await deps.addRole(toAdd)
  for (const id of toRemove) await deps.removeRole(id)

  return { tierKey: tier ? tier.key : null, targetRoleId, added: toAdd, removed: toRemove }
}
