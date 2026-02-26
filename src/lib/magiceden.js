// Magic Eden API Service for Primos NFT Collection

const ME_API_BASE = 'https://api-mainnet.magiceden.dev/v2'
const COLLECTION_SYMBOL = 'primos' // Update with actual collection symbol

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
    const response = await fetch(
      `${ME_API_BASE}/collections/${COLLECTION_SYMBOL}/stats`
    )

    if (!response.ok) throw new Error('Failed to fetch collection stats')

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching collection stats:', error)
    // Return fallback data
    return {
      symbol: COLLECTION_SYMBOL,
      floorPrice: 0.5 * 1e9, // In lamports
      listedCount: 100,
      volumeAll: 2500 * 1e9,
      avgPrice24hr: 0.8 * 1e9,
    }
  }
}

// Fetch listed NFTs
export async function getListedNFTs(offset = 0, limit = 20) {
  const cacheKey = `listed-${offset}-${limit}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${ME_API_BASE}/collections/${COLLECTION_SYMBOL}/listings?offset=${offset}&limit=${limit}`
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
      `${ME_API_BASE}/collections/${COLLECTION_SYMBOL}/activities?offset=0&limit=${limit}`
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

// Fetch single NFT details
export async function getNFTDetails(mintAddress) {
  const cacheKey = `nft-${mintAddress}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `${ME_API_BASE}/tokens/${mintAddress}`
    )

    if (!response.ok) throw new Error('Failed to fetch NFT details')

    const data = await response.json()
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching NFT details:', error)
    return null
  }
}

// Search NFTs by attributes
export async function searchByAttributes(attributes = {}) {
  try {
    const queryParams = new URLSearchParams()

    Object.entries(attributes).forEach(([key, value]) => {
      if (value && value !== 'All') {
        queryParams.append(`attributes[${key}]`, value)
      }
    })

    const response = await fetch(
      `${ME_API_BASE}/collections/${COLLECTION_SYMBOL}/listings?${queryParams.toString()}`
    )

    if (!response.ok) throw new Error('Failed to search NFTs')

    return await response.json()
  } catch (error) {
    console.error('Error searching NFTs:', error)
    return []
  }
}

// Format lamports to SOL
export function lamportsToSol(lamports) {
  return (lamports / 1e9).toFixed(2)
}

// Get Magic Eden listing URL
export function getMagicEdenUrl(mintAddress) {
  return `https://magiceden.io/item-details/${mintAddress}`
}

// Get collection URL
export function getCollectionUrl() {
  return `https://magiceden.io/marketplace/${COLLECTION_SYMBOL}`
}
