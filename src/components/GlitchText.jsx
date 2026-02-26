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
            scale: 1.2,
            rotate: Math.random() * 20 - 10,
            color: '#FF1493',
          }}
          style={{ display: 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}
