import { describe, it, expect } from 'vitest'
import { Keypair } from '@solana/web3.js'
import nacl from 'tweetnacl'
import { verifyWalletSignature } from './wallet.js'

// Sign `message` with a Solana keypair the way a wallet would, returning the
// base64 signature the client sends us.
function signAs(message, keypair) {
  const sig = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey)
  return Buffer.from(sig).toString('base64')
}

describe('verifyWalletSignature', () => {
  const kp = Keypair.generate()
  const addr = kp.publicKey.toBase58()
  const message = 'Primos holder verification\nDiscord: 123456\nNonce: abc-def'

  it('accepts a valid signature from the wallet', () => {
    expect(verifyWalletSignature(message, signAs(message, kp), addr)).toBe(true)
  })

  it('rejects a signature over a different message (replay/tamper)', () => {
    expect(verifyWalletSignature('different challenge', signAs(message, kp), addr)).toBe(false)
  })

  it('rejects a valid signature presented under another wallet', () => {
    const other = Keypair.generate()
    expect(verifyWalletSignature(message, signAs(message, kp), other.publicKey.toBase58())).toBe(false)
  })

  it('rejects a malformed wallet address', () => {
    expect(verifyWalletSignature(message, signAs(message, kp), 'not-a-real-address')).toBe(false)
  })

  it('rejects a garbage / wrong-length signature', () => {
    expect(verifyWalletSignature(message, Buffer.from('too short').toString('base64'), addr)).toBe(false)
  })

  it('rejects missing inputs', () => {
    expect(verifyWalletSignature('', '', '')).toBe(false)
    expect(verifyWalletSignature(message, null, addr)).toBe(false)
  })
})
