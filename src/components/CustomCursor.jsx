import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [explosions, setExplosions] = useState([])
  const [trail, setTrail] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ])

  const colors = ['#E91E8C', '#00CED1', '#FFD700', '#9B59B6']

  useEffect(() => {
    let trailPos = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    let mousePos = { x: 0, y: 0 }
    let rafId

    const updateTrail = () => {
      trailPos[0].x += (mousePos.x - trailPos[0].x) * 0.3
      trailPos[0].y += (mousePos.y - trailPos[0].y) * 0.3

      for (let i = 1; i < 4; i++) {
        trailPos[i].x += (trailPos[i - 1].x - trailPos[i].x) * 0.25
        trailPos[i].y += (trailPos[i - 1].y - trailPos[i].y) * 0.25
      }

      setTrail([...trailPos.map(p => ({ x: p.x, y: p.y }))])
      rafId = requestAnimationFrame(updateTrail)
    }

    const onMouseMove = (e) => {
      mousePos = { x: e.clientX, y: e.clientY }
      setPosition({ x: e.clientX, y: e.clientY })

      const el = e.target
      const clickable = el.closest('a, button') || el.tagName === 'A' || el.tagName === 'BUTTON'
      setIsHovering(!!clickable)
    }

    const onMouseDown = (e) => {
      // Create explosion particles
      const newExplosion = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        particles: Array.from({ length: 12 }, (_, i) => ({
          angle: (i * 30) * (Math.PI / 180),
          color: colors[i % 4],
          speed: 3 + Math.random() * 3,
          size: 6 + Math.random() * 6,
        })),
      }
      setExplosions(prev => [...prev, newExplosion])

      // Remove explosion after animation
      setTimeout(() => {
        setExplosions(prev => prev.filter(e => e.id !== newExplosion.id))
      }, 600)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    rafId = requestAnimationFrame(updateTrail)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Global style to hide default cursor */}
      <style>{`
        html, body, * {
          cursor: none !important;
        }
      `}</style>

      {/* Cursor container */}
      <div
        id="custom-cursor"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2147483647,
          overflow: 'visible',
        }}
      >
        {/* 4 Trailing orbs */}
        {trail.map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: 14,
              height: 14,
              marginLeft: -7,
              marginTop: -7,
              borderRadius: '50%',
              backgroundColor: colors[i],
              opacity: 0.9 - i * 0.15,
              boxShadow: `0 0 10px ${colors[i]}, 0 0 20px ${colors[i]}50`,
              transform: `scale(${1 - i * 0.1})`,
            }}
          />
        ))}

        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: isHovering ? 50 : 40,
            height: isHovering ? 50 : 40,
            marginLeft: isHovering ? -25 : -20,
            marginTop: isHovering ? -25 : -20,
            borderRadius: '50%',
            border: `2px solid ${isHovering ? '#E91E8C' : 'rgba(255,255,255,0.6)'}`,
            boxShadow: isHovering ? '0 0 15px #E91E8C' : 'none',
            transition: 'width 0.2s, height 0.2s, margin 0.2s, border-color 0.2s, box-shadow 0.2s',
          }}
        />

        {/* Center dot */}
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: '50%',
            backgroundColor: '#fff',
            boxShadow: '0 0 8px #fff, 0 0 15px rgba(255,255,255,0.5)',
          }}
        />

        {/* Click explosions */}
        {explosions.map((explosion) => (
          <div key={explosion.id}>
            {explosion.particles.map((particle, i) => {
              const endX = Math.cos(particle.angle) * particle.speed * 30
              const endY = Math.sin(particle.angle) * particle.speed * 30
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: explosion.x,
                    top: explosion.y,
                    width: particle.size,
                    height: particle.size,
                    marginLeft: -particle.size / 2,
                    marginTop: -particle.size / 2,
                    borderRadius: '50%',
                    backgroundColor: particle.color,
                    boxShadow: `0 0 10px ${particle.color}, 0 0 20px ${particle.color}`,
                    animation: `explode-${i}-${explosion.id} 0.5s ease-out forwards`,
                  }}
                >
                  <style>{`
                    @keyframes explode-${i}-${explosion.id} {
                      0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: translate(${endX}px, ${endY}px) scale(0);
                        opacity: 0;
                      }
                    }
                  `}</style>
                </div>
              )
            })}
            {/* Center flash */}
            <div
              style={{
                position: 'absolute',
                left: explosion.x,
                top: explosion.y,
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fff 0%, rgba(233,30,140,0.8) 40%, transparent 70%)',
                animation: 'flash 0.4s ease-out forwards',
              }}
            />
          </div>
        ))}
      </div>

      {/* Flash animation */}
      <style>{`
        @keyframes flash {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(2);
            opacity: 0.9;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}
