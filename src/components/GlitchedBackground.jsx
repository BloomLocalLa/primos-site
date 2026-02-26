import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Actual Primos artwork - these will glitch in and out
const artworkImages = [
  '/artwork/QmcjHTh9pyhzSieqCDx5xTu48oUkYvVsHega2LrrDzuUUj.avif',
  '/artwork/QmdgfUXRHpMHF2cDXS3tM6tedErmD41PkmkP2KpdCUn9LZ.avif',
  '/artwork/Qme1k7C6Fes3o4TcXBGDP2z8scm7ZKiqUxmjhSS1cAxpqF.avif',
  '/artwork/QmeuoJELXHRKDHtkhu2bZnPxorGEmY2aogMmsAL2AnG6AQ.avif',
  '/artwork/QmNMrJGJGcDW5pgxtyzaVfWwMuHqFFpxBi5mYBtKyrp67a.avif',
  '/artwork/QmR6oggbP6jQQ58vcq4v9MnVqdyzcLdVop2txioTNQHd8M.avif',
  '/artwork/QmRS4dqpURvQZgL8p2cufx49jFrSyZStwX7irCpPbUNKwi.avif',
  '/artwork/QmUYe9EFz3g6LLfot2j55bgSsRUHSYYt2ZwsBG4WbcAyDN.avif',
  '/artwork/QmVCHSGKe3CqcXBS4DMnYKkyurQGcqPPdpsdaDhPCkz6RN.avif',
  '/artwork/QmX6ywFVdXwPjjUYcYEqhKMttWmW8ueCzZxHSmj8EKNzbL.avif',
  '/artwork/QmZUWtRTo4RigUSbPwHWQ93gM6azjP1hZCP2HdCLWdp93g.avif',
]

export default function GlitchedBackground() {
  const [currentImage, setCurrentImage] = useState(0)
  const [glitchIntensity, setGlitchIntensity] = useState(0)
  const [horizontalOffset, setHorizontalOffset] = useState(0)
  const [verticalRoll, setVerticalRoll] = useState(0)
  const [showStatic, setShowStatic] = useState(false)
  const [colorShift, setColorShift] = useState({ r: 0, g: 0, b: 0 })

  useEffect(() => {
    // Channel change effect
    const channelInterval = setInterval(() => {
      if (Math.random() < 0.15) {
        setShowStatic(true)
        setGlitchIntensity(1)

        setTimeout(() => {
          setCurrentImage(prev => (prev + 1) % artworkImages.length)
          setShowStatic(false)
          setGlitchIntensity(0.3)

          setTimeout(() => setGlitchIntensity(0), 500)
        }, 150 + Math.random() * 200)
      }
    }, 4000)

    // Rabbit ears adjustment effect (horizontal offset)
    const rabbitEarsInterval = setInterval(() => {
      setHorizontalOffset((Math.random() - 0.5) * 10)
      setTimeout(() => setHorizontalOffset(0), 100)
    }, 2000)

    // Vertical hold drift
    const verticalInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        setVerticalRoll(Math.random() * 20 - 10)
        setTimeout(() => setVerticalRoll(0), 200)
      }
    }, 3000)

    // RGB color separation drift
    const colorInterval = setInterval(() => {
      setColorShift({
        r: (Math.random() - 0.5) * 6,
        g: (Math.random() - 0.5) * 4,
        b: (Math.random() - 0.5) * 6,
      })
    }, 100)

    // Random glitch bursts
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        setGlitchIntensity(0.3 + Math.random() * 0.5)
        setTimeout(() => setGlitchIntensity(0), 50 + Math.random() * 100)
      }
    }, 1500)

    return () => {
      clearInterval(channelInterval)
      clearInterval(rabbitEarsInterval)
      clearInterval(verticalInterval)
      clearInterval(colorInterval)
      clearInterval(glitchInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      {/* Glitched artwork layers with RGB separation */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          transform: `translateX(${horizontalOffset}px) translateY(${verticalRoll}px)`,
          transition: 'transform 0.05s',
        }}
      >
        {/* Red channel */}
        <motion.img
          src={artworkImages[currentImage]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
          style={{
            transform: `translateX(${colorShift.r}px)`,
            filter: 'grayscale(100%) brightness(0.5)',
            opacity: 0.4,
            mixBlendMode: 'multiply',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
        />

        {/* Main image with glitch */}
        <motion.img
          src={artworkImages[currentImage]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: `
              contrast(${1.2 + glitchIntensity * 0.5})
              saturate(${0.6 + glitchIntensity})
              brightness(${0.6 + glitchIntensity * 0.3})
              blur(${glitchIntensity * 2}px)
            `,
            transform: `
              translateX(${horizontalOffset + colorShift.g}px)
              translateY(${verticalRoll}px)
              skewX(${glitchIntensity * 2}deg)
            `,
          }}
        />

        {/* Cyan channel offset */}
        <motion.img
          src={artworkImages[currentImage]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-20"
          style={{
            transform: `translateX(${colorShift.b}px) translateY(${-colorShift.r}px)`,
            filter: 'hue-rotate(180deg) saturate(2)',
          }}
        />
      </div>

      {/* Horizontal interference lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 bg-white/20"
            style={{
              height: `${3 + Math.random() * 6}px`,
              top: `${(i * 8) + Math.sin(Date.now() / 1000 + i) * 3}%`,
            }}
            animate={{
              opacity: [0, 0.4, 0],
              x: [-30, 30, -30],
            }}
            transition={{
              duration: 0.3 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>

      {/* Color bands rolling down */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundPosition: ['0% 0%', '0% 100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `
            repeating-linear-gradient(
              180deg,
              transparent 0px,
              transparent 80px,
              rgba(233, 30, 140, 0.15) 80px,
              rgba(233, 30, 140, 0.15) 86px,
              transparent 86px,
              transparent 160px,
              rgba(0, 206, 209, 0.15) 160px,
              rgba(0, 206, 209, 0.15) 166px,
              transparent 166px,
              transparent 240px,
              rgba(255, 215, 0, 0.1) 240px,
              rgba(255, 215, 0, 0.1) 245px,
              transparent 245px
            )
          `,
          backgroundSize: '100% 320px',
        }}
      />

      {/* Static burst overlay */}
      <AnimatePresence>
        {showStatic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
            style={{
              background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </AnimatePresence>

      {/* Diagonal interference lines */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.03) 10px,
              rgba(255, 255, 255, 0.03) 11px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 15px,
              rgba(233, 30, 140, 0.02) 15px,
              rgba(233, 30, 140, 0.02) 16px
            )
          `,
        }}
      />

      {/* CRT screen curvature shadow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 150px 60px rgba(0, 0, 0, 0.8)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  )
}
