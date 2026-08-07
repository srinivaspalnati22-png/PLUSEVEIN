import { useEffect, useRef } from 'react'

export function TechCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const scrollYRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mousePos.current.targetX = (e.clientX - cx) / cx
      mousePos.current.targetY = (e.clientY - cy) / cy
    }

    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Ambient floating particle field
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }))

    // High-Density 3D Face Keypoints
    const faceNodes = [
      // Forehead & Crown
      { x: 0, y: -160, z: 10 },
      { x: -50, y: -140, z: 25 },
      { x: 50, y: -140, z: 25 },
      { x: -100, y: -100, z: -20 },
      { x: 100, y: -100, z: -20 },

      // Eyebrows
      { x: -65, y: -75, z: 35 },
      { x: -25, y: -80, z: 45 },
      { x: 25, y: -80, z: 45 },
      { x: 65, y: -75, z: 35 },

      // Eyes
      { x: -45, y: -50, z: 40 },
      { x: 45, y: -50, z: 40 },

      // Nose Bridge & Tip
      { x: 0, y: -60, z: 50 },
      { x: 0, y: -20, z: 65 },
      { x: 0, y: 10, z: 80 },
      { x: -20, y: 15, z: 65 },
      { x: 20, y: 15, z: 65 },

      // Cheeks (rPPG ROI Regions)
      { x: -80, y: 0, z: 35 },
      { x: 80, y: 0, z: 35 },
      { x: -110, y: -20, z: -30 },
      { x: 110, y: -20, z: -30 },

      // Mouth Aperture
      { x: -40, y: 55, z: 50 },
      { x: 0, y: 48, z: 60 },
      { x: 40, y: 55, z: 50 },
      { x: 0, y: 68, z: 55 },

      // Jawline & Chin
      { x: -100, y: 40, z: -40 },
      { x: 100, y: 40, z: -40 },
      { x: -75, y: 95, z: 15 },
      { x: 75, y: 95, z: 15 },
      { x: -40, y: 130, z: 35 },
      { x: 40, y: 130, z: 35 },
      { x: 0, y: 150, z: 40 },
    ]

    const faceEdges = [
      // Forehead
      [0, 1], [0, 2], [1, 3], [2, 4], [1, 6], [2, 7],
      // Eyebrows & Eyes
      [3, 5], [5, 6], [7, 8], [8, 4], [5, 9], [6, 9], [7, 10], [8, 10],
      // Nose
      [6, 11], [7, 11], [11, 12], [12, 13], [13, 14], [13, 15],
      // Cheeks
      [9, 16], [10, 17], [3, 18], [4, 19], [16, 18], [17, 19],
      // Mouth
      [14, 20], [15, 22], [20, 21], [21, 22], [20, 23], [22, 23],
      // Jawline
      [18, 24], [19, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 30],
      [16, 26], [17, 27], [23, 30],
    ]

    let angleX = 0
    let angleY = 0
    let scanLaserY = -200

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth Mouse Following Rotation Interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08

      const scrollFactor = (scrollYRef.current * 0.0015)
      const targetAngleY = mousePos.current.x * 0.85 + scrollFactor
      const targetAngleX = -mousePos.current.y * 0.6

      angleY += (targetAngleY - angleY) * 0.1
      angleX += (targetAngleX - angleX) * 0.1

      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)

      // Dynamic positioning: On wide screens, position on right half; mobile centered
      const centerX = width > 900 ? width * 0.72 + mousePos.current.x * 40 : width * 0.5 + mousePos.current.x * 20
      const centerY = height * 0.45 + mousePos.current.y * 30
      const focalLength = 420

      // 1. Draw Ambient Particles
      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // 2. Project 3D Face Nodes
      const projected = faceNodes.map(pt => {
        let x1 = pt.x * cosY - pt.z * sinY
        let z1 = pt.z * cosY + pt.x * sinY

        let y2 = pt.y * cosX - z1 * sinX
        let z2 = z1 * cosX + pt.y * sinX

        const scale = focalLength / (focalLength + z2 + 180)
        return {
          x: centerX + x1 * scale * 1.6,
          y: centerY + y2 * scale * 1.6,
          scale,
          z: z2,
        }
      })

      // 3. Draw Dual Biometric Orbital Scanning Rings
      const ringRadius = 185
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, ringRadius, ringRadius * 0.4, angleY * 0.5, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(0, 200, 150, 0.35)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, ringRadius * 1.25, ringRadius * 0.5, -angleY * 0.4, 0, Math.PI * 2)
      ctx.stroke()

      // 4. Draw Laser Scan Sweep
      scanLaserY += 3
      if (scanLaserY > 200) scanLaserY = -200
      const currentLaserY = centerY + scanLaserY

      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)'
      ctx.lineWidth = 2
      ctx.shadowColor = '#00f2fe'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(centerX - ringRadius * 1.2, currentLaserY)
      ctx.lineTo(centerX + ringRadius * 1.2, currentLaserY)
      ctx.stroke()
      ctx.shadowBlur = 0

      // 5. Render 3D Wireframe Edges
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.55)'
      ctx.lineWidth = 1.5
      faceEdges.forEach(([i, j]) => {
        const p1 = projected[i]
        const p2 = projected[j]
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      })

      // 6. Render Glowing Landmark Nodes
      projected.forEach((p, idx) => {
        const isRoi = idx === 16 || idx === 17 || idx === 13 // Cheek rPPG & Nose Tip
        ctx.fillStyle = isRoi ? '#00c896' : '#00f2fe'
        ctx.shadowColor = isRoi ? '#00c896' : '#00f2fe'
        ctx.shadowBlur = isRoi ? 12 : 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, (isRoi ? 4.5 : 3.2) * p.scale, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.9,
      }}
    />
  )
}
