// Count how many Primos a wallet holds, via the Helius DAS `searchAssets` RPC
// method (free-tier-friendly: one DAS call per check).
//
// v1 is WALLET-HELD ONLY: a Primo listed for sale sits in the marketplace's
// escrow account, so `ownerAddress` no longer matches the seller and it won't be
// counted until delisted. Listed/escrow-aware counting is a documented v2.

const heliusRpcUrl = (apiKey) => `https://mainnet.helius-rpc.com/?api-key=${apiKey}`

export async function countPrimos(wallet, { apiKey, collection, fetchImpl = fetch } = {}) {
  if (!apiKey) throw new Error('countPrimos: missing Helius apiKey')
  if (!collection) throw new Error('countPrimos: missing collection address')

  const res = await fetchImpl(heliusRpcUrl(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'primos-holder-check',
      method: 'searchAssets',
      params: {
        ownerAddress: wallet,
        grouping: ['collection', collection],
        page: 1,
        limit: 1000,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Helius searchAssets failed: ${res.status} ${detail}`)
  }
  const json = await res.json()
  if (json.error) throw new Error(`Helius error: ${JSON.stringify(json.error)}`)

  const result = json.result || {}
  // `total` reflects the full match count; items length is the fallback.
  return typeof result.total === 'number' ? result.total : (result.items || []).length
}
