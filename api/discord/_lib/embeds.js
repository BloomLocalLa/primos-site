const PRIMO_PINK = 0xe91e8c

export function buildStatsEmbed({ floorSol, listedCount, volumeAllSol, holders }) {
  return {
    title: 'PRIMOS — Collection Stats',
    color: PRIMO_PINK,
    fields: [
      { name: 'Floor', value: `${floorSol} SOL`, inline: true },
      { name: 'Listed', value: `${listedCount}`, inline: true },
      { name: 'Holders', value: `${holders}`, inline: true },
      { name: 'Total Volume', value: `${volumeAllSol} SOL`, inline: true },
    ],
    footer: { text: 'Source: Magic Eden' },
  }
}

export function buildAnnounceEmbed({ title, message, image }) {
  const embed = { title, description: message, color: PRIMO_PINK }
  if (image) embed.image = { url: image }
  return embed
}

export function buildLinksEmbed() {
  return {
    title: '🔗 PRIMOS — Official Links',
    color: PRIMO_PINK,
    description:
      'These are our ONLY official links. Never trust links posted by anyone else.\n\n' +
      '🌐 **Website:** https://primos-site.vercel.app/\n' +
      '𝕏 **Twitter/X:** https://x.com/PrimosNFT\n' +
      '✈️ **Telegram:** https://t.me/+WVTm5HcUKb8OMzYx\n' +
      '💬 **Discord:** https://discord.gg/XhCcZNfEVn\n\n' +
      '**Marketplaces**\n' +
      '🟣 Magic Eden: https://magiceden.io/marketplace/primos\n' +
      '⚡ Tensor: https://www.tensor.trade/trade/primos',
  }
}

export function buildVerifyPanelEmbed() {
  return {
    title: '✅ Verify Your Primos',
    color: PRIMO_PINK,
    description:
      'Hold Primos? Tap **Verify Wallet** below to claim your holder role.\n\n' +
      'You’ll connect your Solana wallet and **sign a message** to prove ownership — ' +
      'it’s free, instant, and **never moves your NFTs or funds**.\n\n' +
      '**Holder tiers**\n' +
      '🟢 **Primo** — 1+ Primos\n' +
      '🔵 **Compadre** — 5+\n' +
      '🟣 **Tío** — 10+\n' +
      '👑 **El Jefe** — 25+\n\n' +
      'Your role updates automatically — sell and it’s removed, buy more and you’re upgraded.',
    footer: { text: 'Primos Holder Verification' },
  }
}

// The button row attached to the verify panel. The button is public — anyone can
// click it; the handler issues a private, one-time verification link.
export function verifyPanelComponents() {
  return [{
    type: 1,
    components: [{ type: 2, style: 3, label: 'Verify Wallet', emoji: { name: '✅' }, custom_id: 'verify_start' }],
  }]
}

export function buildSaleEmbed({ priceSol, tokenMint, signature }) {
  return {
    title: '💰 New Primos Sale',
    color: PRIMO_PINK,
    description: `Sold for **${priceSol} SOL**`,
    url: `https://magiceden.io/item-details/${tokenMint}`,
    fields: [{ name: 'Mint', value: tokenMint }],
    footer: { text: signature ? `tx ${signature.slice(0, 8)}…` : 'Magic Eden' },
  }
}
