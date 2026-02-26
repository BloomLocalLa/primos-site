import { motion } from 'framer-motion'
import { Twitter, MessageCircle, ExternalLink, Heart, Star, Sparkles, Trophy, Users } from 'lucide-react'
import GlitchText from '../components/GlitchText'

const spotlightMembers = [
  {
    username: 'PrimoWhale',
    avatar: 'https://picsum.photos/seed/member1/200/200',
    primosOwned: 42,
    since: 'Day 1',
    quote: 'Primos changed my perspective on NFTs. The community is unmatched.',
    twitter: 'https://x.com/',
    featured: true,
  },
  {
    username: 'RetroCollector',
    avatar: 'https://picsum.photos/seed/member2/200/200',
    primosOwned: 28,
    since: 'Week 1',
    quote: 'The art reminds me of Saturday mornings as a kid. Pure nostalgia.',
    twitter: 'https://x.com/',
  },
  {
    username: 'SolanaDegen',
    avatar: 'https://picsum.photos/seed/member3/200/200',
    primosOwned: 15,
    since: 'Month 1',
    quote: 'Best community on Solana. Period.',
    twitter: 'https://x.com/',
  },
  {
    username: 'NFTEnthusiast',
    avatar: 'https://picsum.photos/seed/member4/200/200',
    primosOwned: 8,
    since: 'Month 2',
    quote: 'Holding these forever. The vibes are immaculate.',
    twitter: 'https://x.com/',
  },
]

const communityHighlights = [
  { stat: '1,200+', label: 'HOLDERS', icon: Users },
  { stat: '5,000+', label: 'DISCORD MEMBERS', icon: MessageCircle },
  { stat: '10K+', label: 'X FOLLOWERS', icon: Twitter },
  { stat: '∞', label: 'GOOD VIBES', icon: Heart },
]

const recentActivity = [
  { type: 'sale', user: 'PrimoWhale', item: 'Primo #1234', price: '2.5 SOL', time: '2h ago' },
  { type: 'list', user: 'RetroCollector', item: 'Primo #5678', price: '3.2 SOL', time: '4h ago' },
  { type: 'sale', user: 'SolanaDegen', item: 'Primo #9012', price: '1.8 SOL', time: '6h ago' },
  { type: 'mint', user: 'NewHolder', item: 'Primo #3456', price: '1.0 SOL', time: '12h ago' },
]

export default function Community() {
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
            Meet the amazing people who make Primos special. Collectors, creators, and friends.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {communityHighlights.map((item, index) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
              className="bg-black border-4 border-white p-6 text-center group"
            >
              <item.icon
                size={32}
                className="mx-auto mb-3 text-primo-cyan group-hover:text-primo-pink transition-colors"
              />
              <div className="font-display text-3xl text-white mb-1">{item.stat}</div>
              <div className="text-static-gray text-xs font-mono">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Member */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <h2 className="font-display text-3xl text-white mb-8 flex items-center gap-3">
            <Trophy className="text-primo-yellow" />
            COLLECTOR SPOTLIGHT
          </h2>

          {spotlightMembers.filter(m => m.featured).map((member) => (
            <motion.div
              key={member.username}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-primo-pink/20 to-primo-cyan/20 border-4 border-primo-yellow p-8 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primo-yellow/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="relative"
                >
                  <div className="w-32 h-32 border-4 border-primo-yellow overflow-hidden">
                    <img
                      src={member.avatar}
                      alt={member.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 p-2 bg-primo-yellow text-black">
                    <Star size={20} />
                  </div>
                </motion.div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h3 className="font-display text-2xl text-white">{member.username}</h3>
                    <Sparkles className="text-primo-yellow" size={20} />
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-static-gray font-mono text-sm mb-4">
                    <span>{member.primosOwned} Primos</span>
                    <span>•</span>
                    <span>Holder since {member.since}</span>
                  </div>
                  <blockquote className="text-lg text-primo-cyan italic mb-4">
                    "{member.quote}"
                  </blockquote>
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-static-gray hover:text-primo-pink transition-colors"
                  >
                    <Twitter size={18} />
                    Follow on X
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Member Grid */}
        <section className="mb-16">
          <h2 className="font-display text-3xl text-white mb-8 flex items-center gap-3">
            <Users className="text-primo-cyan" />
            TOP HOLDERS
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spotlightMembers.filter(m => !m.featured).map((member, index) => (
              <motion.div
                key={member.username}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-black border-4 border-white p-6 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 border-2 border-primo-cyan overflow-hidden group-hover:border-primo-pink transition-colors">
                    <img
                      src={member.avatar}
                      alt={member.username}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-white">{member.username}</h3>
                    <div className="text-static-gray font-mono text-sm">
                      {member.primosOwned} Primos
                    </div>
                  </div>
                </div>
                <p className="text-static-gray text-sm italic mb-4">"{member.quote}"</p>
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-static-gray hover:text-primo-cyan transition-colors"
                >
                  <Twitter size={14} />
                  @{member.username.toLowerCase()}
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-16">
          <h2 className="font-display text-3xl text-white mb-8 flex items-center gap-3">
            <Sparkles className="text-primo-pink" />
            RECENT ACTIVITY
          </h2>

          <div className="bg-black border-4 border-white overflow-hidden">
            <div className="divide-y divide-static-dark">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-center justify-between hover:bg-static-dark/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-display ${
                      activity.type === 'sale' ? 'bg-primo-green text-black' :
                      activity.type === 'list' ? 'bg-primo-yellow text-black' :
                      'bg-primo-pink text-black'
                    }`}>
                      {activity.type.toUpperCase()}
                    </span>
                    <span className="text-white font-mono">{activity.user}</span>
                    <span className="text-static-gray">→</span>
                    <span className="text-primo-cyan">{activity.item}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-mono">{activity.price}</span>
                    <span className="text-static-gray text-sm">{activity.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
                href="https://discord.gg/primos"
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
                href="https://x.com/PrimosNFT"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border-3 border-primo-cyan text-primo-cyan font-display tracking-wider hover:bg-primo-cyan hover:text-black transition-colors flex items-center gap-2"
              >
                <Twitter size={20} />
                FOLLOW ON X
              </motion.a>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
