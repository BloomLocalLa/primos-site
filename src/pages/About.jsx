import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Sparkles, Users, Palette, Coffee, Moon, Sun,
  Gamepad2, Music, MessageCircle, Twitter, ExternalLink,
  ChevronRight, Quote, RefreshCw, X
} from 'lucide-react'
import GlitchText from '../components/GlitchText'
import { getListedNFTs, getTokenMetadata } from '../lib/magiceden'

// Timeline milestones
const timeline = [
  { year: '2024', title: 'THE SPARK', description: 'Lordio begins sketching the first Primo characters, inspired by 90s pixel art and street culture.' },
  { year: 'OCT 25, 2024', title: 'MINT DAY', description: '2,746 Primos find their forever homes. The community is born.' },
  { year: '2024', title: 'DIAMOND HANDS', description: '72% of Primos stay unlisted. True believers hold strong from day one.' },
  { year: '2025', title: 'THE FUTURE', description: 'New chapter begins. Website launch. More to come...' },
]

// Day in the life scenes
const dayScenes = [
  { time: '6 AM', icon: Sun, title: 'WAKE UP', description: 'Early morning vibes. Coffee brewing. Checking the floor.', color: 'primo-yellow' },
  { time: '9 AM', icon: Coffee, title: 'GM', description: 'Dropping GMs in Discord. Vibing with the fam.', color: 'primo-pink' },
  { time: '12 PM', icon: Gamepad2, title: 'GAMING', description: 'Lunch break gaming session. Primos stay competitive.', color: 'primo-cyan' },
  { time: '6 PM', icon: Music, title: 'CHILL', description: 'Lo-fi beats. Creating art. Living the dream.', color: 'primo-purple' },
  { time: '11 PM', icon: Moon, title: 'LATE NIGHT', description: 'Scrolling Twitter. Finding alpha. Never sleeping.', color: 'primo-pink' },
]

// Lore sections
const loreChapters = [
  {
    title: 'ORIGIN',
    text: 'In the digital realm of Solana, 2,746 unique beings emerged from the blockchain. They call themselves Primos — cousins, family, connected by code and community.',
  },
  {
    title: 'THE COMMUNITY',
    text: 'Primos don\'t just exist — they belong. Each one is part of something bigger. A community within communities. They find each other across Discord servers, Twitter threads, and IRL meetups.',
  },
  {
    title: 'THE BOND',
    text: 'When you hold a Primo, you\'re not just holding a JPEG. You\'re holding a membership to a family that looks out for each other. Diamond hands aren\'t just a meme here — they\'re a way of life.',
  },
]

// Artwork for showcase
const showcaseArt = [
  '/artwork/QmaEPHgZct4F3E8y7XMhcYJScFzuowSjW1w6oQbaeYiUSw.avif',
  '/artwork/QmamhGh1LjF6tTdWZerkVQjtQVkcThminw57MB3RgU9JVc.avif',
  '/artwork/QmbEf76maCZRCUEB8ddGQHHP4iDpr5bPY5aCk25KjRYvSn.avif',
  '/artwork/QmcjHTh9pyhzSieqCDx5xTu48oUkYvVsHega2LrrDzuUUj.avif',
  '/artwork/QmR6oggbP6jQQ58vcq4v9MnVqdyzcLdVop2txioTNQHd8M.avif',
]

