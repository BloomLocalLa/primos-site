import { describe, it, expect } from 'vitest'
import { tierFor, tiersFor, tierRoleIds, allTierRoleIds, TIERS } from './tiers.js'

describe('tierFor (highest-only)', () => {
  it('returns null below the entry threshold', () => {
    expect(tierFor(0)).toBeNull()
    expect(tierFor(-3)).toBeNull()
  })

  it('maps boundaries to the correct single tier', () => {
    expect(tierFor(1).key).toBe('PRIMO')
    expect(tierFor(4).key).toBe('PRIMO')
    expect(tierFor(5).key).toBe('COMPADRE')
    expect(tierFor(9).key).toBe('COMPADRE')
    expect(tierFor(10).key).toBe('TIO')
    expect(tierFor(24).key).toBe('TIO')
    expect(tierFor(25).key).toBe('ELJEFE')
    expect(tierFor(9999).key).toBe('ELJEFE')
  })

  it('coerces non-numbers to no tier', () => {
    expect(tierFor(undefined)).toBeNull()
    expect(tierFor(null)).toBeNull()
    expect(tierFor('not a number')).toBeNull()
  })
})

describe('tiersFor (stacked — all qualifying tiers)', () => {
  it('returns every tier the count qualifies for, highest-first', () => {
    expect(tiersFor(25).map((t) => t.key)).toEqual(['ELJEFE', 'TIO', 'COMPADRE', 'PRIMO'])
    expect(tiersFor(10).map((t) => t.key)).toEqual(['TIO', 'COMPADRE', 'PRIMO'])
    expect(tiersFor(5).map((t) => t.key)).toEqual(['COMPADRE', 'PRIMO'])
    expect(tiersFor(1).map((t) => t.key)).toEqual(['PRIMO'])
    expect(tiersFor(0)).toEqual([])
  })
})

describe('role id helpers', () => {
  const config = {
    TIER_ROLE_PRIMO: 'p', TIER_ROLE_COMPADRE: 'c',
    TIER_ROLE_TIO: 't', TIER_ROLE_ELJEFE: 'e',
  }
  it('builds a tierKey -> roleId map', () => {
    expect(tierRoleIds(config)).toEqual({ PRIMO: 'p', COMPADRE: 'c', TIO: 't', ELJEFE: 'e' })
  })
  it('lists all configured tier role ids', () => {
    expect(allTierRoleIds(config).sort()).toEqual(['c', 'e', 'p', 't'])
  })
  it('skips unset role ids', () => {
    expect(allTierRoleIds({ TIER_ROLE_PRIMO: 'p' })).toEqual(['p'])
  })
  it('keeps tiers ordered highest-first', () => {
    expect(TIERS.map((t) => t.key)).toEqual(['ELJEFE', 'TIO', 'COMPADRE', 'PRIMO'])
  })
})
