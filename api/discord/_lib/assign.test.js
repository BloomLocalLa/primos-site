import { describe, it, expect, vi } from 'vitest'
import { reconcileTierRole } from './assign.js'

const config = {
  TIER_ROLE_PRIMO: 'p', TIER_ROLE_COMPADRE: 'c',
  TIER_ROLE_TIO: 't', TIER_ROLE_ELJEFE: 'e',
}

function deps() {
  return { addRole: vi.fn().mockResolvedValue(null), removeRole: vi.fn().mockResolvedValue(null) }
}

const added = (d) => d.addRole.mock.calls.map((c) => c[0]).sort()
const removed = (d) => d.removeRole.mock.calls.map((c) => c[0]).sort()

describe('reconcileTierRole (stacked)', () => {
  it('25 Primos → all four tier roles', async () => {
    const d = deps()
    const r = await reconcileTierRole({ currentRoleIds: [], count: 25, config }, d)
    expect(added(d)).toEqual(['c', 'e', 'p', 't'])
    expect(d.removeRole).not.toHaveBeenCalled()
    expect(r.qualifying.sort()).toEqual(['c', 'e', 'p', 't'])
  })

  it('10 Primos → Primo + Compadre + Tío (not El Jefe)', async () => {
    const d = deps()
    await reconcileTierRole({ currentRoleIds: [], count: 10, config }, d)
    expect(added(d)).toEqual(['c', 'p', 't'])
  })

  it('4 Primos → Primo only', async () => {
    const d = deps()
    await reconcileTierRole({ currentRoleIds: [], count: 4, config }, d)
    expect(added(d)).toEqual(['p'])
  })

  it('only adds the roles the member is missing', async () => {
    const d = deps()
    await reconcileTierRole({ currentRoleIds: ['p', 'c'], count: 25, config }, d)
    expect(added(d)).toEqual(['e', 't'])
    expect(d.removeRole).not.toHaveBeenCalled()
  })

  it('demotion: drops roles no longer qualified for (sold 25 → 7)', async () => {
    const d = deps()
    await reconcileTierRole({ currentRoleIds: ['p', 'c', 't', 'e'], count: 7, config }, d)
    expect(d.addRole).not.toHaveBeenCalled()
    expect(removed(d)).toEqual(['e', 't']) // keep p,c (still qualify); drop t,e
  })

  it('0 Primos → removes all tier roles', async () => {
    const d = deps()
    const r = await reconcileTierRole({ currentRoleIds: ['p', 'c', 't', 'e'], count: 0, config }, d)
    expect(d.addRole).not.toHaveBeenCalled()
    expect(removed(d)).toEqual(['c', 'e', 'p', 't'])
    expect(r.qualifying).toEqual([])
  })

  it('idempotent when roles already match the count', async () => {
    const d = deps()
    await reconcileTierRole({ currentRoleIds: ['p', 'c', 't'], count: 10, config }, d)
    expect(d.addRole).not.toHaveBeenCalled()
    expect(d.removeRole).not.toHaveBeenCalled()
  })

  it('ignores unrelated roles', async () => {
    const d = deps()
    await reconcileTierRole({ currentRoleIds: ['other'], count: 5, config }, d)
    expect(added(d)).toEqual(['c', 'p'])
    expect(d.removeRole).not.toHaveBeenCalled()
  })
})