export default function About() {
  const [selectedTraits, setSelectedTraits] = useState({})
  const [activeLore, setActiveLore] = useState(0)
  const [allNFTs, setAllNFTs] = useState([])
  const [traitCategories, setTraitCategories] = useState({})
  const [matchingNFTs, setMatchingNFTs] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch NFTs and extract trait data
  useEffect(() => {
    async function fetchNFTs() {
      try {
        // First, get listings
        const listings = await getListedNFTs(0, 100)

        if (!listings || listings.length === 0) {
          console.log('No listings returned')
          setLoading(false)
          return
        }

        // Fetch detailed metadata for first 30 NFTs to get attributes
        const metadataPromises = listings.slice(0, 30).map(listing =>
          getTokenMetadata(listing.tokenMint)
        )
        const metadataResults = await Promise.all(metadataPromises)

        // Process NFTs with metadata
        const processed = listings.map((listing, index) => {
          let imageUrl = listing.token?.image || showcaseArt[0]
          if (imageUrl.startsWith('ipfs://')) {
            imageUrl = imageUrl.replace('ipfs://', 'https://nftstorage.link/ipfs/')
          }

          // Get attributes from metadata if available
          const metadata = index < 30 ? metadataResults[index] : null
          const attributes = metadata?.attributes || listing.token?.attributes || []

          return {
            id: listing.tokenMint,
            name: listing.token?.name || metadata?.name || 'Primo',
            image: metadata?.image ?
              (metadata.image.startsWith('ipfs://') ?
                metadata.image.replace('ipfs://', 'https://nftstorage.link/ipfs/') :
                metadata.image) :
              imageUrl,
            price: listing.price || 0,
            rarity: listing.rarity?.meInstant?.rank,
            attributes: attributes,
            mintAddress: listing.tokenMint,
          }
        })

        setAllNFTs(processed)

        // Extract unique trait categories and values from NFTs with attributes
        const categories = {}
        processed.forEach(nft => {
          if (nft.attributes && nft.attributes.length > 0) {
            nft.attributes.forEach(attr => {
              const traitType = attr.trait_type
              const value = attr.value
              if (traitType && value) {
                if (!categories[traitType]) {
                  categories[traitType] = new Set()
                }
                categories[traitType].add(value)
              }
            })
          }
        })

        // Convert sets to arrays and sort
        const sortedCategories = {}
        Object.keys(categories).sort().forEach(key => {
          sortedCategories[key] = Array.from(categories[key]).sort()
        })

        console.log('Trait categories found:', Object.keys(sortedCategories).length)
        console.log('Categories:', sortedCategories)

        setTraitCategories(sortedCategories)
        setMatchingNFTs(processed.slice(0, 6))
      } catch (error) {
        console.error('Failed to fetch NFTs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [])

  // Filter NFTs when traits are selected
  useEffect(() => {
    // Only consider NFTs that have attributes
    const nftsWithAttributes = allNFTs.filter(nft => nft.attributes && nft.attributes.length > 0)

    if (Object.keys(selectedTraits).length === 0) {
      // Show first 6 NFTs with attributes, or all NFTs if none have attributes
      setMatchingNFTs(nftsWithAttributes.length > 0 ? nftsWithAttributes.slice(0, 6) : allNFTs.slice(0, 6))
      return
    }

    const filtered = nftsWithAttributes.filter(nft => {
      return Object.entries(selectedTraits).every(([traitType, traitValue]) => {
        return nft.attributes.some(attr =>
          attr.trait_type === traitType && attr.value === traitValue
        )
      })
    })

    setMatchingNFTs(filtered.slice(0, 6))
  }, [selectedTraits, allNFTs])

  const toggleTrait = (category, value) => {
    setSelectedTraits(prev => {
      if (prev[category] === value) {
        const newTraits = { ...prev }
        delete newTraits[category]
        return newTraits
      }
      return { ...prev, [category]: value }
    })
  }

  const clearTraits = () => {
    setSelectedTraits({})
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-transparent overflow-hidden">

      {/* Hero - Bold Statement */}
      <section className="relative px-4 mb-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <img
              src={showcaseArt[0]}
              alt="Primo"
              className="w-40 h-40 mx-auto border-4 border-white"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-8xl text-white mb-6"
          >
            <GlitchText text="WE ARE PRIMOS" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl text-white/60 font-mono"
          >
            2,746 cousins. One family.
          </motion.p>
        </div>
      </section>

      {/* The Lore / Universe */}
      <section className="px-4 py-20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-display text-3xl md:text-5xl text-white text-center mb-12"
          >
            THE PRIMOS UNIVERSE
          </motion.h2>

          {/* Lore Navigation */}
          <div className="flex justify-center gap-2 mb-8">
            {loreChapters.map((chapter, i) => (
              <motion.button
                key={chapter.title}
                onClick={() => setActiveLore(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 font-display text-sm transition-all ${
                  activeLore === i
                    ? 'bg-primo-pink text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {chapter.title}
              </motion.button>
            ))}
          </div>

          {/* Lore Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLore}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/50 border border-white/20 p-8 md:p-12 text-center"
            >
              <Quote className="text-primo-pink mx-auto mb-6" size={40} />
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-mono">
                {loreChapters[activeLore].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 py-20 bg-white/90 backdrop-blur-sm text-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Clock className="text-primo-pink" size={32} />
            <h2 className="font-display text-3xl md:text-4xl">THE JOURNEY</h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primo-pink via-primo-cyan to-primo-purple" />

            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center mb-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primo-pink border-4 border-white -translate-x-1/2 z-10" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <span className="text-primo-pink font-mono text-sm">{item.year}</span>
                  <h3 className="font-display text-xl mt-1">{item.title}</h3>
                  <p className="text-black/60 mt-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Day in the Life */}
      <section className="px-4 py-12 md:py-20 bg-black/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-display text-2xl md:text-5xl text-white text-center mb-2 md:mb-4"
          >
            A DAY IN THE LIFE
          </motion.h2>
          <p className="text-white/50 text-center mb-6 md:mb-12 font-mono text-sm md:text-base">What do Primos do all day?</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {dayScenes.map((scene, index) => (
              <motion.div
                key={scene.time}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 border-2 border-${scene.color} p-3 md:p-6 text-center`}
              >
                <span className={`text-${scene.color} font-mono text-xs md:text-sm`}>{scene.time}</span>
                <scene.icon className={`text-${scene.color} mx-auto my-2 md:my-4`} size={24} />
                <h3 className="font-display text-white text-sm md:text-base mb-1 md:mb-2">{scene.title}</h3>
                <p className="text-white/50 text-xs md:text-sm hidden sm:block">{scene.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Trait Explorer - WORKING VERSION */}
      <section className="px-4 py-12 md:py-20 bg-black/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Palette className="text-primo-cyan" size={24} />
              <h2 className="font-display text-2xl md:text-4xl text-white">EXPLORE TRAITS</h2>
            </div>
            {Object.keys(selectedTraits).length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={clearTraits}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors font-mono text-sm self-start sm:self-auto"
              >
                <X size={16} />
                Clear All
              </motion.button>
            )}
          </div>

          <p className="text-white/50 mb-6 text-sm md:text-base">
            Select traits to find matching Primos. Currently showing from {allNFTs.length} listed NFTs.
          </p>

          {/* Mobile: Show results first, then traits */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Trait Selectors */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4 max-h-[400px] md:max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {loading ? (
                <div className="text-white/50 font-mono p-8 text-center">Loading traits...</div>
              ) : (
                Object.entries(traitCategories).map(([category, values]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-black/50 border border-white/20 p-3 md:p-4"
                  >
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <h3 className="font-display text-white text-xs md:text-sm">{category}</h3>
                      <span className="text-white/40 text-xs font-mono">{values.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {values.slice(0, 8).map((value) => (
                        <motion.button
                          key={value}
                          onClick={() => toggleTrait(category, value)}
                          whileTap={{ scale: 0.95 }}
                          className={`px-2 md:px-3 py-1.5 md:py-1 text-xs font-mono transition-all ${
                            selectedTraits[category] === value
                              ? 'bg-primo-cyan text-black'
                              : 'bg-white/10 text-white/70 active:bg-white/30'
                          }`}
                        >
                          {value}
                        </motion.button>
                      ))}
                      {values.length > 8 && (
                        <span className="text-white/30 text-xs px-2 py-1">+{values.length - 8}</span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Matching NFTs - Shows first on mobile */}
            <div>
              <div className="bg-black/50 border border-primo-cyan p-3 md:p-4 lg:sticky lg:top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-white">
                    {Object.keys(selectedTraits).length > 0 ? 'MATCHING PRIMOS' : 'SAMPLE PRIMOS'}
                  </h3>
                  <span className="text-primo-cyan font-mono text-sm">
                    {matchingNFTs.length} found
                  </span>
                </div>

                {/* Selected Traits Tags */}
                {Object.keys(selectedTraits).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {Object.entries(selectedTraits).map(([cat, val]) => (
                      <span
                        key={cat}
                        className="text-xs bg-primo-cyan/20 text-primo-cyan px-2 py-1"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                )}

                {/* NFT Grid */}
                <div className="grid grid-cols-3 md:grid-cols-2 gap-1.5 md:gap-2">
                  {matchingNFTs.length > 0 ? (
                    matchingNFTs.map((nft, i) => (
                      <motion.a
                        key={nft.id}
                        href={`https://magiceden.io/item-details/${nft.mintAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative aspect-square overflow-hidden border-2 border-white/20 active:border-primo-cyan transition-colors"
                      >
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                          <span className="text-primo-cyan text-xs font-mono">◎{nft.price.toFixed(2)}</span>
                        </div>
                      </motion.a>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-white/50 font-mono">
                      No matches found.<br />Try different traits.
                    </div>
                  )}
                </div>

                {/* Action Buttons based on matches */}
                {Object.keys(selectedTraits).length > 0 && (
                  matchingNFTs.length > 0 ? (
                    <motion.a
                      href={`https://magiceden.io/item-details/${matchingNFTs[0]?.mintAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="block mt-4 w-full py-3 bg-primo-pink text-black font-display text-center tracking-wider hover:bg-primo-pink/90 transition-colors"
                    >
                      BUY YOUR DREAM PRIMO
                    </motion.a>
                  ) : (
                    <motion.a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `My dream @PrimosNFT would have:\n\n${Object.entries(selectedTraits).map(([cat, val]) => `• ${cat}: ${val}`).join('\n')}\n\nDoes this Primo exist? 👀\n\n#Primos #SolanaNFT`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="block mt-4 w-full py-3 bg-[#1DA1F2] text-white font-display text-center tracking-wider hover:bg-[#1DA1F2]/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Twitter size={18} />
                      SHARE YOUR DREAM PRIMO
                    </motion.a>
                  )
                )}

                {matchingNFTs.length > 0 && (
                  <a
                    href="https://magiceden.io/marketplace/primos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 text-center text-primo-cyan text-sm font-mono hover:underline"
                  >
                    View all on Magic Eden →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Behind the Scenes */}
      <section className="px-4 py-20 bg-black/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="text-primo-yellow" size={32} />
            <h2 className="font-display text-3xl md:text-4xl text-white">BEHIND THE SCENES</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-white/70">
              <p>
                Every Primo started as a sketch. Lordio spent months perfecting each trait,
                making sure they all worked together while maintaining unique personalities.
              </p>
              <p>
                The pixel art style isn't just nostalgia — it's intentional. Each
                Primo is designed to be instantly recognizable, even as a tiny PFP.
              </p>
              <p>
                The color palette pulls from 90s gaming and street art. Bold primaries.
                Neon accents. That VHS aesthetic we all love.
              </p>
              <a
                href="https://x.com/LordioWeb3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primo-pink hover:underline font-display"
              >
                Follow the creator <ChevronRight size={16} />
              </a>
            </div>

            {/* Art Grid */}
            <div className="grid grid-cols-2 gap-2">
              {showcaseArt.slice(0, 4).map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  className="aspect-square border-2 border-white/20 overflow-hidden"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Collector Spotlight Placeholder */}
      <section className="px-4 py-20 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="text-primo-pink mx-auto mb-6" size={48} />
          <h2 className="font-display text-3xl md:text-5xl text-white mb-4">
            COLLECTOR STORIES
          </h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            Real holders. Real stories. Coming soon — we're collecting stories from the community.
          </p>
          <motion.a
            href="https://discord.gg/XhCcZNfEVn"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-display hover:bg-white/20 transition-colors"
          >
            <MessageCircle size={20} />
            SHARE YOUR STORY IN DISCORD
          </motion.a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-display text-4xl md:text-6xl text-white mb-8"
          >
            READY TO BE A PRIMO?
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.a
              href="https://magiceden.io/marketplace/primos"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              className="px-8 py-4 bg-white text-black font-display tracking-wider flex items-center gap-2"
            >
              <ExternalLink size={20} />
              GET YOUR PRIMO
            </motion.a>
            <motion.a
              href="https://x.com/primosnft"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              className="px-8 py-4 border-2 border-primo-cyan text-primo-cyan font-display tracking-wider hover:bg-primo-cyan hover:text-black transition-colors flex items-center gap-2"
            >
              <Twitter size={20} />
              FOLLOW US
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  )
}
