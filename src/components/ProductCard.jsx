import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { CartContext } from '../App'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useContext(CartContext)
  const [added, setAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const {
    id,
    name = 'Product',
    price = 0,
    image,
    description,
    sizes = [],
    inStock = true,
  } = product || {}

  const handleAddToCart = () => {
    addToCart({ id, name, price, image })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="bg-black border-4 border-white overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-static-dark">
          {image ? (
            <motion.img
              src={image}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-static-gray">
              <ShoppingCart size={48} />
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <span className="font-display text-primo-red text-lg tracking-wider">SOLD OUT</span>
            </div>
          )}

          {/* Quick View Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute top-2 right-2 p-2 bg-black/80 text-white border border-white hover:bg-primo-pink hover:border-primo-pink transition-colors"
          >
            <Eye size={20} />
          </motion.button>

          {/* Hover Gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"
          />
        </div>

        {/* Info */}
        <div className="p-4 border-t-4 border-white">
          <h3 className="font-display text-white text-lg truncate mb-1">{name}</h3>
          {description && (
            <p className="text-static-gray text-sm mb-2 line-clamp-2">{description}</p>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="flex gap-1 mb-3">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="px-2 py-1 text-xs border border-static-gray text-static-gray hover:border-primo-cyan hover:text-primo-cyan transition-colors cursor-pointer"
                >
                  {size}
                </span>
              ))}
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl text-primo-cyan">${price}</span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={!inStock || added}
              className={`flex items-center gap-2 px-4 py-2 font-display text-sm tracking-wider transition-all ${
                added
                  ? 'bg-primo-green text-black'
                  : inStock
                  ? 'bg-primo-pink text-white hover:bg-white hover:text-black'
                  : 'bg-static-dark text-static-gray cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check size={16} />
                  ADDED!
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  ADD
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-primo-pink" />
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-primo-cyan" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primo-yellow" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primo-green" />
    </motion.div>
  )
}
