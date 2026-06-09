import { describe, it, expect, vi } from 'vitest'
import { reconcileTierRole } from './assign.js'

const config = {
  TIER_ROLE_PRIMO: 'p', TIER_ROLE_COMPADRE: 'c',
  TIER_ROLE_TIO: 't', TIER_ROLE_ELJEFE: 'e',
}

function deps() {
  return { addRole: vi.fn().mockResolvedValue(null), removeRole: vi.fn().mockResolvedValue(null) }
}

describe('reconcileTierRole (highest-only)', () => {
  it('adds the matching tier role when the member has none', async () => {
    const d = deps()
    const r = await reconcileTierRole({ currentRoleIds: [], count: 25, config }, d)
    expect(d.addRole).toHaveBeenCalledWith('e')
    expect(d.removeRole).not.toHaveBeenCalled()
    expect(r).toMatchObject({ tierKey: 'ELJEFE', added: 'e', removed: [] })
  })

  it('promotes: adds the new tier and strips the old one', async () => {
    const d = deps()
    const r = await reconcileTierRole({ currentRoleIds: ['p'], count: 25, config }, d)
    expect(d.addRole).toHaveBeenCalledWith('e')
    expect(d.removeRole).toHaveBeenCalledWith('p')
    expect(r.removed).toEqual(['p'])
  })

  it('strips every non-matching tier role it finds', async () => {
    const d = deps()
    await reconcileTierRole({ currentRoleIds: ['p', 'c', 't', 'e', 'other'], count: 7, config }, d)
    // count 7 -> Compadre ('c'); keep 'c', remove p/t/e, ignore unrelated 'other'
    expect(d.addRole).not.toHaveBeenCalled() // already has 'c'
    expect(d.removeRole.mock.calls.map((c) => c[0]).sort()).toEqual(['e', 'p', 't'])
  })

  it('removes all tier roles when the member holds none', async () => {
    const d = deps()
    const r = await reconcileTierRole({ currentRoleIds: ['t'], count: 0, config }, d)
    expect(d.addRole).not.toHaveBeenCalled()
    expect(d.removeRole).toHaveBeenCalledWith('t')
    expect(r).toMatchObject({ tierKey: null, targetRoleId: null })
  })

  it('does nothing when the member already has exactly the right role', async () => {
    const d = deps()
    const r = await reconcileTierRole({ currentRoleIds: ['c'], count: 5, config }, d)
    expect(d.addRole).not.toHaveBeenCalled()
    expect(d.removeRole).not.toHaveBeenCalled()
    expect(r).toMatchObject({ tierKey: 'COMPADRE', added: null, removed: [] })
  })
})
