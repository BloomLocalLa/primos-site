import { useState, useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { CartContext } from '../App'
import CartDrawer from './CartDrawer'

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/gallery', label: 'GALLERY' },
  { path: '/about', label: 'ABOUT' },
  { path: '/team', label: 'TEAM' },
  { path: '/community', label: 'COMMUNITY' },
  { path: '/merch', label: 'MERCH' },
  { path: '/artwork', label: 'ARTWORK' },
  { path: '/faq', label: 'FAQ' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { cart, setIsCartOpen } = useContext(CartContext)

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/90 backdrop-blur-md border-b-2 border-primo-pink' : 'bg-transparent'
        }`}
      >
        {/* Marquee Banner */}
        <div className="bg-primo-pink text-black py-1 overflow-hidden">
          <div className="marquee">
            <span className="marquee-content font-display text-sm tracking-widest">
              PRIMOS NFT COLLECTION - 2,746 UNIQUE CHARACTERS - LIVE ON SOLANA - JOIN THE COMMUNITY -
              PRIMOS NFT COLLECTION - 2,746 UNIQUE CHARACTERS - LIVE ON SOLANA - JOIN THE COMMUNITY -
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                src="/logo.png"
                alt="Primos"
                className="w-10 h-10"
                whileHover={{ scale: 1.15, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
              <span className="font-display text-2xl text-white glitch-text" data-text="PRIMOS">
                PRIMOS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group"
                >
                  <motion.span
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`block px-4 py-2 font-display text-sm tracking-wider transition-all
                      ${location.pathname === link.path
                        ? 'text-primo-pink'
                        : 'text-white hover:text-primo-cyan'
                      }`}
                  >
                    {link.label}
                  </motion.span>
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primo-pink"
                    />
                  )}
                  <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            {/* Right Side - Cart & Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-white hover:text-primo-cyan transition-colors"
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primo-pink text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-white hover:text-primo-pink transition-colors"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 border-t-2 border-primo-cyan overflow-hidden"
            >
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`block py-3 px-4 font-display text-xl tracking-wider border-l-4 transition-all
                        ${location.pathname === link.path
                          ? 'border-primo-pink text-primo-pink bg-white/5'
                          : 'border-transparent text-white hover:border-primo-cyan hover:text-primo-cyan'
                        }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartDrawer />
    </>
  )
}
