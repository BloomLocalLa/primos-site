import { describe, it, expect } from 'vitest'
import { buildStatsEmbed, buildAnnounceEmbed, buildLinksEmbed, buildSaleEmbed } from './embeds.js'

describe('embeds', () => {
  it('buildStatsEmbed includes floor, listed, volume, holders', () => {
    const e = buildStatsEmbed({ floorSol: 0.022, listedCount: 120, volumeAllSol: 540.5, holders: 300 })
    const text = JSON.stringify(e)
    expect(text).toContain('0.022')
    expect(text).toContain('120')
    expect(text).toContain('540.5')
    expect(text).toContain('300')
  })

  it('buildAnnounceEmbed sets title, description, optional image', () => {
    const e = buildAnnounceEmbed({ title: 'Mint Live', message: 'Now!', image: 'https://x/y.png' })
    expect(e.title).toBe('Mint Live')
    expect(e.description).toBe('Now!')
    expect(e.image.url).toBe('https://x/y.png')
  })

  it('buildAnnounceEmbed omits image when not provided', () => {
    const e = buildAnnounceEmbed({ title: 'T', message: 'M' })
    expect(e.image).toBeUndefined()
  })

  it('buildLinksEmbed contains the verified official links', () => {
    const text = JSON.stringify(buildLinksEmbed())
    expect(text).toContain('primos-site.vercel.app')
    expect(text).toContain('discord.gg/XhCcZNfEVn')
    expect(text).toContain('magiceden.io/marketplace/primos')
    expect(text).toContain('tensor.trade/trade/primos')
    expect(text).toContain('x.com/PrimosNFT')
  })

  it('buildSaleEmbed shows price and links to the token', () => {
    const e = buildSaleEmbed({ priceSol: 0.05, tokenMint: 'MINT123', signature: 'SIG' })
    const text = JSON.stringify(e)
    expect(text).toContain('0.05')
    expect(text).toContain('MINT123')
  })
})
