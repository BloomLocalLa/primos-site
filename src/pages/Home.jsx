import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import {
  Zap, Users, ShoppingBag, Palette, MessageCircle,
  ChevronDown, Sparkles, Eye, ArrowRight, Twitter, Headphones, Glasses, HardHat
} from 'lucide-react'
import GlitchText from '../components/GlitchText'
import { getCollectionStats, lamportsToSol } from '../lib/magiceden'

// Featured NFTs - actual Primos artwork
const featuredNFTs = [
  { id: 1, name: 'Primo #1234', image: '/artwork/QmaEPHgZct4F3E8y7XMhcYJScFzuowSjW1w6oQbaeYiUSw.avif', price: 2.5, bg: 'bg-pink-dark' },
  { id: 2, name: 'Primo #5678', image: '/artwork/QmagjfWJXmrStQP7sYsEqytPV2yXtyRhKTcT3Ngqw8D1MA.avif', price: 3.2, bg: 'bg-teal-dark' },
  { id: 3, name: 'Primo #9012', image: '/artwork/QmamhGh1LjF6tTdWZerkVQjtQVkcThminw57MB3RgU9JVc.avif', price: 1.8, bg: 'bg-purple-900' },
  { id: 4, name: 'Primo #3456', image: '/artwork/QmaXp9riawoo7HMUmZC3SxCPVxTxytGgsoAtCHfT65DFxK.avif', price: 4.1, bg: 'bg-pink-dark' },
  { id: 5, name: 'Primo #7890', image: '/artwork/QmbEf76maCZRCUEB8ddGQHHP4iDpr5bPY5aCk25KjRYvSn.avif', price: 2.9, bg: 'bg-teal-dark' },
  { id: 6, name: 'Primo #2345', image: '/artwork/QmbR2gsdtid7y3DLZ7ZmDxPs2XWhpX4sTnh5sRnKJbrC5g.avif', price: 3.7, bg: 'bg-blue-900' },
]

// Default stats (will be updated with live data)
const defaultStats = [
  { label: 'SUPPLY', value: '2,746', key: 'supply' },
  { label: 'FLOOR', value: '◎ --', key: 'floor' },
  { label: 'LISTED', value: '--', key: 'listed' },
  { label: 'VOLUME', value: '◎ --', key: 'volume' },
]

const traits = [
  { name: 'HOODS', count: '2,746', image: '/artwork/QmaEPHgZct4F3E8y7XMhcYJScFzuowSjW1w6oQbaeYiUSw.avif' },
  { name: 'SUNGLASSES', count: '1,842', image: '/artwork/QmagjfWJXmrStQP7sYsEqytPV2yXtyRhKTcT3Ngqw8D1MA.avif' },
  { name: 'HARD HATS', count: '423', image: '/artwork/QmamhGh1LjF6tTdWZerkVQjtQVkcThminw57MB3RgU9JVc.avif' },
  { name: 'HEADPHONES', count: '687', image: '/artwork/QmaXp9riawoo7HMUmZC3SxCPVxTxytGgsoAtCHfT65DFxK.avif' },
  { name: 'BACKGROUNDS', count: '12', image: '/artwork/QmbEf76maCZRCUEB8ddGQHHP4iDpr5bPY5aCk25KjRYvSn.avif' },
  { name: 'EXPRESSIONS', count: '8', image: '/artwork/QmbR2gsdtid7y3DLZ7ZmDxPs2XWhpX4sTnh5sRnKJbrC5g.avif' },
]

