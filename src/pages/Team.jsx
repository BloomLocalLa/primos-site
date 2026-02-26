import { motion } from 'framer-motion'
import { Twitter, MessageCircle, Globe, Sparkles } from 'lucide-react'
import GlitchText from '../components/GlitchText'

const team = [
  {
    name: 'FOUNDER NAME',
    role: 'Founder & Artist',
    image: 'https://picsum.photos/seed/team1/400/400',
    bio: 'The creative mind behind Primos. Passionate about 90s nostalgia and digital art.',
    socials: {
      twitter: 'https://x.com/',
      discord: '#',
    },
  },
  {
    name: 'DEV NAME',
    role: 'Lead Developer',
    image: 'https://picsum.photos/seed/team2/400/400',
    bio: 'Building the technical infrastructure. Making sure everything runs smoothly on Solana.',
    socials: {
      twitter: 'https://x.com/',
    },
  },
  {
    name: 'COMMUNITY LEAD',
    role: 'Community Manager',
    image: 'https://picsum.photos/seed/team3/400/400',
    bio: 'Keeping the Discord alive and the vibes immaculate. Your go-to for community questions.',
    socials: {
      twitter: 'https://x.com/',
      discord: '#',
    },
  },
  {
    name: 'ARTIST NAME',
    role: 'Artist',
    image: 'https://picsum.photos/seed/team4/400/400',
    bio: 'Creating stunning visuals and custom artwork. Master of retro aesthetics.',
    socials: {
      twitter: 'https://x.com/',
    },
  },
]

export default function Team() {
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
            <GlitchText text="THE TEAM" />
          </h1>
          <p className="text-static-gray font-mono max-w-xl mx-auto">
            Meet the humans behind the pixels. We're a small team with big dreams.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, rotate: 2 }}
              className="group"
            >
              <div className="bg-black border-4 border-white overflow-hidden relative">
                {/* Glitch Effect Layers */}
                <div className="absolute inset-0 bg-primo-red/0 group-hover:bg-primo-red/20 translate-x-0 group-hover:translate-x-1 transition-all z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-primo-cyan/0 group-hover:bg-primo-cyan/20 translate-x-0 group-hover:-translate-x-1 transition-all z-10 pointer-events-none" />

                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    whileHover={{ scale: 1.1 }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Role Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primo-pink text-black text-xs font-display">
                    {member.role.toUpperCase()}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 border-t-4 border-white">
                  <h3 className="font-display text-xl text-white mb-1 flex items-center gap-2">
                    {member.name}
                    <Sparkles size={16} className="text-primo-yellow" />
                  </h3>
                  <p className="text-primo-cyan font-mono text-sm mb-3">{member.role}</p>
                  <p className="text-static-gray text-sm mb-4">{member.bio}</p>

                  {/* Socials */}
                  <div className="flex gap-2">
                    {member.socials.twitter && (
                      <motion.a
                        href={member.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-static-dark border border-static-gray text-static-gray hover:text-primo-cyan hover:border-primo-cyan transition-colors"
                      >
                        <Twitter size={18} />
                      </motion.a>
                    )}
                    {member.socials.discord && (
                      <motion.a
                        href={member.socials.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2, rotate: -10 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-static-dark border border-static-gray text-static-gray hover:text-primo-pink hover:border-primo-pink transition-colors"
                      >
                        <MessageCircle size={18} />
                      </motion.a>
                    )}
                    {member.socials.website && (
                      <motion.a
                        href={member.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-static-dark border border-static-gray text-static-gray hover:text-primo-green hover:border-primo-green transition-colors"
                      >
                        <Globe size={18} />
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primo-pink" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primo-cyan" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join the Team */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 text-center"
        >
          <div className="inline-block bg-static-dark border-4 border-dashed border-primo-cyan p-8">
            <h2 className="font-display text-2xl text-white mb-4">WANT TO JOIN US?</h2>
            <p className="text-static-gray mb-6 max-w-md">
              We're always looking for talented individuals who share our passion for
              retro aesthetics and Web3 innovation.
            </p>
            <motion.a
              href="https://discord.gg/primos"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primo-cyan text-black font-display tracking-wider hover:bg-white transition-colors"
            >
              <MessageCircle size={20} />
              REACH OUT ON DISCORD
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
