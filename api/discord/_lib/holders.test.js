import { describe, it, expect } from 'vitest'
import {
  createNonce, getNonce, markNonceUsed,
  getVerificationByWallet, upsertVerification, listVerifications, deleteVerification,
} from './holders.js'

// Chainable Supabase fake: every builder method returns the builder; terminal
// `.single()/.maybeSingle()` resolve to `result`, and awaiting the builder itself
// (for update/delete/upsert/list chains) also resolves to `result`.
function fakeClient(result = { data: null, error: null }) {
  const calls = []
  const builder = {
    insert: (...a) => (calls.push(['insert', ...a]), builder),
    select: (...a) => (calls.push(['select', ...a]), builder),
    eq: (...a) => (calls.push(['eq', ...a]), builder),
    update: (...a) => (calls.push(['update', ...a]), builder),
    upsert: (...a) => (calls.push(['upsert', ...a]), builder),
    delete: (...a) => (calls.push(['delete', ...a]), builder),
    single: async () => result,
    maybeSingle: async () => result,
    then: (resolve) => resolve(result),
  }
  return { from: (...a) => (calls.push(['from', ...a]), builder), calls }
}

describe('nonces', () => {
  it('createNonce inserts and returns the row', async () => {
    const client = fakeClient({ data: { id: 'n1', nonce: 'x', discord_user_id: 'u1' }, error: null })
    const row = await createNonce({ discordUserId: 'u1', nonce: 'x', expiresAt: 't' }, client)
    expect(row.id).toBe('n1')
    expect(client.calls).toContainEqual(['from', 'verify_nonces'])
    expect(client.calls).toContainEqual(['insert', { discord_user_id: 'u1', nonce: 'x', expires_at: 't' }])
  })

  it('createNonce throws on error', async () => {
    const client = fakeClient({ data: null, error: { message: 'boom' } })
    await expect(createNonce({ discordUserId: 'u', nonce: 'n', expiresAt: 't' }, client)).rejects.toThrow(/createNonce: boom/)
  })

  it('getNonce returns the row or null', async () => {
    expect(await getNonce('n1', fakeClient({ data: { id: 'n1', used: false }, error: null }))).toEqual({ id: 'n1', used: false })
    expect(await getNonce('missing', fakeClient({ data: null, error: null }))).toBeNull()
  })

  it('markNonceUsed updates used=true for the id', async () => {
    const client = fakeClient({ error: null })
    await markNonceUsed('n1', client)
    expect(client.calls).toContainEqual(['update', { used: true }])
    expect(client.calls).toContainEqual(['eq', 'id', 'n1'])
  })
})

describe('verifications', () => {
  it('getVerificationByWallet queries by wallet', async () => {
    const client = fakeClient({ data: { discord_user_id: 'u1', wallet: 'W' }, error: null })
    const row = await getVerificationByWallet('W', client)
    expect(row.discord_user_id).toBe('u1')
    expect(client.calls).toContainEqual(['eq', 'wallet', 'W'])
  })

  it('upsertVerification upserts on discord_user_id', async () => {
    const client = fakeClient({ error: null })
    await upsertVerification({ discordUserId: 'u1', wallet: 'W', count: 7, tier: 'TIO', verifiedAt: 'T' }, client)
    expect(client.calls).toContainEqual([
      'upsert',
      { discord_user_id: 'u1', wallet: 'W', count: 7, tier: 'TIO', verified_at: 'T' },
      { onConflict: 'discord_user_id' },
    ])
  })

  it('listVerifications returns the array (or empty)', async () => {
    expect(await listVerifications(fakeClient({ data: [{ discord_user_id: 'u1' }], error: null }))).toHaveLength(1)
    expect(await listVerifications(fakeClient({ data: null, error: null }))).toEqual([])
  })

  it('deleteVerification deletes by discord id', async () => {
    const client = fakeClient({ error: null })
    await deleteVerification('u1', client)
    expect(client.calls).toContainEqual(['delete'])
    expect(client.calls).toContainEqual(['eq', 'discord_user_id', 'u1'])
  })
})