const quickLinks = [
  { label: 'GALLERY', path: '/gallery', icon: Eye, desc: 'Browse all 2,746 Primos' },
  { label: 'MERCH', path: '/merch', icon: ShoppingBag, desc: 'Rep your Primo' },
  { label: 'COMMUNITY', path: '/community', icon: Users, desc: 'Meet the fam' },
  { label: 'ARTWORK', path: '/artwork', icon: Palette, desc: 'Get custom art' },
]

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [stats, setStats] = useState(defaultStats)
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const traitsRef = useRef(null)
  const isStatsInView = useInView(statsRef, { once: true })
  const isTraitsInView = useInView(traitsRef, { once: true })
  const { scrollYProgress } = useScroll()

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  // Fetch live stats from Magic Eden
  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getCollectionStats()
        const floorSol = lamportsToSol(data.floorPrice || 0)
        const volumeSol = (data.volumeAll / 1e9).toFixed(0)

        setStats([
          { label: 'SUPPLY', value: '2,746', key: 'supply' },
          { label: 'FLOOR', value: `◎ ${floorSol}`, key: 'floor' },
          { label: 'LISTED', value: data.listedCount?.toLocaleString() || '--', key: 'listed' },
          { label: 'VOLUME', value: `◎ ${volumeSol}`, key: 'volume' },
        ])
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-transparent">
      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full bg-primo-pink/20 blur-[150px]"
            animate={{
              x: ['-20%', '10%', '-20%'],
              y: ['-20%', '20%', '-20%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ top: '-20%', left: '-10%' }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full bg-primo-cyan/20 blur-[150px]"
            animate={{
              x: ['20%', '-10%', '20%'],
              y: ['20%', '-20%', '20%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ bottom: '-10%', right: '-10%' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full bg-primo-purple/20 blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Mouse Follow */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          animate={{
            x: mousePos.x - 250,
            y: mousePos.y - 250,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          style={{
            background: 'radial-gradient(circle, rgba(233,30,140,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4 pt-24 max-w-6xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 1, bounce: 0.4 }}
            className="mb-6"
          >
            <motion.img
              src="/logo.png"
              alt="Primos"
              className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full"
              animate={{
                filter: [
                  'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
                  'drop-shadow(0 0 40px rgba(255,255,255,0.6))',
                  'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display text-6xl md:text-8xl lg:text-9xl text-white mb-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlitchText text="PRIMOS" />
          </motion.h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-lg md:text-2xl font-mono text-white/50 mb-2">
              2,746 CHARACTERS ON SOLANA
            </p>
            <motion.p
              className="text-xl md:text-2xl font-display tracking-widest"
              style={{ color: '#E91E8C' }}
            >
              A COMMUNITY WITHIN COMMUNITIES
            </motion.p>
          </motion.div>

          {/* Trait Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {['HOODS', 'SUNGLASSES', 'HARD HATS', 'HEADPHONES'].map((trait, i) => (
              <motion.span
                key={trait}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(233, 30, 140, 0.3)' }}
                className="trait-tag cursor-default"
              >
                {trait}
              </motion.span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.a
              href="https://magiceden.io/marketplace/primos"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-4 bg-white text-black font-display text-lg tracking-wider overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <ShoppingBag size={22} />
                BUY ON MAGIC EDEN
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primo-pink to-primo-cyan"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="absolute inset-0 z-20 flex items-center justify-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity font-display">
                <ShoppingBag size={22} />
                BUY ON MAGIC EDEN
              </span>
            </motion.a>

            <motion.a
              href="https://discord.gg/primos"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 border-2 border-white text-white font-display text-lg tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-3"
            >
              <MessageCircle size={22} />
              JOIN DISCORD
            </motion.a>
          </motion.div>

          {/* Scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-white/30"
            >
              <ChevronDown size={32} />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating NFTs */}
        {featuredNFTs.slice(0, 4).map((nft, i) => (
          <motion.div
            key={nft.id}
            className="absolute hidden lg:block"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 0.85,
              scale: 1,
              y: [0, -15, 0],
              rotate: (i % 2 === 0 ? 1 : -1) * 5,
            }}
            transition={{
              delay: 0.8 + i * 0.15,
              y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: 1.15, rotate: 0, zIndex: 50 }}
            style={{
              top: i < 2 ? `${28 + i * 18}%` : `${28 + (i - 2) * 18}%`,
              left: i < 2 ? '5%' : 'auto',
              right: i >= 2 ? '5%' : 'auto',
            }}
          >
            <div className="w-24 h-24 md:w-32 md:h-32 border-3 border-white bg-black overflow-hidden shadow-xl">
              <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* STATS */}
      <section ref={statsRef} className="py-8 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-4 divide-x divide-black/10">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="text-center py-6"
              >
                <div className="font-display text-3xl md:text-5xl text-black">{stat.value}</div>
                <div className="text-black/50 text-xs md:text-sm font-mono mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAITS SECTION */}
      <section ref={traitsRef} className="py-20 bg-black/70 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primo-pink/5 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-6xl text-white mb-4">
              TRAITS
            </h2>
            <p className="text-white/50 font-mono">Each Primo is unique</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {traits.map((trait, index) => (
              <motion.div
                key={trait.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isTraitsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.08, y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative bg-black border-2 border-white/20 overflow-hidden group-hover:border-primo-pink transition-colors">
                  {/* Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={trait.image}
                      alt={trait.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <div className="font-display text-white text-sm tracking-wider">{trait.name}</div>
                    <div className="font-mono text-primo-cyan text-xs">{trait.count}</div>
                  </div>

                  {/* Glitch line on hover */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-primo-pink opacity-0 group-hover:opacity-100"
                    animate={{ scaleX: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CAROUSEL */}
      <section className="py-20 bg-black/60 backdrop-blur-sm overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-10">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="font-display text-4xl md:text-6xl text-white"
          >
            FEATURED
          </motion.h2>
        </div>

        {/* Infinite Scroll */}
        <div className="relative">
          <div className="scroll-shadow-left scroll-shadow-right">
            <motion.div
              className="flex gap-4"
              animate={{ x: [0, -1400] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
              {[...featuredNFTs, ...featuredNFTs, ...featuredNFTs].map((nft, index) => (
                <motion.div
                  key={`${nft.id}-${index}`}
                  whileHover={{ scale: 1.05, y: -10, zIndex: 10 }}
                  className="flex-shrink-0 w-56 md:w-72"
                >
                  <div className="primo-card">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-white">{nft.name}</h3>
                      <p className="font-mono text-primo-cyan text-sm">◎ {nft.price}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-10 text-center">
          <Link to="/gallery">
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-display tracking-wider"
            >
              VIEW ALL
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </div>
      </section>

      {/* EXPLORE GRID */}
      <section className="py-20 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-display text-4xl md:text-6xl text-black text-center mb-12"
          >
            EXPLORE
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            {quickLinks.map((link, index) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 0.98 }}
                  className="relative bg-black text-white p-8 aspect-square flex flex-col justify-between group overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primo-pink to-primo-cyan"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="relative z-10">
                    <link.icon size={36} className="group-hover:scale-110 transition-transform" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-display text-2xl mb-1">{link.label}</h3>
                    <p className="font-mono text-sm text-white/60 group-hover:text-white/80">{link.desc}</p>
                  </div>

                  <motion.div
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 z-10"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <ArrowRight size={24} />
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="py-24 bg-black/70 backdrop-blur-sm relative overflow-hidden">
        {/* Background Pulse */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 30% 50%, rgba(233,30,140,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 50%, rgba(0,206,209,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 50%, rgba(233,30,140,0.15) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <motion.img
            src="/logo.png"
            alt="Primos"
            className="w-20 h-20 mx-auto mb-6 rounded-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ rotate: 10 }}
          />

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-7xl text-white mb-4"
          >
            JOIN THE
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-7xl text-white/30 mb-8"
          >
            COMMUNITY
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <motion.a
              href="https://discord.gg/primos"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              className="px-10 py-4 bg-white text-black font-display tracking-wider flex items-center gap-3"
            >
              <MessageCircle size={22} />
              DISCORD
            </motion.a>
            <motion.a
              href="https://x.com/PrimosNFT"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              className="px-10 py-4 border-2 border-white text-white font-display tracking-wider flex items-center gap-3 hover:bg-white hover:text-black transition-colors"
            >
              <Twitter size={22} />
              TWITTER
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
