import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Minus, ExternalLink } from 'lucide-react'

export default function FAQAccordion({ items = [], category = '' }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="space-y-2">
      {category && (
        <h3 className="font-display text-primo-pink text-lg tracking-wider mb-4">{category}</h3>
      )}

      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border-2 border-white bg-black overflow-hidden"
        >
          {/* Question */}
          <motion.button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-left group gap-3"
            whileHover={{ backgroundColor: 'rgba(255, 20, 147, 0.1)' }}
          >
            <span className="font-display text-sm md:text-base text-white group-hover:text-primo-pink transition-colors">
              {item.question}
            </span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-primo-cyan flex-shrink-0"
            >
              {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
            </motion.div>
          </motion.button>

          {/* Answer */}
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 md:px-6 pb-3 md:pb-4 text-static-gray border-t border-static-dark pt-3 md:pt-4">
                  <motion.p
                    initial={{ y: -10 }}
                    animate={{ y: 0 }}
                    className="leading-relaxed text-sm md:text-base"
                  >
                    {item.answer}
                  </motion.p>

                  {item.links && (
                    <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                      {item.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-static-dark border border-static-gray text-white text-xs md:text-sm font-display tracking-wide hover:border-primo-cyan hover:text-primo-cyan transition-colors"
                        >
                          {link.label}
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}
