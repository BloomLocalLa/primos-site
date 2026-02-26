import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Grid, LayoutGrid, SortAsc, SortDesc,
  RefreshCw, ExternalLink, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import NFTCard from '../components/NFTCard'
import GlitchText from '../components/GlitchText'
import { getListedNFTs, lamportsToSol, getMagicEdenUrl } from '../lib/magiceden'

const filterOptions = {
  background: ['All', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'],
}

export default function Gallery() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('price-asc')
  const [showFilters, setShowFilters] = useState(false)
  const [gridSize, setGridSize] = useState('normal')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [filters, setFilters] = useState({
    background: 'All',
  })
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Fetch NFTs from Magic Eden on mount
  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    setLoading(true)
    try {
      // Fetch multiple batches to get more listings
      const batchSize = 100
      const batches = 4 // Get up to 400 NFTs
      let allListings = []

      for (let i = 0; i < batches; i++) {
        const listings = await getListedNFTs(i * batchSize, batchSize)
        if (listings.length === 0) break
        allListings = [...allListings, ...listings]
        if (listings.length < batchSize) break
      }

      const formattedNFTs = allListings.map((listing, index) => ({
        id: listing.tokenMint || index + 1,
        name: listing.token?.name || `Primo #${index}`,
        image: listing.token?.image || '/artwork/QmaEPHgZct4F3E8y7XMhcYJScFzuowSjW1w6oQbaeYiUSw.avif',
        price: lamportsToSol(listing.price || 0),
        attributes: listing.token?.attributes || [],
        mintAddress: listing.tokenMint || listing.token?.mintAddress,
        rarity: listing.rarity?.meInstant?.rank || null,
      }))
      setNfts(formattedNFTs)
      setHasMore(allListings.length >= batches * batchSize)
    } catch (error) {
      console.error('Failed to fetch NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const listings = await getListedNFTs(nfts.length, 100)
      if (listings.length === 0) {
        setHasMore(false)
        return
      }
      const newNFTs = listings.map((listing, index) => ({
        id: listing.tokenMint || nfts.length + index + 1,
        name: listing.token?.name || `Primo #${nfts.length + index}`,
        image: listing.token?.image || '/artwork/QmaEPHgZct4F3E8y7XMhcYJScFzuowSjW1w6oQbaeYiUSw.avif',
        price: lamportsToSol(listing.price || 0),
        attributes: listing.token?.attributes || [],
        mintAddress: listing.tokenMint || listing.token?.mintAddress,
        rarity: listing.rarity?.meInstant?.rank || null,
      }))
      setNfts([...nfts, ...newNFTs])
      setHasMore(listings.length === 100)
    } catch (error) {
      console.error('Failed to load more NFTs:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Filter and sort NFTs
  const filteredNFTs = nfts
    .filter((nft) => {
      if (searchQuery && !nft.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price)
        default:
          return 0
      }
    })

  const refreshData = async () => {
    await fetchNFTs()
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-5xl md:text-7xl text-white mb-4">
            <GlitchText text="GALLERY" />
          </h1>
          <p className="text-static-gray font-mono">
            Browse all 2,746 Primos. Click to view details or buy on Magic Eden.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-static-gray" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black border-2 border-white text-white font-mono placeholder:text-static-gray focus:border-primo-pink outline-none transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 border-2 font-display tracking-wider flex items-center gap-2 transition-colors ${
              showFilters
                ? 'border-primo-pink bg-primo-pink text-black'
                : 'border-white text-white hover:border-primo-pink'
            }`}
          >
            <Filter size={20} />
            FILTERS
          </motion.button>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-6 py-3 bg-black border-2 border-white text-white font-mono cursor-pointer hover:border-primo-cyan transition-colors"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rarity">Rarity</option>
          </select>

          {/* Grid Size Toggle */}
          <div className="flex border-2 border-white">
            <button
              onClick={() => setGridSize('normal')}
              className={`p-3 transition-colors ${
                gridSize === 'normal' ? 'bg-primo-cyan text-black' : 'text-white hover:bg-white/10'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setGridSize('large')}
              className={`p-3 transition-colors ${
                gridSize === 'large' ? 'bg-primo-cyan text-black' : 'text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={loading}
            className="p-3 border-2 border-white text-white hover:border-primo-green hover:text-primo-green transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="p-6 bg-static-dark border-2 border-primo-pink">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(filterOptions).map(([key, options]) => (
                    <div key={key}>
                      <label className="block font-display text-white mb-2 uppercase">
                        {key}
                      </label>
                      <select
                        value={filters[key]}
                        onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                        className="w-full px-4 py-2 bg-black border-2 border-white text-white font-mono cursor-pointer"
                      >
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setFilters({ rarity: 'All', background: 'All', eyes: 'All' })}
                    className="text-primo-cyan font-mono text-sm hover:text-primo-pink transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="mb-6 text-static-gray font-mono">
          Showing {filteredNFTs.length} of {nfts.length} Primos
        </div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block">
              <RefreshCw size={48} className="animate-spin text-primo-pink mx-auto mb-4" />
            </div>
            <p className="text-static-gray font-mono">Loading Primos from Magic Eden...</p>
          </motion.div>
        )}

        {/* NFT Grid */}
        {!loading && (
          <div
            className={`grid gap-6 ${
              gridSize === 'large'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}
          >
            {filteredNFTs.map((nft, index) => (
              <div key={nft.id} onClick={() => setSelectedNFT(nft)} className="cursor-pointer">
                <NFTCard nft={nft} index={index} />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && filteredNFTs.length > 0 && (
          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-4 bg-black border-4 border-primo-pink text-white font-display tracking-wider hover:bg-primo-pink hover:text-black transition-all disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={20} className="animate-spin" />
                  LOADING...
                </span>
              ) : (
                'LOAD MORE PRIMOS'
              )}
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNFTs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📺</div>
            <p className="text-static-gray font-mono">No Primos found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({ rarity: 'All', background: 'All', eyes: 'All' })
              }}
              className="mt-4 text-primo-cyan hover:text-primo-pink transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* NFT Detail Modal */}
        <AnimatePresence>
          {selectedNFT && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNFT(null)}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-4 md:inset-20 z-50 bg-black border-4 border-white overflow-auto"
              >
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="absolute top-4 right-4 p-2 text-white hover:text-primo-pink transition-colors z-10"
                >
                  <X size={32} />
                </button>

                <div className="grid md:grid-cols-2 min-h-full">
                  {/* Image */}
                  <div className="relative aspect-square md:aspect-auto">
                    <img
                      src={selectedNFT.image}
                      alt={selectedNFT.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-8">
                    <h2 className="font-display text-4xl text-white mb-2">{selectedNFT.name}</h2>

                    <div className="flex items-center gap-4 mb-8">
                      <span className={`px-3 py-1 font-display text-sm uppercase ${
                        selectedNFT.rarity === 'legendary' ? 'bg-primo-yellow text-black' :
                        selectedNFT.rarity === 'epic' ? 'bg-primo-purple text-white' :
                        selectedNFT.rarity === 'rare' ? 'bg-primo-cyan text-black' :
                        'bg-static-gray text-black'
                      }`}>
                        {selectedNFT.rarity}
                      </span>
                      <span className="text-primo-cyan font-mono text-2xl">◎ {selectedNFT.price}</span>
                    </div>

                    {/* Attributes */}
                    <div className="mb-8">
                      <h3 className="font-display text-white mb-4">ATTRIBUTES</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedNFT.attributes.map((attr, i) => (
                          <div
                            key={i}
                            className="p-3 bg-static-dark border border-static-gray"
                          >
                            <div className="text-static-gray text-xs font-mono mb-1">
                              {attr.trait_type}
                            </div>
                            <div className="text-white font-display">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <motion.a
                        href={`https://magiceden.io/item-details/${selectedNFT.mintAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-primo-pink to-primo-purple text-white font-display tracking-wider flex items-center justify-center gap-2 border-2 border-white"
                      >
                        <ExternalLink size={20} />
                        BUY ON MAGIC EDEN
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
