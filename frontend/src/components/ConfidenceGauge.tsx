import { useEffect, useState } from 'react'

interface Props {
  score: number
  verdict: string
}

export function ConfidenceGauge({ score, verdict }: Props) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    let start = displayScore
    const target = Math.round(score)
    if (start === target) return

    const duration = 1500
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.floor(start + (target - start) * progress)
      setDisplayScore(current)
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [score])

  // Gauge needle rotation angle (-90deg to +90deg)
  const needleAngle = -90 + (displayScore / 100) * 180

  const isFake = verdict.includes('FAKE') || score < 42
  const isReal = verdict.includes('REAL') || score >= 80
  const gaugeColor = isFake ? '#ef4444' : isReal ? '#22c55e' : '#f59e0b'

  return (
    <div
      className="card-elevated"
      style={{
        padding: '1.25rem',
        background: 'rgba(10, 16, 28, 0.85)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${gaugeColor}40`,
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        Ensemble Forensic Confidence Meter
      </div>

      <div style={{ position: 'relative', width: '220px', height: '120px', marginTop: '0.5rem' }}>
        <svg width="220" height="120" viewBox="0 0 220 120">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="var(--bg-border)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Color Gradient Track Arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Ticks */}
          <text x="24" y="118" fill="#ef4444" fontSize="10" fontWeight="800">FAKE</text>
          <text x="96" y="28" fill="#f59e0b" fontSize="10" fontWeight="800">UNCERTAIN</text>
          <text x="172" y="118" fill="#22c55e" fontSize="10" fontWeight="800">REAL</text>
        </svg>

        {/* Animated Needle */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '110px',
            width: '4px',
            height: '75px',
            background: gaugeColor,
            borderRadius: '2px',
            transformOrigin: 'bottom center',
            transform: `rotate(${needleAngle}deg)`,
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: `0 0 12px ${gaugeColor}`,
          }}
        />

        {/* Needle Hub */}
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            left: '102px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#ffffff',
            border: `3px solid ${gaugeColor}`,
            boxShadow: `0 0 10px ${gaugeColor}`,
          }}
        />
      </div>

      {/* Percentage Count & Verdict */}
      <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: gaugeColor, lineHeight: 1 }}>
          {displayScore}%
        </div>
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: gaugeColor,
            background: `${gaugeColor}1f`,
            padding: '0.25rem 0.875rem',
            borderRadius: 'var(--radius)',
            border: `1px solid ${gaugeColor}40`,
            marginTop: '0.35rem',
            textTransform: 'uppercase',
          }}
        >
          {verdict}
        </div>
      </div>
    </div>
  )
}
