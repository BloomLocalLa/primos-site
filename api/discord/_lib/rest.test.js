import { describe, it, expect, vi } from 'vitest'
import { postMessage, editMessage, getGuildMember, addGuildMemberRole, removeGuildMemberRole } from './rest.js'

describe('discord rest', () => {
  it('postMessage POSTs to the channel with bot auth and JSON body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'm1' }) })
    const out = await postMessage('chan1', { content: 'hi' }, { token: 'tok', fetchImpl })
    expect(out.id).toBe('m1')
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('/channels/chan1/messages')
    expect(opts.method).toBe('POST')
    expect(opts.headers.Authorization).toBe('Bot tok')
    expect(JSON.parse(opts.body)).toEqual({ content: 'hi' })
  })

  it('editMessage PATCHes the specific message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'm1' }) })
    await editMessage('chan1', 'm1', { content: 'edited' }, { token: 'tok', fetchImpl })
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('/channels/chan1/messages/m1')
    expect(opts.method).toBe('PATCH')
  })

  it('throws on non-ok response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => 'no' })
    await expect(postMessage('c', {}, { token: 't', fetchImpl })).rejects.toThrow(/403/)
  })

  it('addGuildMemberRole PUTs and tolerates 204 No Content', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    const out = await addGuildMemberRole('g1', 'u1', 'r1', { token: 'tok', fetchImpl })
    expect(out).toBeNull()
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('/guilds/g1/members/u1/roles/r1')
    expect(opts.method).toBe('PUT')
    expect(opts.headers.Authorization).toBe('Bot tok')
  })

  it('removeGuildMemberRole DELETEs the role', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    await removeGuildMemberRole('g1', 'u1', 'r1', { token: 'tok', fetchImpl })
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('/guilds/g1/members/u1/roles/r1')
    expect(opts.method).toBe('DELETE')
  })

  it('getGuildMember GETs the member JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ roles: ['r1'] }) })
    const m = await getGuildMember('g1', 'u1', { token: 'tok', fetchImpl })
    expect(m.roles).toEqual(['r1'])
  })
})
