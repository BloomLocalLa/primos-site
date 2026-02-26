import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, Heart, Users, Sparkles, Target, Shield } from 'lucide-react'
import GlitchText from '../components/GlitchText'

const milestones = [
  { year: '2024', title: 'THE BEGINNING', description: 'Primos was born from a love of community and unique art.' },
  { year: '2024', title: 'MINT DAY', description: '2,746 unique Primos found their forever homes on Solana.' },
  { year: '2024', title: 'COMMUNITY', description: 'A vibrant community of collectors and creators emerged.' },
  { year: '2025', title: 'THE FUTURE', description: 'New utilities, merchandise, and experiences on the horizon.' },
]

const values = [
  { icon: Heart, title: 'COMMUNITY', description: 'A community within communities. We build together, grow together.', color: 'text-primo-pink' },
  { icon: Users, title: 'UNITY', description: 'Every holder is family. We support and uplift each other.', color: 'text-primo-cyan' },
  { icon: Sparkles, title: 'CREATIVITY', description: 'Every Primo is a unique piece of digital art with personality.', color: 'text-primo-yellow' },
  { icon: Zap, title: 'INNOVATION', description: 'Pushing boundaries in the NFT space on Solana.', color: 'text-primo-purple' },
]

const traits = [
  'HOODS', 'SUNGLASSES', 'HARD HATS', 'HEADPHONES', 'MASKS', 'EXPRESSIONS'
]

export default function About() {
  const containerRef = useRef(null)
  const statsRef = useRef(null)
  const isStatsInView = useInView(statsRef, { once: true })

  return (
    <div ref={containerRef} className="min-h-screen pt-28 pb-20 bg-black">
      {/* Hero Section */}
      <section className="relative px-4 mb-20 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primo-pink/10 to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.img
              src="/logo.png"
              alt="Primos"
              className="w-24 h-24 mx-auto mb-8 rounded-full"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
              whileHover={{ scale: 1.1 }}
            />
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6">
              <GlitchText text="ABOUT" />
            </h1>
            <p className="text-xl text-white/60 font-mono max-w-2xl mx-auto">
              A community within communities. 2,746 unique characters united on Solana.
            </p>
          </motion.div>

          {/* Feature Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative bg-white/5 border border-white/10 p-8 md:p-12"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primo-pink via-primo-cyan to-primo-purple" />

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                  2,746 UNIQUE CHARACTERS
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Each Primo is a one-of-a-kind digital collectible living on the Solana blockchain.
                  With unique combinations of traits, backgrounds, and accessories, no two Primos are alike.
                </p>
                <div className="flex flex-wrap gap-2">
                  {traits.map((trait) => (
                    <span key={trait} className="trait-tag">{trait}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <motion.div
                  className="relative"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-48 h-48 md:w-64 md:h-64 border-4 border-white bg-gradient-to-br from-primo-pink/20 to-primo-cyan/20 flex items-center justify-center">
                    <img src="/logo.png" alt="Primos" className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
                  </div>
                  {/* Decorative corners */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primo-pink" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primo-cyan" />
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primo-cyan" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primo-pink" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 py-20 bg-white text-black">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="font-display text-4xl md:text-5xl mb-8"
          >
            THE STORY
          </motion.h2>

          <div className="space-y-6 text-black/70 text-lg leading-relaxed">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              Primos started with a simple idea: create a collection that brings people together.
              In a space often focused on speculation, we wanted to build something different —
              a genuine community of collectors who share common values and support each other.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Each Primo character represents individuality within unity. With their iconic hoods,
              sunglasses, and unique accessories, they're instantly recognizable while being
              completely unique. That's what we believe community should be — individuals
              coming together while staying true to themselves.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primo-pink font-medium"
            >
              "A community within communities" — that's not just a tagline, it's our mission.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-display text-4xl md:text-5xl text-white text-center mb-16"
          >
            OUR VALUES
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/5 border border-white/10 p-6 text-center group hover:border-primo-pink/50 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`inline-block mb-4 ${value.color}`}
                >
                  <value.icon size={40} />
                </motion.div>
                <h3 className="font-display text-xl text-white mb-2">{value.title}</h3>
                <p className="text-white/50 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="px-4 py-20 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-display text-4xl md:text-5xl text-white text-center mb-16"
          >
            THE JOURNEY
          </motion.h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primo-pink via-primo-cyan to-primo-purple" />

            {/* Milestones */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Dot */}
                  <motion.div
                    whileHover={{ scale: 1.5 }}
                    className="absolute left-6 w-5 h-5 bg-primo-pink border-2 border-white"
                  />

                  {/* Content */}
                  <div className="bg-black border border-white/20 p-6 hover:border-primo-pink/50 transition-colors">
                    <span className="text-primo-cyan font-mono text-sm">{milestone.year}</span>
                    <h3 className="font-display text-xl text-white mt-1 mb-2">{milestone.title}</h3>
                    <p className="text-white/50">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl text-white mb-6"
          >
            READY TO JOIN?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 mb-8 text-lg"
          >
            Become a Primo holder and be part of something special.
          </motion.p>
          <motion.a
            href="https://magiceden.io/marketplace/primos"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-10 py-4 bg-white text-black font-display text-lg tracking-wider"
          >
            GET YOUR PRIMO
          </motion.a>
        </div>
      </section>
    </div>
  )
}
