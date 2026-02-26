import { useEffect, useRef, useState } from 'react'

export default function TVStatic() {
  const canvasRef = useRef(null)
  const [channelGlitch, setChannelGlitch] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let frame = 0
    let verticalOffset = 0
    let horizontalDistortion = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawTV = () => {
      frame++
      const width = canvas.width
      const height = canvas.height

      // Clear with slight trail for ghosting effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, width, height)

      // Vertical hold drift (like adjusting rabbit ears)
      verticalOffset += Math.sin(frame * 0.01) * 0.5
      if (Math.random() < 0.002) verticalOffset += (Math.random() - 0.5) * 20

      // Horizontal distortion waves
      horizontalDistortion = Math.sin(frame * 0.05) * 3

      // Draw scan lines with color separation
      for (let y = 0; y < height; y += 2) {
        const yOffset = (y + verticalOffset) % height
        const xWobble = Math.sin((y + frame) * 0.02) * horizontalDistortion

        // RGB color separation (chromatic aberration)
        const intensity = 0.15 + Math.random() * 0.1

        // Red channel offset
        ctx.fillStyle = `rgba(255, 0, 100, ${intensity * 0.3})`
        ctx.fillRect(xWobble - 2, yOffset, width, 1)

        // Green channel
        ctx.fillStyle = `rgba(0, 255, 200, ${intensity * 0.2})`
        ctx.fillRect(xWobble, yOffset, width, 1)

        // Blue channel offset
        ctx.fillStyle = `rgba(100, 0, 255, ${intensity * 0.3})`
        ctx.fillRect(xWobble + 2, yOffset, width, 1)
      }

      // Thick horizontal interference bands (like bad reception)
      const bandCount = 3 + Math.floor(Math.random() * 2)
      for (let i = 0; i < bandCount; i++) {
        const bandY = ((frame * 2 + i * (height / bandCount)) % (height + 100)) - 50
        const bandHeight = 20 + Math.random() * 40
        const gradient = ctx.createLinearGradient(0, bandY, 0, bandY + bandHeight)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 + Math.random() * 0.15})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, bandY, width, bandHeight)
      }

      // Color bands (like tuning between channels)
      if (Math.random() < 0.01) {
        const colorBandY = Math.random() * height
        const colors = ['#E91E8C', '#00CED1', '#FFD700', '#9D4EDD']
        colors.forEach((color, i) => {
          ctx.fillStyle = color
          ctx.globalAlpha = 0.3
          ctx.fillRect(0, colorBandY + i * 4, width, 3)
        })
        ctx.globalAlpha = 1
      }

      // Static noise overlay
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 16) {
        if (Math.random() < 0.3) {
          const noise = Math.random() * 60
          data[i] = Math.min(255, data[i] + noise)
          data[i + 1] = Math.min(255, data[i + 1] + noise)
          data[i + 2] = Math.min(255, data[i + 2] + noise)
        }
      }
      ctx.putImageData(imageData, 0, 0)

      // Vertical sync bars (rolling effect)
      if (frame % 300 < 30) {
        const rollY = (frame % 300) * (height / 30)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(0, rollY - 20, width, 40)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(0, rollY - 2, width, 4)
      }

      // Occasional full static burst (channel change)
      if (channelGlitch) {
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const size = Math.random() * 4
          ctx.fillStyle = Math.random() > 0.5 ?
            `rgba(255, 255, 255, ${Math.random()})` :
            `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random()})`
          ctx.fillRect(x, y, size, size)
        }
      }

      // Edge vignette (CRT curvature simulation)
      const vignetteGradient = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.3,
        width / 2, height / 2, height * 0.8
      )
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
      ctx.fillStyle = vignetteGradient
      ctx.fillRect(0, 0, width, height)

      animationId = requestAnimationFrame(drawTV)
    }

    resize()
    window.addEventListener('resize', resize)
    drawTV()

    // Random channel glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        setChannelGlitch(true)
        setTimeout(() => setChannelGlitch(false), 100 + Math.random() * 200)
      }
    }, 3000)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
      clearInterval(glitchInterval)
    }
  }, [channelGlitch])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5] mix-blend-screen"
    />
  )
}
