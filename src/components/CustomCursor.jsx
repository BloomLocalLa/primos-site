import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const containerRef = useRef(null)
  const centerDotRef = useRef(null)
  const outerRingRef = useRef(null)
  const trailRefs = useRef([])
  const explosionContainerRef = useRef(null)

  const colors = ['#E91E8C', '#00CED1', '#FFD700', '#9B59B6']

  useEffect(() => {
    const trailPos = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    let mousePos = { x: 0, y: 0 }
    let rafId

    const updateTrail = () => {
      // Update trail positions with easing
      trailPos[0].x += (mousePos.x - trailPos[0].x) * 0.3
      trailPos[0].y += (mousePos.y - trailPos[0].y) * 0.3

      for (let i = 1; i < 4; i++) {
        trailPos[i].x += (trailPos[i - 1].x - trailPos[i].x) * 0.25
        trailPos[i].y += (trailPos[i - 1].y - trailPos[i].y) * 0.25
      }

      // Directly update DOM elements (no React re-render)
      trailRefs.current.forEach((el, i) => {
        if (el) {
          el.style.transform = `translate(${trailPos[i].x - 7}px, ${trailPos[i].y - 7}px)`
        }
      })

      if (centerDotRef.current) {
        centerDotRef.current.style.transform = `translate(${mousePos.x - 5}px, ${mousePos.y - 5}px)`
      }

      if (outerRingRef.current) {
        const size = outerRingRef.current.dataset.hovering === 'true' ? 25 : 20
        outerRingRef.current.style.transform = `translate(${mousePos.x - size}px, ${mousePos.y - size}px)`
      }

      rafId = requestAnimationFrame(updateTrail)
    }

    const onMouseMove = (e) => {
      mousePos = { x: e.clientX, y: e.clientY }

      const el = e.target
      const clickable = el.closest('a, button, [role="button"]') || el.tagName === 'A' || el.tagName === 'BUTTON'

      if (outerRingRef.current) {
        const isHovering = !!clickable
        outerRingRef.current.dataset.hovering = isHovering
        outerRingRef.current.style.width = isHovering ? '50px' : '40px'
        outerRingRef.current.style.height = isHovering ? '50px' : '40px'
        outerRingRef.current.style.borderColor = isHovering ? '#E91E8C' : 'rgba(255,255,255,0.6)'
        outerRingRef.current.style.boxShadow = isHovering ? '0 0 15px #E91E8C' : 'none'
      }
    }

    const onMouseDown = (e) => {
      if (!explosionContainerRef.current) return

      // Create explosion with CSS animations only
      const explosion = document.createElement('div')
      explosion.className = 'cursor-explosion'
      explosion.style.left = e.clientX + 'px'
      explosion.style.top = e.clientY + 'px'

      explosionContainerRef.current.appendChild(explosion)

      // Remove after animation
      setTimeout(() => {
        explosion.remove()
      }, 500)
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
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
      {/* Cursor container */}
      <div
        ref={containerRef}
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
        {colors.map((color, i) => (
          <div
            key={i}
            ref={el => trailRefs.current[i] = el}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.9 - i * 0.15,
              boxShadow: `0 0 10px ${color}, 0 0 20px ${color}50`,
              transform: 'translate(-100px, -100px)',
              willChange: 'transform',
            }}
          />
        ))}

        {/* Outer ring */}
        <div
          ref={outerRingRef}
          data-hovering="false"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.6)',
            transform: 'translate(-100px, -100px)',
            transition: 'width 0.15s, height 0.15s, border-color 0.15s, box-shadow 0.15s',
            willChange: 'transform',
          }}
        />

        {/* Center dot */}
        <div
          ref={centerDotRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#fff',
            boxShadow: '0 0 8px #fff, 0 0 15px rgba(255,255,255,0.5)',
            transform: 'translate(-100px, -100px)',
            willChange: 'transform',
          }}
        />

        {/* Explosion container */}
        <div ref={explosionContainerRef} />
      </div>

      {/* Cursor styles */}
      <style>{`
        .cursor-explosion {
          position: absolute;
          width: 40px;
          height: 40px;
          margin-left: -20px;
          margin-top: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, rgba(233,30,140,0.8) 40%, transparent 70%);
          animation: cursor-flash 0.4s ease-out forwards;
          pointer-events: none;
        }

        @keyframes cursor-flash {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(2); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </>
  )
}
