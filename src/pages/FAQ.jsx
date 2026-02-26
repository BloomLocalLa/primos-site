import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Search, MessageCircle, Twitter, ExternalLink } from 'lucide-react'
import GlitchText from '../components/GlitchText'
import FAQAccordion from '../components/FAQAccordion'

const faqCategories = [
  {
    name: 'GENERAL',
    icon: HelpCircle,
    color: 'text-primo-pink',
    items: [
      {
        question: 'What is Primos?',
        answer: 'Primos is a collection of 2,746 unique digital collectibles (NFTs) living on the Solana blockchain. Each Primo is a one-of-a-kind character inspired by 90s TV nostalgia, featuring bold colors and retro aesthetics.',
      },
      {
        question: 'What blockchain is Primos on?',
        answer: 'Primos is built on Solana, known for its fast transactions and low fees. This makes buying, selling, and trading Primos quick and affordable.',
      },
      {
        question: 'How many Primos exist?',
        answer: 'The total supply is 2,746 unique Primos. Each one has its own combination of traits, making every Primo special and different.',
      },
      {
        question: 'What makes Primos unique?',
        answer: 'Beyond the art, Primos represents a celebration of 90s culture and nostalgia. We focus on building a genuine community of collectors who share our love for retro aesthetics and the early days of television.',
      },
    ],
  },
  {
    name: 'BUYING & TRADING',
    icon: ExternalLink,
    color: 'text-primo-cyan',
    items: [
      {
        question: 'Where can I buy a Primo?',
        answer: 'Primos are available on Magic Eden, the largest NFT marketplace on Solana. Simply connect your Solana wallet (like Phantom or Solflare), browse the collection, and purchase any listed Primo.',
      },
      {
        question: 'What wallet do I need?',
        answer: 'We recommend using Phantom or Solflare wallets. Both are user-friendly and fully compatible with Solana NFTs. Make sure to fund your wallet with SOL before purchasing.',
      },
      {
        question: 'How do I know if a Primo is authentic?',
        answer: 'Always purchase from the official Primos collection on Magic Eden. Check that the collection is verified (blue checkmark) and the contract address matches our official one.',
      },
      {
        question: 'Can I sell my Primo?',
        answer: 'Yes! You own your Primo completely. List it on Magic Eden anytime. You set the price, and Magic Eden handles the rest. Royalties help support continued development.',
      },
    ],
  },
  {
    name: 'MERCHANDISE',
    icon: ExternalLink,
    color: 'text-primo-yellow',
    items: [
      {
        question: 'How do I buy merchandise?',
        answer: 'Visit our Merch page, add items to your cart, and checkout using either traditional card payment (Stripe) or Solana Pay for crypto payments.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship worldwide. Shipping costs and delivery times vary by location. All orders include tracking information.',
      },
      {
        question: 'Can I pay with crypto?',
        answer: 'Absolutely! We accept SOL and other SPL tokens via Solana Pay. Just select "Pay with Solana" at checkout and scan the QR code with your wallet.',
      },
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 30 days for unworn/unused items. Reach out to us on Discord for return instructions. Custom items are final sale.',
      },
    ],
  },
  {
    name: 'CUSTOM ARTWORK',
    icon: ExternalLink,
    color: 'text-primo-green',
    items: [
      {
        question: 'How do I commission artwork?',
        answer: 'Visit our Artwork page, choose a tier that fits your needs, and fill out the commission form. We\'ll reach out to discuss your vision and provide a timeline.',
      },
      {
        question: 'What styles do you offer?',
        answer: 'We specialize in the Primos retro/90s TV aesthetic but can adapt our style to your preferences. During consultation, we\'ll work together to nail down the exact look you want.',
      },
      {
        question: 'How long does a commission take?',
        answer: 'Turnaround depends on the tier: Basic (5-7 days), Standard (7-10 days), Premium (10-14 days). Rush orders may be available for an additional fee.',
      },
      {
        question: 'Do I get commercial rights?',
        answer: 'Commercial rights are included with Premium tier commissions. For Basic and Standard tiers, commercial licensing can be added for an additional fee.',
      },
    ],
  },
]

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="inline-block mb-6"
          >
            <HelpCircle size={64} className="text-primo-cyan" />
          </motion.div>
          <h1 className="font-display text-6xl md:text-8xl text-white mb-4">
            <GlitchText text="FAQ" />
          </h1>
          <p className="text-static-gray font-mono max-w-xl mx-auto">
            Got questions? We've got answers. If you can't find what you're looking for, hit us up on Discord.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-static-gray" size={20} />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-black border-4 border-white text-white font-mono placeholder:text-static-gray focus:border-primo-pink outline-none transition-colors"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 font-display text-sm tracking-wider border-2 transition-all ${
              activeCategory === null
                ? 'border-primo-pink bg-primo-pink text-black'
                : 'border-white text-white hover:border-primo-cyan'
            }`}
          >
            ALL
          </button>
          {faqCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-2 font-display text-sm tracking-wider border-2 transition-all ${
                activeCategory === cat.name
                  ? 'border-primo-pink bg-primo-pink text-black'
                  : 'border-white text-white hover:border-primo-cyan'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {(searchQuery ? filteredCategories : faqCategories)
            .filter((cat) => !activeCategory || cat.name === activeCategory)
            .map((category, index) => (
              <motion.section
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <category.icon size={24} className={category.color} />
                  <h2 className="font-display text-2xl text-white">{category.name}</h2>
                </div>
                <FAQAccordion items={category.items} />
              </motion.section>
            ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-static-gray font-mono mb-4">No results found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-primo-cyan hover:text-primo-pink transition-colors"
            >
              Clear search
            </button>
          </motion.div>
        )}

        {/* Still Have Questions */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-primo-pink/20 via-primo-cyan/20 to-primo-yellow/20 border-4 border-white p-8 text-center">
            <h2 className="font-display text-3xl text-white mb-4">
              STILL HAVE <span className="text-primo-pink">QUESTIONS</span>?
            </h2>
            <p className="text-static-gray mb-8 max-w-md mx-auto">
              Can't find what you're looking for? Our community is here to help.
              Join our Discord or reach out on X.
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
                ASK ON DISCORD
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
                DM ON X
              </motion.a>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
