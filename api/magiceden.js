// Vercel Serverless Function to proxy Magic Eden API requests
// This bypasses CORS restrictions in the browser

const ME_API_BASE = 'https://api-mainnet.magiceden.dev/v2'
const COLLECTION_SYMBOL = 'primos'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { endpoint } = req.query

  try {
    let url

    switch (endpoint) {
      case 'stats':
        url = `${ME_API_BASE}/collections/${COLLECTION_SYMBOL}/stats`
        break
      case 'listings':
        const offset = req.query.offset || 0
        const limit = Math.min(req.query.limit || 100, 500) // Max 500 per request
        url = `${ME_API_BASE}/collections/${COLLECTION_SYMBOL}/listings?offset=${offset}&limit=${limit}`
        break
      case 'activities':
        const actLimit = req.query.limit || 10
        url = `${ME_API_BASE}/collections/${COLLECTION_SYMBOL}/activities?offset=0&limit=${actLimit}`
        break
      case 'amm-pools':
        url = `${ME_API_BASE}/mmm/pools?collectionSymbol=${COLLECTION_SYMBOL}`
        break
      default:
        return res.status(400).json({ error: 'Invalid endpoint' })
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status}`)
    }

    const data = await response.json()

    // Cache for 60 seconds
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

    return res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({ error: error.message })
  }
}
