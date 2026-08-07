import { useEffect, useRef, useState } from 'react'
import { Mic, Activity, AlertTriangle, ShieldCheck } from 'lucide-react'

interface Props {
  syntheticProb?: number
  isFake?: boolean
  spectralFlux?: number
}

export function AudioSpectrogramVisualizer({
  syntheticProb = 0.88,
  isFake = true,
  spectralFlux = 42.6,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [viewMode, setViewMode] = useState<'spectrogram' | 'pitch'>('spectrogram')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0

    const render = () => {
      const width = (canvas.width = canvas.parentElement?.clientWidth || 500)
      const height = (canvas.height = 160)

      ctx.clearRect(0, 0, width, height)
      time += 0.04

      if (viewMode === 'spectrogram') {
        // Draw Audio Frequency Density Spectrogram Columns (20Hz - 20kHz)
        const numCols = 60
        const colWidth = width / numCols

        for (let i = 0; i < numCols; i++) {
          const x = i * colWidth
          const freqIntensity = isFake
            ? Math.abs(Math.sin(i * 0.2 + time) * Math.cos(i * 0.1)) * 0.95 + (i === 24 || i === 42 ? 0.9 : 0.1)
            : Math.abs(Math.sin(i * 0.15 + time)) * 0.6 + 0.2

          const numRows = 20
          const rowHeight = height / numRows

          for (let r = 0; r < numRows; r++) {
            const y = height - (r + 1) * rowHeight
            const intensity = freqIntensity * (1 - r / numRows)

            if (intensity > 0.15) {
              const rCol = isFake ? Math.floor(239 * intensity) : Math.floor(0 * intensity)
              const gCol = isFake ? Math.floor(68 * intensity) : Math.floor(242 * intensity)
              const bCol = isFake ? Math.floor(68 * intensity) : Math.floor(254 * intensity)

              ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`
              ctx.fillRect(x + 1, y + 1, colWidth - 2, rowHeight - 2)
            }
          }
        }
      } else {
        // Draw Audio Pitch Contour & Energy Envelope Line
        ctx.beginPath()
        ctx.strokeStyle = isFake ? '#ef4444' : '#00f2fe'
        ctx.lineWidth = 2.5
        ctx.shadowColor = isFake ? '#ef4444' : '#00f2fe'
        ctx.shadowBlur = 8

        const numPoints = 80
        for (let i = 0; i < numPoints; i++) {
          const x = (i / numPoints) * width
          const noise = isFake ? (Math.random() - 0.5) * 18 : Math.sin(i * 0.1) * 3
          const y = height / 2 + Math.sin(i * 0.2 + time) * 35 + noise

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isFake, viewMode])

  return (
    <div className="card-elevated" style={{ padding: '1.5rem', borderColor: isFake ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 242, 254, 0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isFake ? '#ef4444' : '#00f2fe', fontSize: '0.85rem', fontWeight: 800 }}>
            <Mic size={18} />
            ACOUSTIC AUDIO SPECTROGRAM & VOCODER FLUX
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            High-Frequency Synthetic Vocoder Artifact Analysis (20Hz–20kHz)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('spectrogram')}
            className="btn"
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.75rem',
              border: `1px solid ${viewMode === 'spectrogram' ? 'var(--cyan)' : 'var(--bg-border)'}`,
              background: viewMode === 'spectrogram' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: viewMode === 'spectrogram' ? 'var(--cyan)' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            Spectrogram Heatmap
          </button>

          <button
            onClick={() => setViewMode('pitch')}
            className="btn"
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.75rem',
              border: `1px solid ${viewMode === 'pitch' ? 'var(--cyan)' : 'var(--bg-border)'}`,
              background: viewMode === 'pitch' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: viewMode === 'pitch' ? 'var(--cyan)' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            Pitch Contour
          </button>
        </div>
      </div>

      {/* Spectrogram Canvas */}
      <div style={{ width: '100%', height: '160px', background: 'rgba(5, 9, 20, 0.95)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--bg-border)', marginBottom: '1rem' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '160px' }} />
      </div>

      {/* Summary Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
        <div style={{ background: 'rgba(5, 10, 20, 0.8)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Synthetic Voice Prob</span>
          <strong style={{ color: isFake ? '#ef4444' : '#22c55e', fontSize: '1rem', fontWeight: 900 }}>
            {(syntheticProb * 100).toFixed(1)}% {isFake ? 'SYNTHETIC' : 'NATURAL'}
          </strong>
        </div>

        <div style={{ background: 'rgba(5, 10, 20, 0.8)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Spectral Flux Density</span>
          <strong style={{ color: '#00f2fe', fontSize: '1rem', fontWeight: 900 }}>
            {spectralFlux.toFixed(1)} Hz
          </strong>
        </div>

        <div style={{ background: 'rgba(5, 10, 20, 0.8)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Vocoder Fingerprint</span>
          <strong style={{ color: isFake ? '#ef4444' : '#22c55e', fontSize: '0.85rem', fontWeight: 800 }}>
            {isFake ? 'Neural Neural-TTS / ElevenLabs' : 'Organic Human Vocal Tract'}
          </strong>
        </div>
      </div>
    </div>
  )
}
