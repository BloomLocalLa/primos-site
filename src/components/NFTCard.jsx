import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Eye, Sparkles } from 'lucide-react'

export default function NFTCard({ nft, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const {
    name = 'Primo #???',
    image = '/placeholder-nft.png',
    price,
    rarity,
    attributes = [],
    mintAddress,
  } = nft || {}

  // Get border color based on rarity rank
  const getBorderColor = () => {
    if (rarity && rarity <= 100) return '#FFD700' // Gold - Legendary
    if (rarity && rarity <= 500) return '#9D4EDD' // Purple - Epic
    if (rarity && rarity <= 1000) return '#00CED1' // Cyan - Rare
    if (rarity && rarity <= 2000) return '#32CD32' // Green - Uncommon
    return '#FFFFFF' // White - Common
  }

  const getGlowColor = () => {
    if (rarity && rarity <= 100) return '0 0 15px rgba(255,215,0,0.4)'
    if (rarity && rarity <= 500) return '0 0 15px rgba(157,78,221,0.4)'
    if (rarity && rarity <= 1000) return '0 0 15px rgba(0,206,209,0.4)'
    if (rarity && rarity <= 2000) return '0 0 10px rgba(50,205,50,0.3)'
    return 'none'
  }

  const getRarityLabel = () => {
    if (rarity && rarity <= 100) return 'LEGENDARY'
    if (rarity && rarity <= 500) return 'EPIC'
    if (rarity && rarity <= 1000) return 'RARE'
    if (rarity && rarity <= 2000) return 'UNCOMMON'
    return 'COMMON'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.05, type: 'spring' }}
      whileHover={{ scale: 1.05, rotate: 2, zIndex: 10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Card */}
      <div
        className={`relative bg-black overflow-hidden ${
          rarity && rarity <= 100 ? 'legendary-card' :
          rarity && rarity <= 500 ? 'epic-card' : ''
        }`}
        style={{
          border: `4px solid ${getBorderColor()}`,
        }}
      >
        {/* Glitch Effect on Hover */}
        {isHovered && (
          <>
            <div className="absolute inset-0 bg-primo-red/20 translate-x-1 z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-primo-cyan/20 -translate-x-1 z-10 pointer-events-none" />
          </>
        )}

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-static-dark">
          {/* Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-primo-pink border-t-transparent rounded-full"
              />
            </div>
          )}

          <motion.img
            src={image}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110 saturate-150' : 'scale-100 saturate-100'}`}
          />

          {/* Scanline Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent bg-[length:100%_4px] pointer-events-none" />

          {/* Rarity Badge */}
          {rarity && (
            <div
              className="absolute top-2 right-2 px-2 py-1 text-xs font-display uppercase tracking-wider"
              style={{
                backgroundColor: getBorderColor(),
                color: rarity <= 500 ? '#FFFFFF' : '#000000'
              }}
            >
              {getRarityLabel()}
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute bottom-2 left-2 right-2 flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-1 py-2 bg-black/80 text-white text-xs font-display flex items-center justify-center gap-1 border border-white hover:bg-primo-pink hover:border-primo-pink transition-colors"
            >
              <Eye size={14} />
              VIEW
            </motion.button>
            <motion.a
              href={`https://magiceden.io/item-details/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-1 py-2 bg-primo-cyan text-black text-xs font-display flex items-center justify-center gap-1 border border-primo-cyan hover:bg-white transition-colors"
            >
              <ExternalLink size={14} />
              BUY
            </motion.a>
          </motion.div>
        </div>

        {/* Info Section */}
        <div className="p-3" style={{ borderTop: `4px solid ${getBorderColor()}` }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-white truncate">{name}</h3>
            {isHovered && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-primo-yellow"
              >
                <Sparkles size={16} />
              </motion.div>
            )}
          </div>

          {price && (
            <div className="flex items-center gap-2">
              <span className="text-primo-cyan font-mono text-sm">◎ {price}</span>
              <span className="text-static-gray text-xs">SOL</span>
            </div>
          )}

          {/* Attributes Preview */}
          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {attributes.slice(0, 3).map((attr, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-static-dark text-xs text-static-gray border border-static-gray/30"
                >
                  {attr.value}
                </span>
              ))}
              {attributes.length > 3 && (
                <span className="px-1.5 py-0.5 text-xs text-primo-pink">+{attributes.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primo-pink" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primo-cyan" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primo-cyan" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primo-pink" />
      </div>
    </motion.div>
  )
}
