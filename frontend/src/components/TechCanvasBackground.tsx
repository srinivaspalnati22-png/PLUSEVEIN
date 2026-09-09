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

    // Ambient floating biometric particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.4 + 0.15,
    }))

    // High-Density 3D Face Keypoints
    const faceNodes = [
      // Forehead & Crown (rPPG Region 1)
      { x: 0, y: -160, z: 10, isRoi: true },
      { x: -50, y: -140, z: 25, isRoi: true },
      { x: 50, y: -140, z: 25, isRoi: true },
      { x: -100, y: -100, z: -20, isRoi: false },
      { x: 100, y: -100, z: -20, isRoi: false },

      // Eyebrows
      { x: -65, y: -75, z: 35, isRoi: false },
      { x: -25, y: -80, z: 45, isRoi: false },
      { x: 25, y: -80, z: 45, isRoi: false },
      { x: 65, y: -75, z: 35, isRoi: false },

      // Eyes
      { x: -45, y: -50, z: 40, isRoi: false },
      { x: 45, y: -50, z: 40, isRoi: false },

      // Nose Bridge & Tip
      { x: 0, y: -60, z: 50, isRoi: false },
      { x: 0, y: -20, z: 65, isRoi: false },
      { x: 0, y: 10, z: 80, isRoi: false },
      { x: -20, y: 15, z: 65, isRoi: false },
      { x: 20, y: 15, z: 65, isRoi: false },

      // Cheeks (rPPG Vascular Blood Volume ROI)
      { x: -80, y: 0, z: 35, isRoi: true },
      { x: 80, y: 0, z: 35, isRoi: true },
      { x: -60, y: 20, z: 45, isRoi: true },
      { x: 60, y: 20, z: 45, isRoi: true },
      { x: -110, y: -20, z: -30, isRoi: false },
      { x: 110, y: -20, z: -30, isRoi: false },

      // Mouth Aperture (3D Lip-Sync Kinematics)
      { x: -40, y: 55, z: 50, isRoi: false, isLip: true },
      { x: 0, y: 48, z: 60, isRoi: false, isLip: true },
      { x: 40, y: 55, z: 50, isRoi: false, isLip: true },
      { x: 0, y: 68, z: 55, isRoi: false, isLip: true },

      // Jawline & Chin
      { x: -100, y: 40, z: -40, isRoi: false },
      { x: 100, y: 40, z: -40, isRoi: false },
      { x: -75, y: 95, z: 15, isRoi: false },
      { x: 75, y: 95, z: 15, isRoi: false },
      { x: -40, y: 130, z: 35, isRoi: false },
      { x: 40, y: 130, z: 35, isRoi: false },
      { x: 0, y: 150, z: 40, isRoi: false },
    ]

    // Wireframe Edges
    const edges = [
      [0, 1], [0, 2], [1, 3], [2, 4],
      [1, 5], [2, 8], [5, 6], [6, 7], [7, 8],
      [5, 9], [8, 10], [9, 11], [10, 11],
      [11, 12], [12, 13], [13, 14], [13, 15],
      [9, 16], [10, 17], [16, 18], [17, 19],
      [14, 22], [15, 24], [22, 23], [23, 24], [22, 25], [24, 25],
      [3, 20], [4, 21], [20, 26], [21, 27],
      [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [31, 32],
      [18, 30], [19, 31], [25, 32],
      [1, 6], [2, 7], [16, 22], [17, 24],
    ]

    let time = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      time += 0.02

      // Ease mouse target
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05

      // Floating dust particles
      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.4})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Biometric Arterial Pulse Beat (74 BPM)
      const pulseCycle = (Math.sin(time * 3.8) + 1) / 2
      const isPulseSpike = pulseCycle > 0.85

      // 3D Face Rotation Angles
      const rotY = mousePos.current.x * 0.4 + Math.sin(time * 0.5) * 0.08
      const rotX = -mousePos.current.y * 0.25 - scrollYRef.current * 0.0003 + Math.cos(time * 0.6) * 0.05

      const centerX = width > 1024 ? width * 0.72 : width * 0.5
      const centerY = height * 0.46
      const scale = Math.min(width, height) * 0.00165 * 240

      // Project 3D Nodes to 2D Screen
      const projected = faceNodes.map(node => {
        const x1 = node.x * Math.cos(rotY) + node.z * Math.sin(rotY)
        const z1 = -node.x * Math.sin(rotY) + node.z * Math.cos(rotY)

        const y2 = node.y * Math.cos(rotX) - z1 * Math.sin(rotX)
        const z2 = node.y * Math.sin(rotX) + z1 * Math.cos(rotX)

        const fov = 400
        const factor = fov / (fov + z2 + 100)
        return {
          x: centerX + x1 * scale * factor,
          y: centerY + y2 * scale * factor,
          z: z2,
          isRoi: node.isRoi,
          isLip: node.isLip,
        }
      })

      // Draw Wireframe Edges
      edges.forEach(([i, j]) => {
        const p1 = projected[i]
        const p2 = projected[j]
        if (!p1 || !p2) return

        const isVascularEdge = p1.isRoi && p2.isRoi
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)

        if (isVascularEdge) {
          ctx.strokeStyle = isPulseSpike
            ? `rgba(255, 42, 95, 0.75)`
            : `rgba(0, 240, 255, 0.3)`
          ctx.lineWidth = isPulseSpike ? 2 : 1
        } else {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)'
          ctx.lineWidth = 0.8
        }
        ctx.stroke()
      })

      // Draw Keypoint Nodes
      projected.forEach((p, idx) => {
        ctx.beginPath()
        const nodeRadius = p.isRoi ? 3.5 : p.isLip ? 3 : 2
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2)

        if (p.isRoi) {
          ctx.fillStyle = isPulseSpike ? '#ff2a5f' : '#00f0ff'
          ctx.shadowColor = isPulseSpike ? '#ff2a5f' : '#00f0ff'
          ctx.shadowBlur = 10
        } else if (p.isLip) {
          ctx.fillStyle = '#a855f7'
          ctx.shadowColor = '#a855f7'
          ctx.shadowBlur = 8
        } else {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.5)'
          ctx.shadowBlur = 0
        }
        ctx.fill()
        ctx.shadowBlur = 0

        // High-tech cheek marker label
        if (idx === 16) {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)'
          ctx.strokeRect(p.x - 14, p.y - 14, 28, 28)
          ctx.font = '9px "JetBrains Mono", monospace'
          ctx.fillStyle = 'rgba(0, 240, 255, 0.7)'
          ctx.fillText('rPPG ROI: L-CHEEK', p.x + 18, p.y + 4)
        }
      })

      // Subtle horizontal laser scan line
      const scanY = (Math.sin(time * 1.5) * 0.5 + 0.5) * height
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(width, scanY)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)'
      ctx.lineWidth = 1.5
      ctx.stroke()

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
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  )
}
