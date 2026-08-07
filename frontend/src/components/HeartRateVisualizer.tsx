import { useEffect, useRef, useState } from 'react'
import { Heart, Activity } from 'lucide-react'

interface Props {
  bpm?: number | null
  snrDb?: number
  coherence?: number
  signalQuality?: string
  color?: string
}

export function HeartRateVisualizer({
  bpm = 72,
  snrDb = 12.4,
  coherence = 0.86,
  signalQuality = 'good',
  color = '#00f2fe',
}: Props) {
  const pulseCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [displayBpm, setDisplayBpm] = useState(0)
  const activeBpm = bpm && bpm > 40 ? bpm : 72

  // Animated BPM number count up
  useEffect(() => {
    let start = displayBpm
    const target = Math.round(activeBpm)
    if (start === target) return

    const duration = 1200
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.floor(start + (target - start) * progress)
      setDisplayBpm(current)
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [activeBpm])

  // rPPG Waveform Render Loop (60 FPS Canvas)
  useEffect(() => {
    const canvas = pulseCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let offset = 0

    const render = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || 300)
      const h = (canvas.height = 64)

      ctx.clearRect(0, 0, w, h)
      offset += (activeBpm / 60) * 1.5

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.shadowColor = color
      ctx.shadowBlur = 8

      const centerY = h / 2
      for (let x = 0; x < w; x++) {
        const cycle = ((x + offset) % 120) / 120
        let y = centerY

        if (cycle > 0.35 && cycle < 0.45) {
          y -= Math.sin((cycle - 0.35) * 10 * Math.PI) * 18
        } else if (cycle >= 0.45 && cycle < 0.5) {
          y += Math.sin((cycle - 0.45) * 20 * Math.PI) * 6
        } else if (cycle >= 0.5 && cycle < 0.55) {
          y -= Math.sin((cycle - 0.5) * 20 * Math.PI) * 26
        } else if (cycle >= 0.55 && cycle < 0.6) {
          y += Math.sin((cycle - 0.55) * 20 * Math.PI) * 10
        } else if (cycle >= 0.6 && cycle < 0.75) {
          y -= Math.sin((cycle - 0.6) * 6.66 * Math.PI) * 8
        }

        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }

      ctx.stroke()
      ctx.shadowBlur = 0

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [activeBpm, color])

  return (
    <div className="card-elevated" style={{ padding: '1.25rem', borderColor: `${color}40` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={18} color={color} className="animate-pulse" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff' }}>
            rPPG Optical Pulse Waveform
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
          <span>Estimated Pulse: <strong style={{ color }}>{bpm ? `${displayBpm} BPM` : 'Absence Flagged'}</strong></span>
          <span>Coherence: <strong style={{ color: '#00f2fe' }}>{(coherence * 100).toFixed(0)}%</strong></span>
          <span>SNR: <strong style={{ color: '#00c896' }}>{snrDb.toFixed(1)} dB</strong></span>
        </div>
      </div>

      <div style={{ width: '100%', height: '64px', background: 'rgba(5, 9, 20, 0.9)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--bg-border)' }}>
        <canvas ref={pulseCanvasRef} style={{ width: '100%', height: '64px' }} />
      </div>
    </div>
  )
}
