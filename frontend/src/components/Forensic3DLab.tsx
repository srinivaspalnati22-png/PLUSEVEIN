import { useEffect, useRef, useState } from 'react'
import { Cpu, Activity, ShieldCheck, Lock } from 'lucide-react'
import type { AnalysisResult } from '@/lib/api'

interface Props {
  onComplete: (result: AnalysisResult) => void
  demoResult?: AnalysisResult | null
  actualResult?: AnalysisResult | null
}

const STAGES = [
  { id: 1, name: 'FACE TRACKING', label: 'FACE LOCKED — 3D Landmark Grid Active' },
  { id: 2, name: 'rPPG OPTICAL SIGNAL', label: 'Facial Skin Color Variation for Remote Pulse Estimation' },
  { id: 3, name: 'PULSE ESTIMATION', label: 'Estimated Pulse Signal (BPM & Coherence)' },
  { id: 4, name: 'FACIAL MOTION', label: 'Action Unit (AU) Muscle Coordination' },
  { id: 5, name: 'LIP MOVEMENT DSP', label: '3D Mouth Aperture vs Audio Spectrogram' },
  { id: 6, name: 'TEMPORAL ANALYSIS', label: 'Frame-to-Frame SSIM Sequence Continuity' },
  { id: 7, name: 'MULTIMODAL AI FUSION', label: 'Multimodal Score Convergence Matrix' },
]

