import { useEffect, useRef, useState } from 'react'

interface Props {
  isActive: boolean
  mode?: 'scanning' | 'analyzing'
  label?: string
  bpm?: number | null
  faceDetected?: boolean
  faceBbox?: { x: number; y: number; w: number; h: number } | null
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  progress: number
  speed: number
}

export function LiveScanVisualizer({
  isActive,
  mode = 'scanning',
  label = '3D Sub-Surface Bio-Scanner',
  bpm = 72,
  faceDetected = false,
  faceBbox = null,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [scanMessage, setScanMessage] = useState('Detecting Face...')

  // Scan stage text cycle
  useEffect(() => {
    if (!isActive) return
    if (!faceDetected) {
      setScanMessage('Searching for subject...')
      return
    }
    const messages = [
      'Subject Locked • Tracking 478 3D Landmarks...',
      'Extracting rPPG Green Hemoglobin Flow...',
      'Analyzing Craniofacial Morphology...',
      'Synchronizing Cardiac Hemodynamics...',
    ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length
      setScanMessage(messages[idx])
    }, 1500)
    return () => clearInterval(interval)
  }, [isActive, faceDetected])

  // Canvas 60 FPS Render Loop
  useEffect(() => {
    if (!isActive) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    // Particle pool for vascular blood flow
    const particles: Particle[] = []
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
      })
    }

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 640)
      const height = (canvas.height = canvas.parentElement?.clientHeight || 380)

      ctx.clearRect(0, 0, width, height)
      time += 0.035

      const cx = width / 2
      const cy = height / 2

      // Face Box Dimensions
      const faceW = 190
      const faceH = 240

      const left = cx - faceW / 2 - 20
      const right = cx + faceW / 2 + 20
      const top = cy - faceH / 2 - 20
      const bottom = cy + faceH / 2 + 15

      // Heartbeat pulse calculation
      const safeBpm = bpm || 72
      const pulsePhase = (Math.sin(time * (safeBpm / 60) * Math.PI * 2) + 1) / 2

      // 1. Blood Flow Color Cycling: Dark Blue -> Purple -> Red -> Bright Red -> Dark Blue
      // Cycle position 0..1
      const colorPos = (time * 0.4) % 1
      let rVal = 0, gVal = 0, bVal = 0
      if (colorPos < 0.25) {
        // Dark Blue (10, 20, 180) to Purple (120, 20, 200)
        const t = colorPos / 0.25
        rVal = 10 + t * 110
        gVal = 20
        bVal = 180 + t * 20
      } else if (colorPos < 0.5) {
        // Purple (120, 20, 200) to Red (220, 20, 60)
        const t = (colorPos - 0.25) / 0.25
        rVal = 120 + t * 100
        gVal = 20
        bVal = 200 - t * 140
      } else if (colorPos < 0.75) {
        // Red (220, 20, 60) to Bright Red (255, 60, 80)
        const t = (colorPos - 0.5) / 0.25
        rVal = 220 + t * 35
        gVal = 20 + t * 40
        bVal = 60 + t * 20
      } else {
        // Bright Red (255, 60, 80) back to Dark Blue (10, 20, 180)
        const t = (colorPos - 0.75) / 0.25
        rVal = 255 - t * 245
        gVal = 60 - t * 40
        bVal = 80 + t * 100
      }
      const currentColorStr = `rgb(${Math.floor(rVal)}, ${Math.floor(gVal)}, ${Math.floor(bVal)})`
      const currentGlowStr = `rgba(${Math.floor(rVal)}, ${Math.floor(gVal)}, ${Math.floor(bVal)}, 0.4)`

      // 2. Outer 3D Glass Brackets & Rotating Biometric Markers
      ctx.strokeStyle = mode === 'analyzing' ? '#00f2fe' : '#00c896'
      ctx.lineWidth = 2.5
      const bLen = 28

      // Corner Brackets
      ctx.beginPath()
      ctx.moveTo(left, top + bLen); ctx.lineTo(left, top); ctx.lineTo(left + bLen, top); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(right - bLen, top); ctx.lineTo(right, top); ctx.lineTo(right, top + bLen); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(left, bottom - bLen); ctx.lineTo(left, bottom); ctx.lineTo(left + bLen, bottom); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(right - bLen, bottom); ctx.lineTo(right, bottom); ctx.lineTo(right, bottom - bLen); ctx.stroke()

      // Rotating Circular Radar Sweep around Face Lock
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(time * 1.2)
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, 0, faceH * 0.65, 0, Math.PI * 1.5)
      ctx.stroke()
      ctx.restore()

      // 3. Horizontal Scanning Laser Line
      const scanY = top + ((Math.sin(time * 2.5) + 1) / 2) * (bottom - top)
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.95)'
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#00f2fe'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(left - 15, scanY)
      ctx.lineTo(right + 15, scanY)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Laser Gradient Sweep Fill
      const sweepGrad = ctx.createLinearGradient(0, scanY - 35, 0, scanY)
      sweepGrad.addColorStop(0, 'rgba(0, 242, 254, 0)')
      sweepGrad.addColorStop(1, 'rgba(0, 242, 254, 0.22)')
      ctx.fillStyle = sweepGrad
      ctx.fillRect(left - 15, scanY - 35, (right - left) + 30, 35)

      // 4. Facial Key Landmark Nodes (Forehead, Cheeks, Nose, Mouth)
      const forehead = { x: cx, y: cy - faceH * 0.32 }
      const rightCheek = { x: cx - faceW * 0.28, y: cy + faceH * 0.05 }
      const leftCheek = { x: cx + faceW * 0.28, y: cy + faceH * 0.05 }
      const nose = { x: cx, y: cy - faceH * 0.05 }
      const mouth = { x: cx, y: cy + faceH * 0.25 }
      const chin = { x: cx, y: cy + faceH * 0.42 }

      // Vascular Networks
      const vascularBranches = [
        [forehead, { x: forehead.x - 40, y: forehead.y - 30 }],
        [forehead, { x: forehead.x + 40, y: forehead.y - 30 }],
        [rightCheek, { x: rightCheek.x - 35, y: rightCheek.y + 25 }],
        [leftCheek, { x: leftCheek.x + 35, y: leftCheek.y + 25 }],
        [nose, rightCheek],
        [nose, leftCheek],
        [mouth, chin],
      ]

      // Draw Sub-surface Vascular Lines with Dynamic Heartbeat Color
      vascularBranches.forEach(branch => {
        ctx.strokeStyle = currentColorStr
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(branch[0].x, branch[0].y)
        ctx.lineTo(branch[1].x, branch[1].y)
        ctx.stroke()
      })

      // 5. Animated Flowing Blood Particles
      particles.forEach((p, idx) => {
        const branch = vascularBranches[idx % vascularBranches.length]
        p.progress += p.speed
        if (p.progress >= 1) p.progress = 0

        const px = branch[0].x + (branch[1].x - branch[0].x) * p.progress
        const py = branch[0].y + (branch[1].y - branch[0].y) * p.progress

        ctx.fillStyle = currentColorStr
        ctx.shadowColor = currentColorStr
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // 6. Highlighted rPPG ROIs (Forehead & Cheeks) with Expanding Glowing Pulse Rings
      const rois = [
        { name: 'Forehead rPPG', ...forehead },
        { name: 'Right Cheek rPPG', ...rightCheek },
        { name: 'Left Cheek rPPG', ...leftCheek },
      ]

      rois.forEach(roi => {
        // Expanding pulse ring on every heartbeat
        const pulseRadius = 12 + pulsePhase * 24
        ctx.strokeStyle = currentGlowStr
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(roi.x, roi.y, pulseRadius, 0, Math.PI * 2)
        ctx.stroke()

        // Core ROI Glow Node
        ctx.fillStyle = currentColorStr
        ctx.shadowColor = currentColorStr
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(roi.x, roi.y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Crosshairs
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.75)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(roi.x - 10, roi.y); ctx.lineTo(roi.x + 10, roi.y)
        ctx.moveTo(roi.x, roi.y - 10); ctx.lineTo(roi.x, roi.y + 10)
        ctx.stroke()
      })

      // 7. Top Biometric Scanning Stage Banner
      ctx.fillStyle = 'rgba(8, 13, 26, 0.88)'
      ctx.fillRect(left, top - 36, 290, 28)
      ctx.fillStyle = !faceDetected ? '#f59e0b' : '#00f2fe'
      ctx.font = '800 11px Inter, sans-serif'
      ctx.fillText(`● ${!faceDetected ? 'STATUS' : 'BIO-SCANNER'}: ${scanMessage}`, left + 12, top - 18)

      animationId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationId)
  }, [isActive, mode, label, bpm, faceDetected])

  if (!isActive) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
}
