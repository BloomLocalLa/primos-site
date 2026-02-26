import { useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Wallet } from 'lucide-react'
import { CartContext } from '../App'

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal
  } = useContext(CartContext)

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-static-dark border-l-4 border-primo-pink z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-static-gray/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primo-pink" size={24} />
                <h2 className="font-display text-xl text-white tracking-wider">YOUR CART</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-static-gray hover:text-white transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-static-gray mb-4"
                  >
                    <ShoppingBag size={48} className="mx-auto opacity-50" />
                  </motion.div>
                  <p className="text-static-gray font-mono">Your cart is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 retro-btn text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/50 border border-static-gray/30 p-4 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-static-gray/20 flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-static-gray">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-white truncate">{item.name}</h3>
                      <p className="text-primo-cyan font-mono text-sm">${item.price}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-static-gray/20 hover:bg-primo-pink/20 transition-colors"
                        >
                          <Minus size={14} />
                        </motion.button>
                        <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-static-gray/20 hover:bg-primo-cyan/20 transition-colors"
                        >
                          <Plus size={14} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="text-static-gray hover:text-primo-red transition-colors self-start"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-static-gray/30 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-static-gray">TOTAL</span>
                  <span className="font-display text-2xl text-primo-pink">${cartTotal.toFixed(2)}</span>
                </div>

                {/* Payment Options */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primo-pink to-primo-purple text-white font-display tracking-wider flex items-center justify-center gap-2 border-2 border-white hover:shadow-[0_0_20px_rgba(255,20,147,0.5)] transition-shadow"
                  >
                    <CreditCard size={20} />
                    PAY WITH CARD
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primo-purple to-primo-cyan text-white font-display tracking-wider flex items-center justify-center gap-2 border-2 border-white hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-shadow"
                  >
                    <Wallet size={20} />
                    PAY WITH SOLANA
                  </motion.button>
                </div>

                <p className="text-xs text-static-gray text-center font-mono">
                  Secure checkout powered by Stripe & Solana Pay
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
