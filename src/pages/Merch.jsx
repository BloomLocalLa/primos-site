import { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Filter, X, CreditCard, Wallet, Check, Star } from 'lucide-react'
import { CartContext } from '../App'
import GlitchText from '../components/GlitchText'
import ProductCard from '../components/ProductCard'

const products = [
  {
    id: 1,
    name: 'PRIMOS HOODIE',
    price: 79.99,
    image: 'https://picsum.photos/seed/merch1/400/400',
    description: 'Premium heavyweight hoodie with retro Primos graphics.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    featured: true,
    category: 'apparel',
  },
  {
    id: 2,
    name: 'STATIC TEE',
    price: 39.99,
    image: 'https://picsum.photos/seed/merch2/400/400',
    description: 'Classic fit t-shirt with all-over static print.',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    category: 'apparel',
  },
  {
    id: 3,
    name: 'RETRO CAP',
    price: 34.99,
    image: 'https://picsum.photos/seed/merch3/400/400',
    description: 'Snapback cap with embroidered Primos logo.',
    sizes: ['One Size'],
    inStock: true,
    category: 'accessories',
  },
  {
    id: 4,
    name: 'PRIMO POSTER',
    price: 24.99,
    image: 'https://picsum.photos/seed/merch4/400/400',
    description: '18x24 premium matte poster. Perfect for your room.',
    sizes: [],
    inStock: true,
    category: 'prints',
  },
  {
    id: 5,
    name: 'TV STATIC MUG',
    price: 19.99,
    image: 'https://picsum.photos/seed/merch5/400/400',
    description: 'Ceramic mug with heat-reactive static pattern.',
    sizes: [],
    inStock: true,
    category: 'accessories',
  },
  {
    id: 6,
    name: 'NOSTALGIA SWEATS',
    price: 69.99,
    image: 'https://picsum.photos/seed/merch6/400/400',
    description: 'Comfortable sweatpants with side stripe graphics.',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: false,
    category: 'apparel',
  },
  {
    id: 7,
    name: 'STICKER PACK',
    price: 12.99,
    image: 'https://picsum.photos/seed/merch7/400/400',
    description: 'Set of 10 holographic Primos stickers.',
    sizes: [],
    inStock: true,
    category: 'accessories',
  },
  {
    id: 8,
    name: 'LIMITED JACKET',
    price: 149.99,
    image: 'https://picsum.photos/seed/merch8/400/400',
    description: 'Limited edition varsity jacket. Only 100 made.',
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    featured: true,
    category: 'apparel',
  },
]

const categories = ['all', 'apparel', 'accessories', 'prints']

export default function Merch() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const { setIsCartOpen, cart } = useContext(CartContext)

  const filteredProducts = products
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      }
    })

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-6xl md:text-8xl text-white mb-4">
            <GlitchText text="MERCH" />
          </h1>
          <p className="text-static-gray font-mono max-w-xl mx-auto">
            Rep your Primos. Premium quality merchandise with retro vibes.
          </p>
        </motion.div>

        {/* Payment Options Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primo-pink/20 to-primo-cyan/20 border-2 border-white p-4 mb-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-white">
              <CreditCard size={20} className="text-primo-cyan" />
              <span className="font-mono">Card Payments</span>
            </div>
            <div className="w-px h-6 bg-static-gray hidden md:block" />
            <div className="flex items-center gap-2 text-white">
              <Wallet size={20} className="text-primo-pink" />
              <span className="font-mono">Solana Pay</span>
            </div>
            <div className="w-px h-6 bg-static-gray hidden md:block" />
            <div className="flex items-center gap-2 text-primo-green">
              <Check size={20} />
              <span className="font-mono">Worldwide Shipping</span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 font-display text-sm tracking-wider border-2 transition-all ${
                  selectedCategory === cat
                    ? 'border-primo-pink bg-primo-pink text-black'
                    : 'border-white text-white hover:border-primo-cyan'
                }`}
              >
                {cat.toUpperCase()}
              </motion.button>
            ))}
          </div>

          {/* Sort & Cart */}
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-black border-2 border-white text-white font-mono cursor-pointer hover:border-primo-cyan transition-colors"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 border-2 border-primo-pink text-primo-pink hover:bg-primo-pink hover:text-black transition-colors"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primo-cyan text-black text-xs font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Featured Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <div className="relative bg-black border-4 border-primo-yellow overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primo-yellow/20 to-transparent" />
            <div className="relative z-10 flex flex-col md:flex-row items-center p-8 gap-8">
              <div className="w-48 h-48 border-4 border-white overflow-hidden flex-shrink-0">
                <img
                  src={products.find(p => p.featured)?.image}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <Star className="text-primo-yellow" size={20} />
                  <span className="text-primo-yellow font-mono text-sm">FEATURED</span>
                </div>
                <h2 className="font-display text-3xl text-white mb-2">LIMITED EDITION JACKET</h2>
                <p className="text-static-gray mb-4">Only 100 made. Premium varsity style with Primos embroidery.</p>
                <span className="font-display text-2xl text-primo-cyan">$149.99</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👕</div>
            <p className="text-static-gray font-mono">No products in this category yet.</p>
          </div>
        )}

        {/* Info Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 grid md:grid-cols-3 gap-8"
        >
          <div className="bg-static-dark border-2 border-white p-6 text-center">
            <div className="text-primo-cyan mb-4">
              <CreditCard size={32} className="mx-auto" />
            </div>
            <h3 className="font-display text-white mb-2">SECURE CHECKOUT</h3>
            <p className="text-static-gray text-sm">
              Pay securely with Stripe. All major cards accepted.
            </p>
          </div>

          <div className="bg-static-dark border-2 border-white p-6 text-center">
            <div className="text-primo-pink mb-4">
              <Wallet size={32} className="mx-auto" />
            </div>
            <h3 className="font-display text-white mb-2">SOLANA PAY</h3>
            <p className="text-static-gray text-sm">
              Pay with SOL or SPL tokens. Fast and feeless.
            </p>
          </div>

          <div className="bg-static-dark border-2 border-white p-6 text-center">
            <div className="text-primo-green mb-4">
              <Check size={32} className="mx-auto" />
            </div>
            <h3 className="font-display text-white mb-2">WORLDWIDE SHIPPING</h3>
            <p className="text-static-gray text-sm">
              We ship globally. Tracking included on all orders.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
