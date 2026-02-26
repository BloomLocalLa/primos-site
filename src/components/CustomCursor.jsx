import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [glitchOffset, setGlitchOffset] = useState({ r: 0, g: 0, b: 0 })
  const trailRef = useRef([])

  useEffect(() => {
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setGlitchOffset({
          r: (Math.random() - 0.5) * 6,
          g: (Math.random() - 0.5) * 4,
          b: (Math.random() - 0.5) * 6,
        })
        setTimeout(() => setGlitchOffset({ r: 0, g: 0, b: 0 }), 50)
      }
    }, 200)

    return () => clearInterval(glitchInterval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

      // Check if hovering over clickable element
      const target = e.target
      const isClickable = target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        window.getComputedStyle(target).cursor === 'pointer'
      setIsPointer(isClickable)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [])

  // Hide on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Hide default cursor */}
          <style>{`* { cursor: none !important; }`}</style>

          {/* RGB Glitch Layers */}
          <motion.div
            className="fixed pointer-events-none z-[9998]"
            animate={{
              x: position.x - 12 + glitchOffset.r,
              y: position.y - 12,
            }}
            transition={{ type: 'spring', stiffness: 800, damping: 35 }}
          >
            <div
              className="w-6 h-6 opacity-50"
              style={{
                background: 'transparent',
                border: '2px solid #ff0000',
                mixBlendMode: 'screen',
              }}
            />
          </motion.div>

          <motion.div
            className="fixed pointer-events-none z-[9998]"
            animate={{
              x: position.x - 12 + glitchOffset.b,
              y: position.y - 12,
            }}
            transition={{ type: 'spring', stiffness: 800, damping: 35 }}
          >
            <div
              className="w-6 h-6 opacity-50"
              style={{
                background: 'transparent',
                border: '2px solid #00ffff',
                mixBlendMode: 'screen',
              }}
            />
          </motion.div>

          {/* Main Cursor - Retro Crosshair */}
          <motion.div
            className="fixed pointer-events-none z-[10000]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              x: position.x - 16,
              y: position.y - 16,
              scale: isClicking ? 0.8 : isPointer ? 1.2 : 1,
              rotate: isPointer ? 45 : 0,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          >
            {/* Crosshair Design */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              {/* Outer corners */}
              <path d="M4 4 L4 10" stroke={isPointer ? '#E91E8C' : '#ffffff'} strokeWidth="2"/>
              <path d="M4 4 L10 4" stroke={isPointer ? '#E91E8C' : '#ffffff'} strokeWidth="2"/>

              <path d="M28 4 L28 10" stroke={isPointer ? '#00CED1' : '#ffffff'} strokeWidth="2"/>
              <path d="M28 4 L22 4" stroke={isPointer ? '#00CED1' : '#ffffff'} strokeWidth="2"/>

              <path d="M4 28 L4 22" stroke={isPointer ? '#FFD700' : '#ffffff'} strokeWidth="2"/>
              <path d="M4 28 L10 28" stroke={isPointer ? '#FFD700' : '#ffffff'} strokeWidth="2"/>

              <path d="M28 28 L28 22" stroke={isPointer ? '#9B59B6' : '#ffffff'} strokeWidth="2"/>
              <path d="M28 28 L22 28" stroke={isPointer ? '#9B59B6' : '#ffffff'} strokeWidth="2"/>

              {/* Center dot */}
              <circle
                cx="16"
                cy="16"
                r={isPointer ? 4 : 2}
                fill={isPointer ? '#E91E8C' : '#ffffff'}
              />

              {/* Center crosshair */}
              <path d="M16 10 L16 14" stroke={isPointer ? '#E91E8C' : '#ffffff'} strokeWidth="1.5"/>
              <path d="M16 18 L16 22" stroke={isPointer ? '#E91E8C' : '#ffffff'} strokeWidth="1.5"/>
              <path d="M10 16 L14 16" stroke={isPointer ? '#E91E8C' : '#ffffff'} strokeWidth="1.5"/>
              <path d="M18 16 L22 16" stroke={isPointer ? '#E91E8C' : '#ffffff'} strokeWidth="1.5"/>
            </svg>
          </motion.div>

          {/* Click ripple effect */}
          <AnimatePresence>
            {isClicking && (
              <motion.div
                className="fixed pointer-events-none z-[9997]"
                initial={{
                  x: position.x - 30,
                  y: position.y - 30,
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  scale: 2,
                  opacity: 0
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="w-[60px] h-[60px] rounded-full border-2 border-primo-pink"
                  style={{ boxShadow: '0 0 20px #E91E8C' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanline effect on cursor */}
          <motion.div
            className="fixed pointer-events-none z-[10001] overflow-hidden"
            animate={{
              x: position.x - 16,
              y: position.y - 16,
            }}
            transition={{ type: 'spring', stiffness: 800, damping: 35 }}
          >
            <div
              className="w-8 h-8"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
