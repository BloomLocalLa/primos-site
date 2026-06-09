import { describe, it, expect, vi } from 'vitest'
import { countPrimos } from './helius.js'

const ok = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
  text: async () => JSON.stringify(body),
})

describe('countPrimos', () => {
  it('returns result.total when present', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ result: { total: 7, items: [] } }))
    expect(await countPrimos('WALLET', { apiKey: 'k', collection: 'COL', fetchImpl })).toBe(7)
  })

  it('falls back to items length when total is missing', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ result: { items: [{}, {}, {}] } }))
    expect(await countPrimos('W', { apiKey: 'k', collection: 'C', fetchImpl })).toBe(3)
  })

  it('queries Helius with ownerAddress + collection grouping', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ result: { total: 0, items: [] } }))
    await countPrimos('WALLET', { apiKey: 'KEY', collection: 'COLADDR', fetchImpl })
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('api-key=KEY')
    const sent = JSON.parse(opts.body)
    expect(sent.method).toBe('searchAssets')
    expect(sent.params.ownerAddress).toBe('WALLET')
    expect(sent.params.grouping).toEqual(['collection', 'COLADDR'])
  })

  it('throws on a Helius error payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ error: { message: 'bad' } }))
    await expect(countPrimos('W', { apiKey: 'k', collection: 'c', fetchImpl })).rejects.toThrow(/Helius error/)
  })

  it('throws on non-ok HTTP', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom' })
    await expect(countPrimos('W', { apiKey: 'k', collection: 'c', fetchImpl })).rejects.toThrow(/500/)
  })

  it('requires apiKey and collection', async () => {
    await expect(countPrimos('W', { collection: 'c' })).rejects.toThrow(/apiKey/)
    await expect(countPrimos('W', { apiKey: 'k' })).rejects.toThrow(/collection/)
  })
})
