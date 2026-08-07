import { useState, useRef, useEffect } from 'react'
import { Volume2, Play, Pause, Disc, Filter, Mic } from 'lucide-react'

interface Props {
  isFake?: boolean
}

export function DemoAudioVocalPlayer({ isFake = true }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [filterMode, setFilterMode] = useState<'raw' | 'vocoder'>('raw')

  const audioCtxRef = useRef<AudioContext | null>(null)
  const osc1Ref = useRef<OscillatorNode | null>(null)
  const osc2Ref = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const startAudio = async () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      if (filterMode === 'vocoder') {
        // High-frequency synthetic vocoder anomaly tone (synthetic buzz)
        osc1.type = 'sawtooth'
        osc2.type = 'square'
        osc1.frequency.setValueAtTime(isFake ? 3400 : 880, ctx.currentTime)
        osc2.frequency.setValueAtTime(isFake ? 4200 : 1760, ctx.currentTime)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
      } else {
        // Human vocal pitch fundamental modulation (speech formant simulation)
        osc1.type = 'sine'
        osc2.type = 'triangle'
        osc1.frequency.setValueAtTime(220, ctx.currentTime)
        osc2.frequency.setValueAtTime(440, ctx.currentTime)
        gain.gain.setValueAtTime(0.18, ctx.currentTime)
      }

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start()
      osc2.start()

      osc1Ref.current = osc1
      osc2Ref.current = osc2
      gainRef.current = gain
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const stopAudio = () => {
    if (osc1Ref.current) {
      try { osc1Ref.current.stop(); osc1Ref.current.disconnect() } catch {}
      osc1Ref.current = null
    }
    if (osc2Ref.current) {
      try { osc2Ref.current.stop(); osc2Ref.current.disconnect() } catch {}
      osc2Ref.current = null
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close() } catch {}
      audioCtxRef.current = null
    }
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio()
    } else {
      startAudio()
    }
  }

  // Live Canvas Waveform Animation
  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const render = () => {
      const w = (canvas.width = canvas.parentElement?.clientWidth || 400)
      const h = (canvas.height = 50)
      ctx.clearRect(0, 0, w, h)

      if (isPlaying) {
        time += 0.08
        ctx.beginPath()
        ctx.strokeStyle = filterMode === 'vocoder' ? '#00f2fe' : (isFake ? '#ef4444' : '#00c896')
        ctx.lineWidth = 2.5
        ctx.shadowColor = ctx.strokeStyle
        ctx.shadowBlur = 8

        const points = 60
        for (let i = 0; i < points; i++) {
          const x = (i / points) * w
          const freqMultiplier = filterMode === 'vocoder' ? 0.4 : 0.15
          const y = h / 2 + Math.sin(i * freqMultiplier + time) * 18 * (isPlaying ? 1 : 0.1)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, h / 2)
        ctx.lineTo(w, h / 2)
        ctx.stroke()
      }

      animId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, filterMode, isFake])

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  return (
    <div className="card-elevated" style={{ padding: '1.5rem', borderColor: isFake ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 200, 150, 0.35)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: isFake ? '#ef4444' : '#00c896', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Disc size={16} className={isPlaying ? 'animate-spin' : ''} />
            Acoustic Vocal Track Demo Player
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem' }}>
            {isFake ? 'Synthetic Neural Vocoder Artifact Inspector' : 'Organic Human Vocal Tract Spectrum'}
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filter Toggle Button */}
          <button
            onClick={() => {
              const nextMode = filterMode === 'raw' ? 'vocoder' : 'raw'
              setFilterMode(nextMode)
              if (isPlaying) {
                stopAudio()
                setTimeout(() => startAudio(), 100)
              }
            }}
            className="btn"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              border: `1px solid ${filterMode === 'vocoder' ? '#00f2fe' : 'var(--bg-border)'}`,
              background: filterMode === 'vocoder' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: filterMode === 'vocoder' ? '#00f2fe' : 'var(--text-muted)',
            }}
          >
            <Filter size={14} />
            {filterMode === 'vocoder' ? 'Filter: Vocoder Anomaly (Active)' : 'Filter: Raw Vocal Track'}
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="btn btn-primary"
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem', fontWeight: 800, background: isFake ? '#ef4444' : '#00c896', color: '#050914' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Stop Audio Track' : 'Play Audio Track'}
          </button>
        </div>
      </div>

      {/* Live Audio Waveform Canvas */}
      <div style={{ width: '100%', height: '50px', background: 'rgba(5, 9, 20, 0.95)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--bg-border)', marginBottom: '0.875rem' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '50px' }} />
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Volume2 size={16} color="var(--accent)" />
        <span>
          {filterMode === 'vocoder'
            ? '⚡ Vocoder Anomaly Active: Playing high-frequency 3.4kHz–4.2kHz synthetic vocoder artifacts produced by ElevenLabs / Tacotron voice clone models.'
            : '🔊 Raw Vocal Track: Playing fundamental 220Hz speech vocal formants extracted from the video stream.'}
        </span>
      </div>
    </div>
  )
}
