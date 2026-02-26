import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [trail, setTrail] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ])

  const colors = ['#E91E8C', '#00CED1', '#FFD700', '#9B59B6'] // pink, cyan, yellow, purple

  useEffect(() => {
    let animationFrame
    const trailPositions = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]

    const updateTrail = () => {
      // Each element follows the previous one with delay
      trailPositions[0].x += (position.x - trailPositions[0].x) * 0.3
      trailPositions[0].y += (position.y - trailPositions[0].y) * 0.3

      for (let i = 1; i < 4; i++) {
        trailPositions[i].x += (trailPositions[i - 1].x - trailPositions[i].x) * 0.25
        trailPositions[i].y += (trailPositions[i - 1].y - trailPositions[i].y) * 0.25
      }

      setTrail([...trailPositions])
      animationFrame = requestAnimationFrame(updateTrail)
    }

    animationFrame = requestAnimationFrame(updateTrail)
    return () => cancelAnimationFrame(animationFrame)
  }, [position])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

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
          {/* Trailing colored elements */}
          {trail.map((pos, i) => (
            <motion.div
              key={i}
              className="fixed pointer-events-none z-[9998]"
              style={{
                left: pos.x - 6,
                top: pos.y - 6,
              }}
            >
              <motion.div
                animate={{
                  scale: isPointer ? 1.3 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: colors[i],
                  opacity: 0.9 - (i * 0.15),
                  boxShadow: `0 0 ${10 + i * 2}px ${colors[i]}`,
                }}
              />
            </motion.div>
          ))}

          {/* Outer ring */}
          <motion.div
            className="fixed pointer-events-none z-[9999]"
            animate={{
              x: position.x - 20,
              y: position.y - 20,
              scale: isPointer ? 1.4 : isClicking ? 0.8 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: `2px solid ${isPointer ? '#E91E8C' : 'rgba(255,255,255,0.6)'}`,
                boxShadow: isPointer ? '0 0 15px #E91E8C' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
          </motion.div>

          {/* Center dot */}
          <motion.div
            className="fixed pointer-events-none z-[10000]"
            animate={{
              x: position.x - 5,
              y: position.y - 5,
              scale: isClicking ? 1.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 10px rgba(255,255,255,0.8)',
              }}
            />
          </motion.div>

          {/* Click burst effect */}
          <AnimatePresence>
            {isClicking && (
              <>
                {colors.map((color, i) => (
                  <motion.div
                    key={`burst-${i}`}
                    className="fixed pointer-events-none z-[9997]"
                    initial={{
                      x: position.x - 8,
                      y: position.y - 8,
                      scale: 0,
                      opacity: 1,
                      rotate: i * 90,
                    }}
                    animate={{
                      scale: 3,
                      opacity: 0,
                      x: position.x - 8 + Math.cos(i * Math.PI / 2) * 30,
                      y: position.y - 8 + Math.sin(i * Math.PI / 2) * 30,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`,
                      }}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
