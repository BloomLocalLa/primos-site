import { motion } from 'framer-motion'

export default function GlitchText({
  text,
  className = '',
  as: Component = 'span',
  glitchOnHover = true,
  rainbow = false,
}) {
  const letters = text.split('')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotate: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
  }

  const rainbowColors = [
    'text-primo-pink',
    'text-primo-cyan',
    'text-primo-yellow',
    'text-primo-green',
    'text-primo-purple',
    'text-primo-orange',
  ]

  // Different hover colors for each letter
  const hoverColors = [
    '#E91E8C', // primo-pink
    '#00CED1', // primo-cyan
    '#FFD700', // primo-yellow
    '#9B59B6', // primo-purple
    '#00FF88', // primo-green
    '#FF6B35', // orange
    '#FF1493', // hot pink
    '#00FFFF', // cyan bright
  ]

  return (
    <motion.div
      className={`inline-block ${glitchOnHover ? 'glitch-text' : ''} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className={`inline-block ${
            rainbow ? rainbowColors[index % rainbowColors.length] : ''
          } ${letter === ' ' ? 'w-4' : ''}`}
          whileHover={{
            scale: 1.3,
            rotate: Math.random() * 20 - 10,
            color: hoverColors[index % hoverColors.length],
            textShadow: `0 0 20px ${hoverColors[index % hoverColors.length]}`,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          style={{ display: 'inline-block', cursor: 'default' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}
