import { describe, it, expect, vi } from 'vitest'
import { buildChallenge, completeVerification, recheckHolder } from './verify-core.js'

const NOW = 1_700_000_000_000
const future = () => new Date(NOW + 600_000).toISOString()
const past = () => new Date(NOW - 1_000).toISOString()

const validNonce = () => ({ id: 'n1', discord_user_id: 'u1', nonce: 'abc', used: false, expires_at: future() })

function baseDeps(overrides = {}) {
  return {
    config: {
      GUILD_ID: 'g1',
      TIER_ROLE_PRIMO: 'p', TIER_ROLE_COMPADRE: 'c', TIER_ROLE_TIO: 't', TIER_ROLE_ELJEFE: 'e',
    },
    getNonce: vi.fn().mockResolvedValue(validNonce()),
    verifyWalletSignature: vi.fn().mockReturnValue(true),
    getVerificationByWallet: vi.fn().mockResolvedValue(null),
    countPrimos: vi.fn().mockResolvedValue(5),
    getGuildMember: vi.fn().mockResolvedValue({ roles: [] }),
    addGuildMemberRole: vi.fn().mockResolvedValue(null),
    removeGuildMemberRole: vi.fn().mockResolvedValue(null),
    upsertVerification: vi.fn().mockResolvedValue(null),
    markNonceUsed: vi.fn().mockResolvedValue(null),
    deleteVerification: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('buildChallenge', () => {
  it('returns a message bound to the Discord id + nonce', async () => {
    const deps = baseDeps()
    const r = await buildChallenge({ nonceId: 'n1', now: NOW }, deps)
    expect(r.ok).toBe(true)
    expect(r.message).toContain('Discord: u1')
    expect(r.message).toContain('Nonce: abc')
  })

  it('rejects missing / used / expired nonces', async () => {
    expect((await buildChallenge({ nonceId: 'n1', now: NOW }, baseDeps({ getNonce: vi.fn().mockResolvedValue(null) }))).reason).toBe('not_found')
    expect((await buildChallenge({ nonceId: 'n1', now: NOW }, baseDeps({ getNonce: vi.fn().mockResolvedValue({ ...validNonce(), used: true }) }))).reason).toBe('used')
    expect((await buildChallenge({ nonceId: 'n1', now: NOW }, baseDeps({ getNonce: vi.fn().mockResolvedValue({ ...validNonce(), expires_at: past() }) }))).reason).toBe('expired')
  })
})

describe('completeVerification', () => {
  it('happy path: verifies, counts, assigns tier, persists, burns nonce', async () => {
    const deps = baseDeps({ countPrimos: vi.fn().mockResolvedValue(5) })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toMatchObject({ ok: true, count: 5, tier: 'Compadre', tierKey: 'COMPADRE', roleAssigned: 'c' })
    expect(deps.addGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 'c')
    expect(deps.upsertVerification).toHaveBeenCalledWith({ discordUserId: 'u1', wallet: 'W', count: 5, tier: 'COMPADRE' })
    expect(deps.markNonceUsed).toHaveBeenCalledWith('n1')
  })

  it('rejects a bad signature without assigning or burning the nonce', async () => {
    const deps = baseDeps({ verifyWalletSignature: vi.fn().mockReturnValue(false) })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toEqual({ ok: false, reason: 'bad_signature' })
    expect(deps.addGuildMemberRole).not.toHaveBeenCalled()
    expect(deps.markNonceUsed).not.toHaveBeenCalled()
  })

  it('rejects missing fields', async () => {
    const r = await completeVerification({ nonceId: 'n1', wallet: '', signature: 'S', now: NOW }, baseDeps())
    expect(r.reason).toBe('bad_request')
  })

  it('rejects an expired nonce', async () => {
    const deps = baseDeps({ getNonce: vi.fn().mockResolvedValue({ ...validNonce(), expires_at: past() }) })
    expect((await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)).reason).toBe('expired')
  })

  it('blocks a wallet already linked to another Discord', async () => {
    const deps = baseDeps({ getVerificationByWallet: vi.fn().mockResolvedValue({ discord_user_id: 'someone_else', wallet: 'W' }) })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r.reason).toBe('wallet_taken')
    expect(deps.countPrimos).not.toHaveBeenCalled()
  })

  it('allows the same Discord to re-link its own wallet', async () => {
    const deps = baseDeps({ getVerificationByWallet: vi.fn().mockResolvedValue({ discord_user_id: 'u1', wallet: 'W' }), countPrimos: vi.fn().mockResolvedValue(25) })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toMatchObject({ ok: true, tierKey: 'ELJEFE' })
  })

  it('count 0: assigns no tier and strips any existing tier role', async () => {
    const deps = baseDeps({ countPrimos: vi.fn().mockResolvedValue(0), getGuildMember: vi.fn().mockResolvedValue({ roles: ['p'] }) })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toMatchObject({ ok: true, count: 0, tier: null, tierKey: null })
    expect(deps.removeGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 'p')
    expect(deps.addGuildMemberRole).not.toHaveBeenCalled()
  })
})

describe('recheckHolder (nightly cron)', () => {
  it('drops the link when the member has left the server', async () => {
    const deps = baseDeps({ getGuildMember: vi.fn().mockResolvedValue(null) })
    const r = await recheckHolder({ record: { discord_user_id: 'u1', wallet: 'W' }, now: NOW }, deps)
    expect(r).toMatchObject({ left: true })
    expect(deps.deleteVerification).toHaveBeenCalledWith('u1')
  })

  it('demotes and forgets a wallet that sold down to 0', async () => {
    const deps = baseDeps({ countPrimos: vi.fn().mockResolvedValue(0), getGuildMember: vi.fn().mockResolvedValue({ roles: ['t'] }) })
    await recheckHolder({ record: { discord_user_id: 'u1', wallet: 'W' }, now: NOW }, deps)
    expect(deps.removeGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 't')
    expect(deps.deleteVerification).toHaveBeenCalledWith('u1')
    expect(deps.upsertVerification).not.toHaveBeenCalled()
  })

  it('updates the stored tier when still holding', async () => {
    const deps = baseDeps({ countPrimos: vi.fn().mockResolvedValue(10), getGuildMember: vi.fn().mockResolvedValue({ roles: ['c'] }) })
    const r = await recheckHolder({ record: { discord_user_id: 'u1', wallet: 'W' }, now: NOW }, deps)
    expect(r.tierKey).toBe('TIO')
    expect(deps.addGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 't')
    expect(deps.removeGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 'c')
    expect(deps.upsertVerification).toHaveBeenCalled()
    expect(deps.deleteVerification).not.toHaveBeenCalled()
  })
})
