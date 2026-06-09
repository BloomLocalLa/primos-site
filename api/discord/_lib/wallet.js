import nacl from 'tweetnacl'
import { PublicKey } from '@solana/web3.js'

// Prove a member owns a Solana wallet by verifying an ed25519 signature over a
// server-issued challenge. Solana wallets sign with ed25519 — the same primitive
// tweetnacl exposes (and that this codebase already uses for Discord requests).
//
// This is ownership proof ONLY: no transaction is signed, no funds move, and we
// never see a private key or seed phrase.
//
//  - message:          the exact challenge string the wallet signed
//  - signatureBase64:  the signature bytes, base64-encoded by the client
//  - walletAddress:    the base58 Solana address claiming ownership
export function verifyWalletSignature(message, signatureBase64, walletAddress) {
  try {
    if (!message || !signatureBase64 || !walletAddress) return false
    const msg = new TextEncoder().encode(message)
    const sig = Uint8Array.from(Buffer.from(signatureBase64, 'base64'))
    if (sig.length !== 64) return false
    const pub = new PublicKey(walletAddress).toBytes() // throws on a malformed address
    return nacl.sign.detached.verify(msg, sig, pub)
  } catch {
    return false
  }
}
