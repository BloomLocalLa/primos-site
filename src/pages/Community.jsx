import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Twitter, MessageCircle, Heart, Users, Zap, TrendingUp, Package, ExternalLink, Wallet, Palette, Shirt, Frame, Play } from 'lucide-react'
import GlitchText from '../components/GlitchText'
import { getCollectionStats, getRecentActivities, getHolderStats, lamportsToSol } from '../lib/magiceden'

// Public IPFS gateways are unreliable for activity images; fall back to local artwork
const FALLBACK_ARTWORK = '/artwork/QmaEPHgZct4F3E8y7XMhcYJScFzuowSjW1w6oQbaeYiUSw.avif'

// Community art aggregated from X. Media (or video poster frames) saved locally in
// /public/community/. To feature a post: drop its image in that folder and add an entry.
const communityArt = [
  {
    title: 'gm primos',
    creator: '@LordioWeb3',
    image: '/community/lordio-gm.jpg',
    link: 'https://x.com/LordioWeb3/status/2062910164244795834',
    video: true,
    borderColor: 'border-primo-pink',
  },
  {
    title: 'THEY NOT LIKE US!',
    creator: '@PrimosNFT',
    image: '/community/primos-pwo.jpg',
    link: 'https://x.com/PrimosNFT/status/2052404787006803970',
    video: true,
    borderColor: 'border-primo-cyan',
  },
]

// Community merch — placeholders until the merch store opens.
const communityMerch = [
  { title: 'Primos Tee', image: '/artwork/QmX6ywFVdXwPjjUYcYEqhKMttWmW8ueCzZxHSmj8EKNzbL.avif', borderColor: 'border-primo-yellow' },
  { title: 'Primos Hoodie', image: '/artwork/QmagjfWJXmrStQP7sYsEqytPV2yXtyRhKTcT3Ngqw8D1MA.avif', borderColor: 'border-primo-cyan' },
  { title: 'Primos Cap', image: '/artwork/QmZUWtRTo4RigUSbPwHWQ93gM6azjP1hZCP2HdCLWdp93g.avif', borderColor: 'border-primo-green' },
]

