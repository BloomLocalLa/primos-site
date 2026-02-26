import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [trail, setTrail] = useState([])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })

      // Add to trail
      setTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: Date.now() }]
        return newTrail.slice(-8) // Keep last 8 positions
      })

      // Check if hovering over clickable element
      const target = e.target
      const isClickable = target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer'
      setIsPointer(isClickable)
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Hide on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      {/* Trail */}
      {trail.map((point, i) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed pointer-events-none z-[9999] mix-blend-difference"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            width: 8,
            height: 8,
            backgroundColor: i % 2 === 0 ? '#FF1493' : '#00FFFF',
            borderRadius: '50%',
          }}
        />
      ))}

      {/* Main Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[10000] mix-blend-difference"
        animate={{
          x: position.x - 10,
          y: position.y - 10,
          scale: isClicking ? 0.8 : isPointer ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 ${
            isPointer ? 'border-primo-pink bg-primo-pink/30' : 'border-white'
          } transition-colors duration-150`}
        />
      </motion.div>

      {/* Outer Ring */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isPointer ? 1.3 : 1,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      >
        <div className="w-10 h-10 rounded-full border border-primo-cyan/50" />
      </motion.div>
    </>
  )
}
