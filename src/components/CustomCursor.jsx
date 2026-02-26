import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isPointer, setIsPointer] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [trail, setTrail] = useState([
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 },
  ])
  const [isMounted, setIsMounted] = useState(false)

  const colors = ['#E91E8C', '#00CED1', '#FFD700', '#9B59B6']

  useEffect(() => {
    setIsMounted(true)

    // Check for touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    let trailPositions = [
      { x: -100, y: -100 },
      { x: -100, y: -100 },
      { x: -100, y: -100 },
      { x: -100, y: -100 },
    ]
    let currentPos = { x: -100, y: -100 }
    let animationId

    const animate = () => {
      // Update trail positions with smooth follow
      trailPositions[0].x += (currentPos.x - trailPositions[0].x) * 0.35
      trailPositions[0].y += (currentPos.y - trailPositions[0].y) * 0.35

      for (let i = 1; i < 4; i++) {
        trailPositions[i].x += (trailPositions[i - 1].x - trailPositions[i].x) * 0.3
        trailPositions[i].y += (trailPositions[i - 1].y - trailPositions[i].y) * 0.3
      }

      setTrail(trailPositions.map(p => ({ ...p })))
      animationId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e) => {
      currentPos = { x: e.clientX, y: e.clientY }
      setPosition({ x: e.clientX, y: e.clientY })

      const target = e.target
      const isClickable =
        target.tagName === 'A' ||
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

    animate()
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      cancelAnimationFrame(animationId)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Don't render on touch devices or before mount
  if (!isMounted) return null
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      {/* 4 Trailing colored orbs */}
      {trail.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            left: pos.x - 8,
            top: pos.y - 8,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: colors[i],
            opacity: 0.85 - i * 0.12,
            boxShadow: `0 0 ${12 - i * 2}px ${colors[i]}`,
            pointerEvents: 'none',
            zIndex: 99999 - i,
          }}
        />
      ))}

      {/* Outer ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: position.x - 24,
          top: position.y - 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `2px solid ${isPointer ? '#E91E8C' : 'rgba(255,255,255,0.5)'}`,
          boxShadow: isPointer ? '0 0 20px #E91E8C' : 'none',
          pointerEvents: 'none',
          zIndex: 99998,
        }}
        animate={{
          scale: isPointer ? 1.3 : isClicking ? 0.8 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      />

      {/* Center dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: position.x - 6,
          top: position.y - 6,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 10px rgba(255,255,255,0.9)',
          pointerEvents: 'none',
          zIndex: 100000,
        }}
        animate={{
          scale: isClicking ? 0.6 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  )
}
