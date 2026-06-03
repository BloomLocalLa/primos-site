import { describe, it, expect, vi } from 'vitest'
import { getState, setState } from './state.js'

function fakeClient(row) {
  return {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }
}

describe('state helpers', () => {
  it('getState returns the stored value for a key', async () => {
    const client = fakeClient({ key: 'sales_cursor', value: { blockTime: 123 } })
    expect(await getState('sales_cursor', client)).toEqual({ blockTime: 123 })
  })

  it('getState returns null when no row exists', async () => {
    const client = fakeClient(null)
    expect(await getState('missing', client)).toBeNull()
  })

  it('setState upserts the key/value', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    const client = { from: () => ({ upsert }) }
    await setState('links_message_id', { id: 'm1' }, client)
    expect(upsert).toHaveBeenCalledWith(
      { key: 'links_message_id', value: { id: 'm1' } },
      { onConflict: 'key' },
    )
  })
})
