const ME_BASE = 'https://api-mainnet.magiceden.dev/v2'

export function lamportsToSol(lamports) {
  return Math.round((lamports / 1e9) * 1000) / 1000
}

export async function getCollectionStats(symbol, fetchImpl = fetch) {
  const res = await fetchImpl(`${ME_BASE}/collections/${symbol}/stats`)
  if (!res.ok) throw new Error(`ME stats failed: ${res.status}`)
  const d = await res.json()
  return {
    floorSol: lamportsToSol(d.floorPrice || 0),
    listedCount: d.listedCount || 0,
    volumeAllSol: lamportsToSol(d.volumeAll || 0),
  }
}

export async function getHolderCount(symbol, fetchImpl = fetch) {
  const res = await fetchImpl(`${ME_BASE}/collections/${symbol}/holder_stats`)
  if (!res.ok) throw new Error(`ME holder_stats failed: ${res.status}`)
  const d = await res.json()
  return d.uniqueHolders || d.totalSupply || 0
}

// Returns sales (buyNow) strictly newer than sinceBlockTime, oldest first.
export async function getRecentSales(symbol, sinceBlockTime, fetchImpl = fetch) {
  const res = await fetchImpl(`${ME_BASE}/collections/${symbol}/activities?offset=0&limit=100`)
  if (!res.ok) throw new Error(`ME activities failed: ${res.status}`)
  const activities = await res.json()
  return activities
    .filter((a) => a.type === 'buyNow' && (a.blockTime || 0) > (sinceBlockTime || 0))
    .map((a) => ({
      signature: a.signature,
      priceSol: a.price,
      tokenMint: a.tokenMint,
      blockTime: a.blockTime,
    }))
    .sort((a, b) => a.blockTime - b.blockTime)
}
