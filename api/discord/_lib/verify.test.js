import { describe, it, expect } from 'vitest'
import nacl from 'tweetnacl'
import { verifyDiscordSignature } from './verify.js'

function hex(uint8) {
  return Buffer.from(uint8).toString('hex')
}

describe('verifyDiscordSignature', () => {
  const pair = nacl.sign.keyPair()
  const publicKeyHex = hex(pair.publicKey)
  const timestamp = '1700000000'
  const body = JSON.stringify({ type: 1 })

  it('returns true for a valid signature', () => {
    const message = Buffer.from(timestamp + body)
    const sig = hex(nacl.sign.detached(message, pair.secretKey))
    expect(verifyDiscordSignature(body, sig, timestamp, publicKeyHex)).toBe(true)
  })

  it('returns false for a tampered body', () => {
    const message = Buffer.from(timestamp + body)
    const sig = hex(nacl.sign.detached(message, pair.secretKey))
    expect(verifyDiscordSignature('{"type":2}', sig, timestamp, publicKeyHex)).toBe(false)
  })

  it('returns false for missing signature/timestamp', () => {
    expect(verifyDiscordSignature(body, undefined, timestamp, publicKeyHex)).toBe(false)
    expect(verifyDiscordSignature(body, 'aa', undefined, publicKeyHex)).toBe(false)
  })
})
