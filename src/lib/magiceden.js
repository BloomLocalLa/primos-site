// Magic Eden API Service for Primos NFT Collection
// Uses Vercel serverless function as proxy to avoid CORS issues

// Use relative path for the API proxy (works on both localhost and production)
const API_PROXY = '/api/magiceden'

// Cache for API responses
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Fetch collection stats
export async function getCollectionStats() {
  const cacheKey = 'collection-stats'
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`${API_PROXY}?endpoint=stats`)

    if (!response.ok) throw new Error('Failed to fetch collection stats')

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching collection stats:', error)
    // Return fallback data
    return {
      symbol: 'primos',
      floorPrice: 16000000, // 0.016 SOL in lamports
      listedCount: 366,
      volumeAll: 798000000000,
      avgPrice24hr: 20000000,
    }
  }
}

// Fetch listed NFTs
export async function getListedNFTs(offset = 0, limit = 50) {
  const cacheKey = `listed-${offset}-${limit}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${API_PROXY}?endpoint=listings&offset=${offset}&limit=${limit}`
    )

    if (!response.ok) throw new Error('Failed to fetch listings')

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching listings:', error)
    return []
  }
}

// Fetch recent activities (sales, listings)
export async function getRecentActivities(limit = 10) {
  const cacheKey = `activities-${limit}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${API_PROXY}?endpoint=activities&limit=${limit}`
    )

    if (!response.ok) throw new Error('Failed to fetch activities')

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

// Format lamports to SOL
export function lamportsToSol(lamports) {
  return (lamports / 1e9).toFixed(3)
}

// Get Magic Eden listing URL
export function getMagicEdenUrl(mintAddress) {
  return `https://magiceden.io/item-details/${mintAddress}`
}

// Get collection URL
export function getCollectionUrl() {
  return `https://magiceden.io/marketplace/primos`
}

// Fetch AMM pool listings
export async function getAMMPoolListings() {
  const cacheKey = 'amm-pools'
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`${API_PROXY}?endpoint=amm-pools`)

    if (!response.ok) throw new Error('Failed to fetch AMM pools')

    const data = await response.json()

    // Extract NFTs from pools that have sellsideAssetAmount > 0
    const poolNFTs = []
    if (data.results) {
      for (const pool of data.results) {
        if (pool.sellsideAssetAmount > 0 && pool.mints && pool.mints.length > 0) {
          for (const mint of pool.mints) {
            poolNFTs.push({
              tokenMint: mint,
              price: pool.spotPrice / 1e9, // Convert lamports to SOL
              source: 'amm',
              poolKey: pool.poolKey,
            })
          }
        }
      }
    }

    setCache(cacheKey, poolNFTs)
    return poolNFTs
  } catch (error) {
    console.error('Error fetching AMM pools:', error)
    return []
  }
}
