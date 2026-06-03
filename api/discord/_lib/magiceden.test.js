import { describe, it, expect, vi } from 'vitest'
import { lamportsToSol, getCollectionStats, getRecentSales } from './magiceden.js'

const okJson = (data) => ({ ok: true, json: async () => data })

describe('magiceden helpers', () => {
  it('lamportsToSol converts and rounds', () => {
    expect(lamportsToSol(1_000_000_000)).toBe(1)
    expect(lamportsToSol(22_000_000)).toBeCloseTo(0.022)
  })

  it('getCollectionStats maps ME stats to SOL', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson({
      floorPrice: 22_000_000, listedCount: 120, volumeAll: 540_000_000_000,
    }))
    const stats = await getCollectionStats('primos', fetchImpl)
    expect(stats.floorSol).toBeCloseTo(0.022)
    expect(stats.listedCount).toBe(120)
    expect(stats.volumeAllSol).toBeCloseTo(540)
  })

  it('getRecentSales returns only buyNow newer than the cursor, ascending', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okJson([
      { type: 'buyNow', signature: 'b', price: 0.05, tokenMint: 'M2', blockTime: 200 },
      { type: 'list',   signature: 'x', price: 0.04, tokenMint: 'M3', blockTime: 150 },
      { type: 'buyNow', signature: 'a', price: 0.03, tokenMint: 'M1', blockTime: 100 },
    ]))
    const sales = await getRecentSales('primos', 100, fetchImpl)
    expect(sales.map((s) => s.signature)).toEqual(['b'])
    expect(sales[0].priceSol).toBeCloseTo(0.05)
  })
})
