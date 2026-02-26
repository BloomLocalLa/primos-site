import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Twitter, MessageCircle, ExternalLink, Zap } from 'lucide-react'

const socialLinks = [
  { icon: Twitter, label: 'X / Twitter', href: 'https://x.com/PrimosNFT' },
  { icon: MessageCircle, label: 'Discord', href: 'https://discord.gg/primos' },
  { icon: ExternalLink, label: 'Magic Eden', href: 'https://magiceden.io/marketplace/primos' },
]

const footerLinks = [
  { label: 'Gallery', path: '/gallery' },
  { label: 'About', path: '/about' },
  { label: 'Team', path: '/team' },
  { label: 'Community', path: '/community' },
  { label: 'Merch', path: '/merch' },
  { label: 'Artwork', path: '/artwork' },
  { label: 'FAQ', path: '/faq' },
]

export default function Footer() {
  return (
    <footer className="relative bg-black border-t-4 border-primo-pink mt-20">
      {/* Animated Top Bar */}
      <div className="h-1 bg-gradient-to-r from-primo-pink via-primo-cyan via-primo-yellow to-primo-green animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                src="/logo.png"
                alt="Primos"
                className="w-12 h-12 rounded-full"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
              <span className="font-display text-3xl text-white glitch-text">PRIMOS</span>
            </Link>
            <p className="text-static-gray text-sm leading-relaxed">
              2,746 unique characters living on the Solana blockchain.
              A celebration of 90s nostalgia, bold art, and community spirit.
            </p>
            <div className="flex items-center gap-2 text-primo-yellow">
              <Zap size={16} />
              <span className="text-xs font-mono">POWERED BY SOLANA</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg text-primo-pink mb-4 tracking-wider">NAVIGATE</h3>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-static-gray hover:text-primo-cyan transition-colors text-sm py-1"
                >
                  → {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-display text-lg text-primo-cyan mb-4 tracking-wider">CONNECT</h3>
            <div className="space-y-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="flex items-center gap-3 text-static-gray hover:text-white transition-colors group"
                >
                  <span className="p-2 bg-white/5 rounded group-hover:bg-primo-pink/20 transition-colors">
                    <social.icon size={20} />
                  </span>
                  <span className="font-mono text-sm">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-static-dark">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-static-gray text-xs font-mono">
              © {new Date().getFullYear()} PRIMOS NFT. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-static-gray">
              <span className="w-2 h-2 bg-primo-green rounded-full animate-pulse" />
              <span>LIVE ON MAINNET</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primo-pink/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primo-cyan/10 blur-3xl" />
    </footer>
  )
}
