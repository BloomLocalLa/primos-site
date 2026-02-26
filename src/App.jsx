import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useState, createContext } from 'react'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import TVStatic from './components/TVStatic'
import CustomCursor from './components/CustomCursor'
import GlitchedBackground from './components/GlitchedBackground'

import Home from './pages/Home'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Team from './pages/Team'
import Community from './pages/Community'
import Merch from './pages/Merch'
import Artwork from './pages/Artwork'
import FAQ from './pages/FAQ'

// Cart Context
export const CartContext = createContext()

function App() {
  const location = useLocation()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      <div className="vhs-static scanlines min-h-screen bg-static-black relative">
        <GlitchedBackground />
        <CustomCursor />
        <TVStatic />
        <Navbar />

        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/community" element={<Community />} />
              <Route path="/merch" element={<Merch />} />
              <Route path="/artwork" element={<Artwork />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </CartContext.Provider>
  )
}

export default App
