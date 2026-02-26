import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Star, Clock, Check, Send, DollarSign, X, ArrowRight, Sparkles } from 'lucide-react'
import GlitchText from '../components/GlitchText'

const tiers = [
  {
    name: 'BASIC',
    price: 50,
    features: [
      'Single character portrait',
      'Digital delivery (PNG)',
      'One revision included',
      '5-7 day turnaround',
    ],
    popular: false,
    color: 'border-primo-cyan',
    accent: 'bg-primo-cyan',
  },
  {
    name: 'STANDARD',
    price: 150,
    features: [
      'Full character illustration',
      'Simple background',
      'Digital delivery (PNG + PSD)',
      'Three revisions included',
      '7-10 day turnaround',
    ],
    popular: true,
    color: 'border-primo-pink',
    accent: 'bg-primo-pink',
  },
  {
    name: 'PREMIUM',
    price: 300,
    features: [
      'Full scene illustration',
      'Complex background',
      'Digital delivery (all formats)',
      'Unlimited revisions',
      '10-14 day turnaround',
      'Commercial rights included',
    ],
    popular: false,
    color: 'border-primo-yellow',
    accent: 'bg-primo-yellow',
  },
]

const portfolio = [
  { id: 1, image: 'https://picsum.photos/seed/art1/600/600', title: 'Retro Portrait' },
  { id: 2, image: 'https://picsum.photos/seed/art2/600/600', title: 'Neon Dreams' },
  { id: 3, image: 'https://picsum.photos/seed/art3/600/600', title: '90s Vibes' },
  { id: 4, image: 'https://picsum.photos/seed/art4/600/600', title: 'Static Soul' },
  { id: 5, image: 'https://picsum.photos/seed/art5/600/600', title: 'TV Head' },
  { id: 6, image: 'https://picsum.photos/seed/art6/600/600', title: 'Glitch Art' },
]

const process = [
  { step: 1, title: 'SUBMIT REQUEST', description: 'Fill out the form with your vision and preferences.' },
  { step: 2, title: 'CONSULTATION', description: 'We discuss your ideas and finalize the concept.' },
  { step: 3, title: 'SKETCH PHASE', description: 'Initial sketches for your approval before coloring.' },
  { step: 4, title: 'FINAL ARTWORK', description: 'Polished piece delivered in your chosen format.' },
]

export default function Artwork() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tier: 'STANDARD',
    description: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    alert('Commission request submitted! We\'ll be in touch soon.')
    setFormData({ name: '', email: '', tier: 'STANDARD', description: '' })
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
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
            Commission unique artwork in the Primos retro style. Perfect for PFPs, banners, or special projects.
          </p>
        </motion.div>

        {/* Portfolio Gallery */}
        <section className="mb-20">
          <h2 className="font-display text-3xl text-white mb-8 flex items-center gap-3">
            <Sparkles className="text-primo-cyan" />
            PORTFOLIO
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {portfolio.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                onClick={() => setSelectedImage(item)}
                className="relative aspect-square cursor-pointer group"
              >
                <div className="absolute inset-0 border-4 border-white overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                    <span className="font-display text-white">{item.title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="mb-20">
          <h2 className="font-display text-3xl text-white mb-8 flex items-center gap-3">
            <DollarSign className="text-primo-yellow" />
            PRICING
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative bg-black border-4 ${tier.color} p-6 ${
                  tier.popular ? 'ring-2 ring-primo-pink ring-offset-4 ring-offset-black' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primo-pink text-black font-display text-sm">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-display text-2xl text-white mb-2">{tier.name}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-static-gray">$</span>
                    <span className="font-display text-5xl text-white">{tier.price}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-static-gray">
                      <Check size={16} className="text-primo-green flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, tier: tier.name })}
                  className={`w-full py-3 font-display tracking-wider transition-colors ${tier.accent} text-black hover:opacity-90`}
                >
                  SELECT {tier.name}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mb-20">
          <h2 className="font-display text-3xl text-white mb-8 flex items-center gap-3">
            <Clock className="text-primo-green" />
            THE PROCESS
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            {process.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-static-dark border-2 border-white p-6">
                  <div className="w-12 h-12 bg-primo-pink text-black font-display text-xl flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-display text-white mb-2">{item.title}</h3>
                  <p className="text-static-gray text-sm">{item.description}</p>
                </div>
                {index < process.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 text-primo-cyan" size={24} />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Commission Form */}
        <section>
          <h2 className="font-display text-3xl text-white mb-8 flex items-center gap-3">
            <Send className="text-primo-pink" />
            REQUEST COMMISSION
          </h2>

          <motion.form
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="bg-static-dark border-4 border-white p-8"
          >
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

            <div className="mb-6">
              <label className="block font-display text-white mb-2">TIER</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-4 py-3 bg-black border-2 border-white text-white font-mono cursor-pointer focus:border-primo-pink outline-none transition-colors"
              >
                {tiers.map((tier) => (
                  <option key={tier.name} value={tier.name}>
                    {tier.name} - ${tier.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <label className="block font-display text-white mb-2">DESCRIBE YOUR VISION</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-black border-2 border-white text-white font-mono focus:border-primo-pink outline-none transition-colors resize-none"
                placeholder="Tell us about your project. Include any reference images, color preferences, or specific requirements..."
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primo-pink to-primo-purple text-white font-display text-lg tracking-wider border-2 border-white hover:shadow-[0_0_30px_rgba(255,20,147,0.5)] transition-shadow"
            >
              SUBMIT REQUEST
            </motion.button>
          </motion.form>
        </section>

        {/* Image Modal */}
        <AnimatePresence>
          {selectedImage && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                className="fixed inset-0 bg-black/90 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-4 md:inset-20 z-50 flex items-center justify-center"
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 p-2 text-white hover:text-primo-pink transition-colors"
                >
                  <X size={32} />
                </button>
                <div className="border-4 border-white max-w-full max-h-full">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
