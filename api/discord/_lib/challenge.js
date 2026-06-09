// The exact message a member signs with their wallet. It must be byte-identical
// when issued (challenge) and when checked (complete), so it lives in one place.
// Embedding the Discord ID + single-use nonce binds the signature to this one
// request and this one user — it can't be replayed for anyone else.
export function buildChallengeMessage({ discordUserId, nonce }) {
  return [
    'Primos holder verification',
    'Signing proves you own this wallet. It is free and authorizes no transaction.',
    `Discord: ${discordUserId}`,
    `Nonce: ${nonce}`,
  ].join('\n')
}
