import nacl from 'tweetnacl'

function hexToUint8(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

export function verifyDiscordSignature(rawBody, signature, timestamp, publicKeyHex) {
  if (!signature || !timestamp || !rawBody || !publicKeyHex) return false
  try {
    const message = new TextEncoder().encode(timestamp + rawBody)
    return nacl.sign.detached.verify(
      message,
      hexToUint8(signature),
      hexToUint8(publicKeyHex),
    )
  } catch {
    return false
  }
}
