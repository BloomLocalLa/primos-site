import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Send, Sparkles, MessageSquare } from 'lucide-react'
import GlitchText from '../components/GlitchText'

export default function Artwork() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    idea: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission - could integrate with a backend/email service
    console.log('Submitted:', formData)
    setSubmitted(true)
    setFormData({ name: '', email: '', idea: '' })
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block mb-6"
          >
            <Palette size={64} className="text-primo-pink" />
          </motion.div>
          <h1 className="font-display text-6xl md:text-8xl text-white mb-4">
            <GlitchText text="CUSTOM ART" />
          </h1>
          <p className="text-static-gray font-mono max-w-xl mx-auto">
            Commission unique artwork in the Primos retro style.
          </p>
        </motion.div>

        {/* Coming Soon Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primo-pink/20 via-primo-purple/20 to-primo-cyan/20 blur-xl" />
          <div className="relative bg-black border-4 border-white p-12 text-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-4 right-4"
            >
              <Sparkles className="text-primo-yellow" size={24} />
            </motion.div>

            <h2 className="font-display text-5xl md:text-7xl text-white mb-4">
              COMING SOON
            </h2>
            <p className="text-white/60 font-mono text-lg mb-2">
              Custom art commissions are on the way.
            </p>
            <p className="text-primo-cyan font-mono">
              PFPs • Banners • Full Illustrations
            </p>

            {/* Animated line */}
            <motion.div
              className="h-1 bg-gradient-to-r from-primo-pink via-primo-cyan to-primo-purple mt-8 mx-auto"
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ maxWidth: '300px' }}
            />
          </div>
        </motion.div>

        {/* Tell Us What You Want */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <MessageSquare className="text-primo-cyan" size={28} />
              <h2 className="font-display text-3xl text-white">TELL US WHAT YOU WANT TO SEE</h2>
            </div>
            <p className="text-static-gray font-mono">
              Your ideas help shape what we create. Let us know what kind of custom art you'd love.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primo-green/20 border-2 border-primo-green p-8 text-center"
            >
              <div className="text-primo-green text-5xl mb-4">✓</div>
              <h3 className="font-display text-2xl text-white mb-2">THANKS FOR YOUR INPUT!</h3>
              <p className="text-static-gray font-mono">We'll take your ideas into consideration.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2 border-2 border-white text-white font-display hover:bg-white hover:text-black transition-colors"
              >
                SUBMIT ANOTHER IDEA
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-static-dark border-4 border-white p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block font-display text-white mb-2">NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black border-2 border-white text-white font-mono focus:border-primo-pink outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block font-display text-white mb-2">EMAIL</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black border-2 border-white text-white font-mono focus:border-primo-pink outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block font-display text-white mb-2">WHAT KIND OF ART WOULD YOU LIKE?</label>
                <textarea
                  required
                  rows={5}
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-white text-white font-mono focus:border-primo-pink outline-none transition-colors resize-none"
                  placeholder="Custom PFPs? Animated art? Physical prints? Tell us your ideas..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-primo-pink to-primo-purple text-white font-display text-lg tracking-wider border-2 border-white hover:shadow-[0_0_30px_rgba(255,20,147,0.5)] transition-shadow flex items-center justify-center gap-3"
              >
                <Send size={20} />
                SUBMIT YOUR IDEA
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
