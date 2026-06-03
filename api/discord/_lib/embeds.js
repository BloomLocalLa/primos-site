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
