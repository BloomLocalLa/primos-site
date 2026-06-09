import { tiersFor, allTierRoleIds } from './tiers.js'

// Reconcile a member's tier roles to match their hold count — STACKED: they get
// EVERY role they qualify for (25 Primos → Primo + Compadre + Tío + El Jefe) and
// lose any they no longer qualify for. Idempotent — only adds/removes what's
// actually needed, so re-running (e.g. the nightly cron) is a no-op when unchanged.
//
//   currentRoleIds — the member's current role IDs (from getGuildMember)
//   count          — Primos held (their total across wallets)
//   config         — provides TIER_ROLE_* ids
//   deps           — { addRole(roleId), removeRole(roleId) }
export async function reconcileTierRole({ currentRoleIds = [], count, config }, deps) {
  const qualifying = tiersFor(count).map((t) => config[t.configKey]).filter(Boolean)
  const qualifySet = new Set(qualifying)
  const allIds = allTierRoleIds(config)
  const have = new Set(currentRoleIds)

  const toAdd = qualifying.filter((id) => !have.has(id))
  const toRemove = allIds.filter((id) => !qualifySet.has(id) && have.has(id))

  for (const id of toAdd) await deps.addRole(id)
  for (const id of toRemove) await deps.removeRole(id)

  return { qualifying, added: toAdd, removed: toRemove }
}