export default function Community() {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [topHolders, setTopHolders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, activities, holderData] = await Promise.all([
          getCollectionStats(),
          getRecentActivities(20),
          getHolderStats(),
        ])

        setStats({
          holders: holderData?.totalHolders || 738,
          listedCount: statsData.listedCount || 0,
          floorPrice: lamportsToSol(statsData.floorPrice || 0),
          volumeAll: (statsData.volumeAll / 1e9).toFixed(0),
        })

        // Process top holders - log to debug
        console.log('Holder data from API:', holderData)
        if (holderData?.topHolders) {
          console.log('Top holders:', holderData.topHolders)
          setTopHolders(holderData.topHolders.slice(0, 10))
        }

        // Process recent activities (sales and listings) - limit to 5
        const processed = activities
          .filter(a => a.type === 'buyNow' || a.type === 'list')
          .slice(0, 5)
          .map((activity, i) => {
            let imageUrl = activity.image || FALLBACK_ARTWORK
            if (imageUrl.startsWith('ipfs://')) {
              imageUrl = imageUrl.replace('ipfs://', 'https://nftstorage.link/ipfs/')
            }

            return {
              id: i,
              type: activity.type === 'buyNow' ? 'sale' : 'list',
              price: (activity.price || 0).toFixed(3), // activities price is already in SOL, not lamports
              time: getTimeAgo(activity.blockTime * 1000),
              buyer: activity.buyer?.slice(0, 4) + '...' + activity.buyer?.slice(-4),
              seller: activity.seller?.slice(0, 4) + '...' + activity.seller?.slice(-4),
              image: imageUrl,
              mintAddress: activity.tokenMint,
            }
          })

        setRecentActivity(processed)
      } catch (error) {
        console.error('Failed to fetch community data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const communityHighlights = [
    { stat: stats?.holders?.toLocaleString() || '738', label: 'UNIQUE HOLDERS', icon: Users },
    { stat: stats?.listedCount?.toLocaleString() || '--', label: 'LISTED', icon: Package },
    { stat: `◎${stats?.floorPrice || '--'}`, label: 'FLOOR PRICE', icon: TrendingUp },
    { stat: `◎${stats?.volumeAll || '--'}`, label: 'TOTAL VOLUME', icon: Zap },
  ]

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-6xl md:text-8xl text-white mb-4">
            <GlitchText text="COMMUNITY" />
          </h1>
          <p className="text-static-gray font-mono max-w-xl mx-auto">
            A community within communities. {stats?.holders || 738} unique holders and counting.
          </p>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-10 md:mb-16"
        >
          {communityHighlights.map((item, index) => (
            <motion.div
              key={item.label}
              className="bg-black border-2 md:border-4 border-white p-3 md:p-6 text-center group"
            >
              <item.icon
                size={24}
                className="mx-auto mb-2 md:mb-3 text-primo-cyan md:w-8 md:h-8"
              />
              <div className="font-display text-xl md:text-3xl text-white mb-0.5 md:mb-1">{item.stat}</div>
              <div className="text-static-gray text-[10px] md:text-xs font-mono">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Two Column Layout: Top Holders + Live Activity */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-16">
          {/* Top Holders */}
          <section>
            <h2 className="font-display text-lg md:text-2xl text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Wallet className="text-primo-yellow" size={20} />
              TOP HOLDERS
            </h2>

            <div className="bg-black border-2 md:border-4 border-primo-yellow overflow-hidden">
              {/* Header */}
              <div className="p-2 md:p-3 border-b border-static-dark flex justify-between text-[10px] md:text-xs font-mono text-static-gray">
                <span>WALLET</span>
                <span>HOLDINGS</span>
              </div>

              {loading ? (
                <div className="p-4 md:p-6 text-center text-static-gray font-mono text-sm">Loading holders...</div>
              ) : topHolders.length > 0 ? (
                <div className="divide-y divide-static-dark max-h-[280px] md:max-h-[350px] overflow-y-auto custom-scrollbar">
                  {topHolders.map((holder, index) => {
                    const holdingCount = holder.tokens || holder.amount || holder.count || 0
                    return (
                      <motion.a
                        key={holder.owner}
                        href={`https://magiceden.io/u/${holder.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-2 md:p-3 flex items-center justify-between hover:bg-static-dark/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className={`w-5 h-5 md:w-7 md:h-7 flex items-center justify-center text-[10px] md:text-xs font-display ${
                            index === 0 ? 'bg-primo-yellow text-black' :
                            index === 1 ? 'bg-gray-300 text-black' :
                            index === 2 ? 'bg-amber-600 text-black' :
                            'bg-static-dark text-white'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="text-white font-mono text-xs md:text-sm group-hover:text-primo-cyan transition-colors">
                            {holder.owner.slice(0, 4)}...{holder.owner.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 md:gap-1 bg-black/50 px-2 md:px-3 py-0.5 md:py-1 border border-primo-cyan/30">
                          <span className="text-primo-cyan font-display text-base md:text-xl">{holdingCount}</span>
                          <span className="text-static-gray text-[10px] md:text-xs ml-0.5 md:ml-1">Primos</span>
                        </div>
                      </motion.a>
                    )
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-static-gray font-mono">No holder data available</div>
              )}
            </div>
          </section>

          {/* Recent Activity - Smaller */}
          <section>
            <h2 className="font-display text-lg md:text-2xl text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Zap className="text-primo-pink" size={20} />
              LIVE ACTIVITY
              <span className="ml-1 md:ml-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-primo-green rounded-full animate-pulse" />
            </h2>

            <div className="bg-black border-2 md:border-4 border-white overflow-hidden">
              {loading ? (
                <div className="p-4 md:p-6 text-center text-static-gray font-mono text-sm">Loading...</div>
              ) : recentActivity.length > 0 ? (
                <div className="divide-y divide-static-dark">
                  {recentActivity.map((activity, index) => (
                    <motion.a
                      key={activity.id}
                      href={`https://magiceden.io/item-details/${activity.mintAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-2 md:p-3 flex items-center justify-between hover:bg-static-dark/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-white/20 overflow-hidden flex-shrink-0">
                          <img
                            src={activity.image}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_ARTWORK }}
                          />
                        </div>

                        <span className={`px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-display ${
                          activity.type === 'sale' ? 'bg-primo-green text-black' : 'bg-primo-yellow text-black'
                        }`}>
                          {activity.type === 'sale' ? 'SOLD' : 'LISTED'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-primo-cyan font-mono text-xs md:text-sm">◎{activity.price}</span>
                        <span className="text-static-gray text-[10px] md:text-xs">{activity.time}</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              ) : (
                <div className="p-4 md:p-6 text-center text-static-gray font-mono text-sm">No recent activity</div>
              )}
            </div>
          </section>
        </div>

        {/* Community Values */}
        <section className="mb-10 md:mb-16">
          <h2 className="font-display text-lg md:text-2xl text-white mb-4 md:mb-8 flex items-center gap-2 md:gap-3">
            <Heart className="text-primo-pink" size={20} />
            OUR VALUES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {[
              {
                title: 'DIAMOND HANDS',
                desc: '72% of Primos have never been listed. Our holders believe in the long-term vision.',
                borderColor: 'border-primo-cyan',
                textColor: 'text-primo-cyan',
              },
              {
                title: 'COMMUNITY FIRST',
                desc: 'Every decision is made with the community in mind. We build together.',
                borderColor: 'border-primo-pink',
                textColor: 'text-primo-pink',
              },
              {
                title: 'NOSTALGIA',
                desc: 'We celebrate 90s culture, retro gaming, and the art that defined a generation.',
                borderColor: 'border-primo-yellow',
                textColor: 'text-primo-yellow',
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black border-2 md:border-4 ${value.borderColor} p-4 md:p-6`}
              >
                <h3 className={`font-display text-base md:text-xl ${value.textColor} mb-2 md:mb-3`}>{value.title}</h3>
                <p className="text-static-gray text-sm md:text-base">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* From the Community */}
        <section className="mb-12 md:mb-16">
          <h2 className="font-display text-xl md:text-2xl text-white mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
            <Palette className="text-primo-cyan" size={20} />
            FROM THE COMMUNITY
          </h2>

          {/* Community Art */}
          <h3 className="font-display text-primo-pink text-base md:text-lg tracking-wider mb-3 md:mb-4 flex items-center gap-2">
            <Frame size={16} />
            COMMUNITY ART
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {communityArt.map((item, index) => (
              <motion.a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black border-2 md:border-4 ${item.borderColor} overflow-hidden group`}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {item.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/60 border-2 border-white flex items-center justify-center">
                        <Play size={20} className="text-white ml-0.5 md:w-7 md:h-7" fill="white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-4">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                    <Twitter size={12} className="text-white/60 md:w-4 md:h-4" />
                    <span className="text-white/60 text-[10px] md:text-xs font-mono uppercase">
                      {item.video ? 'video' : 'art'}
                    </span>
                  </div>
                  <h3 className="font-display text-white text-sm md:text-base mb-0.5 md:mb-1 truncate">{item.title}</h3>
                  <p className="text-primo-cyan text-xs md:text-sm font-mono truncate">{item.creator}</p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Community Merch */}
          <h3 className="font-display text-primo-yellow text-base md:text-lg tracking-wider mt-8 md:mt-10 mb-3 md:mb-4 flex items-center gap-2">
            <Shirt size={16} />
            COMMUNITY MERCH
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {communityMerch.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black border-2 md:border-4 ${item.borderColor} overflow-hidden group`}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale opacity-50"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-3 py-1 bg-black/70 border border-white/30 text-white text-[10px] md:text-xs font-display tracking-wider">
                      COMING SOON
                    </span>
                  </div>
                </div>
                <div className="p-2 md:p-4">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                    <Shirt size={12} className="text-white/60 md:w-4 md:h-4" />
                    <span className="text-white/60 text-[10px] md:text-xs font-mono uppercase">merch</span>
                  </div>
                  <h3 className="font-display text-white text-sm md:text-base mb-0.5 md:mb-1 truncate">{item.title}</h3>
                  <p className="text-static-gray text-xs md:text-sm font-mono truncate">Drops soon</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-6 md:mt-8 text-center"
          >
            <p className="text-static-gray mb-3 md:mb-4 text-sm md:text-base">
              Created something cool? Share it with us!
            </p>
            <motion.a
              href="https://discord.gg/XhCcZNfEVn"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-display hover:bg-white/20 transition-colors"
            >
              <MessageCircle size={18} />
              SUBMIT YOUR CREATION
            </motion.a>
          </motion.div>
        </section>

        {/* Join CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primo-pink/20 via-primo-cyan/20 to-primo-yellow/20 border-4 border-white p-12">
            <h2 className="font-display text-4xl text-white mb-4">
              BECOME A <span className="text-primo-pink">PRIMO</span>
            </h2>
            <p className="text-static-gray mb-8 max-w-md mx-auto">
              Join our Discord, follow us on X, and become part of the most nostalgic community in Web3.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="https://discord.gg/XhCcZNfEVn"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="retro-btn flex items-center gap-2"
              >
                <MessageCircle size={20} />
                JOIN DISCORD
              </motion.a>
              <motion.a
                href="https://x.com/primosnft"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border-3 border-primo-cyan text-primo-cyan font-display tracking-wider hover:bg-primo-cyan hover:text-black transition-colors flex items-center gap-2"
              >
                <Twitter size={20} />
                FOLLOW ON X
              </motion.a>
              <motion.a
                href="https://magiceden.io/marketplace/primos"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border-3 border-primo-yellow text-primo-yellow font-display tracking-wider hover:bg-primo-yellow hover:text-black transition-colors flex items-center gap-2"
              >
                <ExternalLink size={20} />
                BUY ON MAGIC EDEN
              </motion.a>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
