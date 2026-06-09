import { describe, it, expect, vi } from 'vitest'
import { handleInteraction } from './router.js'

const CFG = {
  MOD_ROLE_ID: 'mod', ANNOUNCE_CHANNEL_ID: 'ann',
  LINKS_CHANNEL_ID: 'links', STATS_CHANNEL_ID: 'stats',
  SALES_CHANNEL_ID: 'sales', COLLECTION_SYMBOL: 'primos',
}
function baseDeps(over = {}) {
  return {
    config: CFG,
    postMessage: vi.fn().mockResolvedValue({ id: 'newmsg' }),
    editMessage: vi.fn().mockResolvedValue({ id: 'm1' }),
    getCollectionStats: vi.fn().mockResolvedValue({ floorSol: 0.02, listedCount: 10, volumeAllSol: 5 }),
    getHolderCount: vi.fn().mockResolvedValue(300),
    getState: vi.fn().mockResolvedValue(null),
    setState: vi.fn().mockResolvedValue(undefined),
    createVerifyLink: vi.fn().mockResolvedValue('https://primos-site.vercel.app/verify?t=abc'),
    ...over,
  }
}
const mod = { roles: ['mod'] }
const nonMod = { roles: ['other'] }

describe('handleInteraction', () => {
  it('responds to PING with type 1', async () => {
    const r = await handleInteraction({ type: 1 }, baseDeps())
    expect(r).toEqual({ type: 1 })
  })

  it('rejects a command from a non-mod (ephemeral)', async () => {
    const r = await handleInteraction(
      { type: 2, member: nonMod, data: { name: 'stats' } }, baseDeps())
    expect(r.data.flags).toBe(64)
    expect(r.data.content).toMatch(/permission/i)
  })

  it('/verify is public — a non-mod gets an ephemeral verify link', async () => {
    const deps = baseDeps()
    const r = await handleInteraction(
      { type: 2, member: { ...nonMod, user: { id: 'u9' } }, data: { name: 'verify' } }, deps)
    expect(deps.createVerifyLink).toHaveBeenCalledWith('u9')
    expect(r.type).toBe(4)
    expect(r.data.flags).toBe(64)
    expect(r.data.content).toContain('/verify?t=abc')
  })

  it('/verify replies "not live yet" when verification is unconfigured', async () => {
    const deps = baseDeps({ createVerifyLink: vi.fn().mockResolvedValue(null) })
    const r = await handleInteraction(
      { type: 2, member: { ...nonMod, user: { id: 'u9' } }, data: { name: 'verify' } }, deps)
    expect(r.data.content).toMatch(/live yet|check back/i)
  })

  it('/stats fetches and returns a stats embed directly', async () => {
    const deps = baseDeps()
    const r = await handleInteraction({ type: 2, member: mod, data: { name: 'stats' } }, deps)
    expect(deps.getCollectionStats).toHaveBeenCalled()
    expect(r.type).toBe(4)
    expect(JSON.stringify(r.data.embeds[0])).toContain('0.02')
  })

  it('/announce returns an ephemeral preview with confirm/cancel buttons', async () => {
    const r = await handleInteraction({
      type: 2, member: mod,
      data: { name: 'announce', options: [
        { name: 'title', value: 'T' }, { name: 'message', value: 'M' }] },
    }, baseDeps())
    expect(r.type).toBe(4)
    expect(r.data.flags).toBe(64)
    expect(r.data.embeds[0].title).toBe('T')
    const btns = r.data.components[0].components
    expect(btns.map((b) => b.custom_id)).toEqual(['confirm:announce', 'cancel'])
  })

  it('confirm:announce posts the preview embed to the announce channel', async () => {
    const deps = baseDeps()
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:announce' },
      message: { embeds: [{ title: 'T', description: 'M' }] },
    }
    const r = await handleInteraction(interaction, deps)
    expect(deps.postMessage).toHaveBeenCalledWith('ann', { embeds: [{ title: 'T', description: 'M' }] })
    expect(r.type).toBe(7)
    expect(r.data.content).toMatch(/posted/i)
  })

  it('cancel clears the preview', async () => {
    const r = await handleInteraction(
      { type: 3, member: mod, data: { custom_id: 'cancel' } }, baseDeps())
    expect(r.type).toBe(7)
    expect(r.data.content).toMatch(/cancel/i)
  })

  it('confirm:links posts a new message and stores its id when none exists', async () => {
    const deps = baseDeps()
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:links' },
      message: { embeds: [{ title: 'Links' }] },
    }
    await handleInteraction(interaction, deps)
    expect(deps.postMessage).toHaveBeenCalledWith('links', { embeds: [{ title: 'Links' }] })
    expect(deps.setState).toHaveBeenCalledWith('links_message_id', { id: 'newmsg' })
  })

  it('confirm:links edits the existing message when an id is stored', async () => {
    const deps = baseDeps({ getState: vi.fn().mockResolvedValue({ id: 'old' }) })
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:links' },
      message: { embeds: [{ title: 'Links' }] },
    }
    await handleInteraction(interaction, deps)
    expect(deps.editMessage).toHaveBeenCalledWith('links', 'old', { embeds: [{ title: 'Links' }] })
  })

  it('confirm:say:CHAN:text posts the embed description as plain content', async () => {
    const deps = baseDeps()
    const interaction = {
      type: 3, member: mod,
      data: { custom_id: 'confirm:say:chanX:text' },
      message: { embeds: [{ description: 'hello there' }] },
    }
    await handleInteraction(interaction, deps)
    expect(deps.postMessage).toHaveBeenCalledWith('chanX', { content: 'hello there' })
  })
})
