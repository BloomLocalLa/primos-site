import { describe, it, expect, vi } from 'vitest'
import { buildChallenge, completeVerification, recheckUser } from './verify-core.js'

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
    listWalletsForUser: vi.fn().mockResolvedValue([{ wallet: 'W', count: 5 }]),
    getGuildMember: vi.fn().mockResolvedValue({ roles: [] }),
    addGuildMemberRole: vi.fn().mockResolvedValue(null),
    removeGuildMemberRole: vi.fn().mockResolvedValue(null),
    upsertVerification: vi.fn().mockResolvedValue(null),
    markNonceUsed: vi.fn().mockResolvedValue(null),
    deleteWallet: vi.fn().mockResolvedValue(null),
    deleteForUser: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('buildChallenge', () => {
  it('returns a message bound to the Discord id + nonce', async () => {
    const r = await buildChallenge({ nonceId: 'n1', now: NOW }, baseDeps())
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

describe('completeVerification (multi-wallet)', () => {
  it('happy path: links the wallet, sums, assigns tier, burns nonce', async () => {
    const deps = baseDeps()
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toMatchObject({ ok: true, walletCount: 5, total: 5, walletsLinked: 1, tier: 'Compadre', tierKey: 'COMPADRE', roleAssigned: 'c' })
    expect(deps.upsertVerification).toHaveBeenCalledWith({ discordUserId: 'u1', wallet: 'W', count: 5 })
    expect(deps.addGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 'c')
    expect(deps.markNonceUsed).toHaveBeenCalledWith('n1')
  })

  it('aggregates holdings across all the member\'s wallets', async () => {
    const deps = baseDeps({
      countPrimos: vi.fn().mockResolvedValue(3), // this wallet
      listWalletsForUser: vi.fn().mockResolvedValue([{ wallet: 'W', count: 3 }, { wallet: 'W2', count: 7 }]),
    })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toMatchObject({ ok: true, walletCount: 3, total: 10, walletsLinked: 2, tierKey: 'TIO' })
    expect(deps.addGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 't') // Tío from the 10 total
  })

  it('rejects a bad signature without linking or burning the nonce', async () => {
    const deps = baseDeps({ verifyWalletSignature: vi.fn().mockReturnValue(false) })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toEqual({ ok: false, reason: 'bad_signature' })
    expect(deps.upsertVerification).not.toHaveBeenCalled()
    expect(deps.markNonceUsed).not.toHaveBeenCalled()
  })

  it('rejects missing fields', async () => {
    expect((await completeVerification({ nonceId: 'n1', wallet: '', signature: 'S', now: NOW }, baseDeps())).reason).toBe('bad_request')
  })

  it('rejects an expired nonce', async () => {
    const deps = baseDeps({ getNonce: vi.fn().mockResolvedValue({ ...validNonce(), expires_at: past() }) })
    expect((await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)).reason).toBe('expired')
  })

  it('blocks a wallet already linked to another member', async () => {
    const deps = baseDeps({ getVerificationByWallet: vi.fn().mockResolvedValue({ discord_user_id: 'someone_else', wallet: 'W' }) })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r.reason).toBe('wallet_taken')
    expect(deps.countPrimos).not.toHaveBeenCalled()
    expect(deps.upsertVerification).not.toHaveBeenCalled()
  })

  it('allows the same member to re-link its own wallet', async () => {
    const deps = baseDeps({
      getVerificationByWallet: vi.fn().mockResolvedValue({ discord_user_id: 'u1', wallet: 'W' }),
      countPrimos: vi.fn().mockResolvedValue(25),
      listWalletsForUser: vi.fn().mockResolvedValue([{ wallet: 'W', count: 25 }]),
    })
    expect(await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)).toMatchObject({ ok: true, total: 25, tierKey: 'ELJEFE' })
  })

  it('total 0: assigns no tier and strips any existing tier role', async () => {
    const deps = baseDeps({
      countPrimos: vi.fn().mockResolvedValue(0),
      listWalletsForUser: vi.fn().mockResolvedValue([{ wallet: 'W', count: 0 }]),
      getGuildMember: vi.fn().mockResolvedValue({ roles: ['p'] }),
    })
    const r = await completeVerification({ nonceId: 'n1', wallet: 'W', signature: 'S', now: NOW }, deps)
    expect(r).toMatchObject({ ok: true, total: 0, tier: null, tierKey: null })
    expect(deps.removeGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 'p')
    expect(deps.addGuildMemberRole).not.toHaveBeenCalled()
  })
})

describe('recheckUser (nightly cron)', () => {
  it('drops all wallets when the member has left the server', async () => {
    const deps = baseDeps({ getGuildMember: vi.fn().mockResolvedValue(null) })
    const r = await recheckUser({ discordUserId: 'u1', wallets: [{ wallet: 'W', count: 5 }], now: NOW }, deps)
    expect(r).toMatchObject({ left: true })
    expect(deps.deleteForUser).toHaveBeenCalledWith('u1')
    expect(deps.countPrimos).not.toHaveBeenCalled() // checked membership first
  })

  it('forgets an emptied wallet and strips the role when total hits 0', async () => {
    const deps = baseDeps({ countPrimos: vi.fn().mockResolvedValue(0), getGuildMember: vi.fn().mockResolvedValue({ roles: ['t'] }) })
    const r = await recheckUser({ discordUserId: 'u1', wallets: [{ wallet: 'W', count: 10 }], now: NOW }, deps)
    expect(deps.deleteWallet).toHaveBeenCalledWith('W')
    expect(deps.removeGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 't')
    expect(deps.upsertVerification).not.toHaveBeenCalled()
    expect(r).toMatchObject({ total: 0, tierKey: null })
  })

  it('sums multiple wallets and reconciles the tier', async () => {
    const countPrimos = vi.fn().mockResolvedValueOnce(4).mockResolvedValueOnce(6)
    const deps = baseDeps({ countPrimos, getGuildMember: vi.fn().mockResolvedValue({ roles: ['c'] }) })
    const r = await recheckUser({ discordUserId: 'u1', wallets: [{ wallet: 'W1', count: 4 }, { wallet: 'W2', count: 6 }], now: NOW }, deps)
    expect(r).toMatchObject({ total: 10, tierKey: 'TIO' })
    expect(deps.addGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 't')
    expect(deps.removeGuildMemberRole).toHaveBeenCalledWith('g1', 'u1', 'c')
    expect(deps.upsertVerification).toHaveBeenCalledTimes(2)
    expect(deps.deleteForUser).not.toHaveBeenCalled()
  })
})
