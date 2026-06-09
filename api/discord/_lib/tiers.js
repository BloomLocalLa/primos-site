// Primos holder tiers. "Highest tier only" — a member gets the single highest
// tier their hold-count qualifies for (e.g. 25 held = El Jefe only, not all four).
// Thresholds are whale-friendly and were chosen with the project owner.
//
// Role IDs live in env (resolved per server), injected via config so this module
// stays pure and unit-testable.

// Ordered HIGHEST → LOWEST so `tierFor` can return the first match.
export const TIERS = [
  { key: 'ELJEFE', name: 'El Jefe', min: 25, configKey: 'TIER_ROLE_ELJEFE' },
  { key: 'TIO', name: 'Tío', min: 10, configKey: 'TIER_ROLE_TIO' },
  { key: 'COMPADRE', name: 'Compadre', min: 5, configKey: 'TIER_ROLE_COMPADRE' },
  { key: 'PRIMO', name: 'Primo', min: 1, configKey: 'TIER_ROLE_PRIMO' },
]

// The single tier for a given hold-count, or null if they hold none.
export function tierFor(count) {
  const n = Number(count) || 0
  return TIERS.find((t) => n >= t.min) || null
}

// Map of tierKey -> roleId from config (e.g. { ELJEFE: '123', ... }).
export function tierRoleIds(config) {
  const out = {}
  for (const t of TIERS) out[t.key] = config[t.configKey]
  return out
}

// All four tier role IDs (used to strip the non-matching ones, highest-only).
export function allTierRoleIds(config) {
  return TIERS.map((t) => config[t.configKey]).filter(Boolean)
}