export function Forensic3DLab({ onComplete, demoResult, actualResult }: Props) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  const actualResultRef = useRef(actualResult)
  const demoResultRef = useRef(demoResult)

  useEffect(() => {
    actualResultRef.current = actualResult
  }, [actualResult])

  useEffect(() => {
    demoResultRef.current = demoResult
  }, [demoResult])

  // Listen to mouse and touch movement for 3D face orbiting
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mousePos.current.targetX = (e.clientX - cx) / cx
      mousePos.current.targetY = (e.clientY - cy) / cy
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        mousePos.current.targetX = (e.touches[0].clientX - cx) / cx
        mousePos.current.targetY = (e.touches[0].clientY - cy) / cy
      }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  // Progress & Stage sequence timer
  useEffect(() => {
    let p = 0
    let completed = false

    const interval = setInterval(() => {
      if (completed) return

      const targetResult = actualResultRef.current || demoResultRef.current

      // Advance progress smoothly. Hold at 95% until real API result returns
      if (p < 95) {
        p += 2.5
      } else if (p >= 95 && p < 99 && targetResult) {
        p += 2.0
      } else if (p >= 99 && targetResult && !completed) {
        p = 100
        completed = true
        clearInterval(interval)
        onComplete(targetResult)
        return
      }

      const displayP = Math.floor(Math.min(99, p))
      setProgress(displayP)
      const stageIdx = Math.min(STAGES.length - 1, Math.floor((displayP / 100) * STAGES.length))
      setCurrentStageIdx(stageIdx)
    }, 60)

    return () => clearInterval(interval)
  }, [onComplete])

  // Canvas 3D Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 700)
      const height = (canvas.height = canvas.parentElement?.clientHeight || 450)

      ctx.clearRect(0, 0, width, height)
      time += 0.03

      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08

      const cx = width / 2 + mousePos.current.x * 30
      const cy = height / 2 + mousePos.current.y * 20

      const rotY = mousePos.current.x * 0.45
      const rotX = mousePos.current.y * 0.35

      const ringRadius = 140
      const startAngle = -Math.PI / 2
      const endAngle = startAngle + (progress / 100) * Math.PI * 2

      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = '#00f2fe'
      ctx.lineWidth = 6
      ctx.shadowColor = '#00f2fe'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(cx, cy, ringRadius, startAngle, endAngle)
      ctx.stroke()
      ctx.shadowBlur = 0

      // 3D Orbital Nodes
      const nNodes = 18
      for (let i = 0; i < nNodes; i++) {
        const angle = (i / nNodes) * Math.PI * 2 + time * 0.8
        const nx = cx + Math.cos(angle) * (ringRadius + 22)
        const ny = cy + Math.sin(angle) * (ringRadius + 22)

        ctx.fillStyle = i % 3 === 0 ? '#00f2fe' : 'rgba(0, 242, 254, 0.4)'
        ctx.beginPath()
        ctx.arc(nx, ny, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // 3D Face Mesh Keypoints Projection
      const keypoints = [
        { x: 0, y: -70, z: 20 },
        { x: -35, y: -30, z: 15 },
        { x: 35, y: -30, z: 15 },
        { x: 0, y: 0, z: 40 },
        { x: -45, y: 30, z: 10 },
        { x: 45, y: 30, z: 10 },
        { x: 0, y: 55, z: 25 },
        { x: -25, y: 75, z: 0 },
        { x: 25, y: 75, z: 0 },
      ]

      const projected = keypoints.map(pt => {
        const radY = rotY
        const radX = rotX

        let x1 = pt.x * Math.cos(radY) + pt.z * Math.sin(radY)
        let z1 = -pt.x * Math.sin(radY) + pt.z * Math.cos(radY)

        let y2 = pt.y * Math.cos(radX) - z1 * Math.sin(radX)
        let z2 = pt.y * Math.sin(radX) + z1 * Math.cos(radX)

        const scale = 300 / (300 + z2)
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
        }
      })

      // Wireframe Edges
      const connections = [
        [0, 1], [0, 2], [1, 3], [2, 3],
        [1, 4], [2, 5], [3, 6], [4, 6],
        [5, 6], [6, 7], [6, 8], [7, 8],
      ]

      ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)'
      ctx.lineWidth = 1.5
      connections.forEach(([i, j]) => {
        ctx.beginPath()
        ctx.moveTo(projected[i].x, projected[i].y)
        ctx.lineTo(projected[j].x, projected[j].y)
        ctx.stroke()
      })

      // Highlight ROIs (Forehead & Cheeks)
      projected.forEach((p, idx) => {
        const isRoi = idx === 0 || idx === 4 || idx === 5
        ctx.fillStyle = isRoi ? '#00c896' : '#00f2fe'
        ctx.shadowColor = isRoi ? '#00c896' : '#00f2fe'
        ctx.shadowBlur = isRoi ? 10 : 4
        ctx.beginPath()
        ctx.arc(p.x, p.y, isRoi ? 5 : 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [progress])

  const activeStage = STAGES[currentStageIdx]

  return (
    <div
      className="card-elevated"
      style={{
        position: 'relative',
        padding: '2rem',
        background: 'rgba(8, 14, 26, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* 3D Lab Header Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00f2fe', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>
            <Cpu size={16} />
            3D AI FORENSIC LABORATORY
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="#00c896" />
            FACE LOCKED — Biometric Media Scan
          </h2>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00f2fe', lineHeight: 1 }}>
            {progress}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {progress === 95 && !actualResultRef.current ? 'AWAITING MODEL CONVERGENCE...' : 'CONVERGENCE PROGRESS'}
          </span>
        </div>
      </div>

      {/* 3D Interactive Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Stage Connected Sequence Navigator */}
      <div style={{ zIndex: 5, marginTop: 'auto', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="#00f2fe" />
            STAGE {activeStage.id}/7: {activeStage.name}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
            {activeStage.label}
          </span>
        </div>

        {/* Connected Stage Nodes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          {STAGES.map((s, idx) => {
            const isDone = currentStageIdx > idx
            const isCurrent = currentStageIdx === idx
            const nodeColor = isDone ? '#22c55e' : isCurrent ? '#00f2fe' : 'rgba(255, 255, 255, 0.2)'

            return (
              <div key={s.id} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  onMouseEnter={() => setHoveredStage(s.id)}
                  onMouseLeave={() => setHoveredStage(null)}
                  style={{
                    position: 'relative',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: nodeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isDone || isCurrent ? '#080e1a' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: isCurrent ? '0 0 12px #00f2fe' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  {isDone ? '✓' : s.id}

                  {/* Stage Hover Highlight Card */}
                  {hoveredStage === s.id && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '36px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(10, 16, 28, 0.95)',
                        border: '1px solid #00f2fe',
                        borderRadius: 'var(--radius)',
                        padding: '0.5rem 0.75rem',
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        zIndex: 20,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#00f2fe' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  )}
                </div>

                {idx < STAGES.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '3px',
                      background: isDone ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '2px',
                      transition: 'background 0.4s',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
