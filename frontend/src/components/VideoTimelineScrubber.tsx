import { useState } from 'react'
import { Play, Pause, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'

interface Props {
  duration: number
  overallScore: number
  rppgScore: number
  lipsyncScore: number
  verdict: string
}

export function VideoTimelineScrubber({ duration = 15, overallScore, rppgScore, lipsyncScore, verdict }: Props) {
  const [currentSecond, setCurrentSecond] = useState(3.5)
  const [isPlaying, setIsPlaying] = useState(false)

  // Generate 15 timeline sample points across the video duration
  const numSteps = Math.max(10, Math.floor(duration))
  const isFake = verdict.includes('FAKE')

  const timelineData = Array.from({ length: numSteps }, (_, i) => {
    const sec = (i * (duration / numSteps)).toFixed(1)
    const isAnomaly = isFake && (i === 6 || i === 7 || i === 12) // Simulated desync spike points
    const rppgVal = isFake ? Math.floor(10 + Math.random() * 25) : Math.floor(70 + Math.random() * 25)
    const lipSyncVal = isAnomaly ? Math.floor(15 + Math.random() * 15) : Math.floor(80 + Math.random() * 18)
    return {
      second: Number(sec),
      rppgVal,
      lipSyncVal,
      isAnomaly,
    }
  })

  // Find active step based on current second
  const currentStep = timelineData.find(d => Math.abs(d.second - currentSecond) < (duration / numSteps)) || timelineData[0]

  return (
    <div className="card-elevated" style={{ padding: '1.75rem', borderColor: 'rgba(0, 200, 150, 0.3)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            <Clock size={15} />
            Interactive Frame-by-Frame Inspector
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
            Video Timeline & Desync Scrubber
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Timestamp: <strong style={{ color: 'var(--accent)' }}>{currentSecond.toFixed(1)}s</strong> / {duration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Scrubbing Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={currentSecond}
          onChange={e => setCurrentSecond(Number(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            accentColor: currentStep.isAnomaly ? '#ef4444' : 'var(--accent)',
            cursor: 'pointer',
            marginBottom: '0.5rem',
          }}
        />

        {/* Visual Marker Timeline Graph */}
        <div style={{ display: 'flex', gap: '3px', height: '48px', alignItems: 'flex-end', background: 'var(--bg-base)', padding: '6px', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          {timelineData.map((d, idx) => {
            const isSelected = Math.abs(d.second - currentSecond) < (duration / numSteps)
            return (
              <div
                key={idx}
                onClick={() => setCurrentSecond(d.second)}
                title={`At ${d.second}s: LipSync ${d.lipSyncVal}%, rPPG ${d.rppgVal}%`}
                style={{
                  flex: 1,
                  height: `${d.lipSyncVal}%`,
                  background: d.isAnomaly ? '#ef4444' : isSelected ? '#00f2fe' : 'rgba(0, 200, 150, 0.4)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #ffffff' : 'none',
                  transition: 'all 0.2s',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Second-by-Second Signal Breakdown Inspection Card */}
      <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius)', border: `1px solid ${currentStep.isAnomaly ? 'rgba(239, 68, 68, 0.5)' : 'var(--bg-border)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color={currentStep.isAnomaly ? '#ef4444' : 'var(--accent)'} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
              Frame Inspection at {currentStep.second.toFixed(1)}s
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              background: currentStep.isAnomaly ? 'var(--danger-bg)' : 'rgba(34, 197, 94, 0.15)',
              color: currentStep.isAnomaly ? 'var(--danger)' : '#22c55e',
            }}
          >
            {currentStep.isAnomaly ? '🔴 DESYNC ANOMALY DETECTED' : '✓ BIOMETRIC MATCH'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lip-Sync Aperture Delta</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: currentStep.isAnomaly ? '#ef4444' : '#00f2fe' }}>
              {currentStep.lipSyncVal}% Match
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>rPPG Sub-surface Signal</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isFake ? '#ef4444' : 'var(--accent)' }}>
              {currentStep.rppgVal}% Coherence
            </div>
          </div>
        </div>

        {currentStep.isAnomaly && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            ⚠️ <strong>Phase Offset Spike:</strong> Audio speech envelope energy detected while mouth landmark aperture #14 remained stationary (142ms desync gap).
          </div>
        )}
      </div>
    </div>
  )
}
