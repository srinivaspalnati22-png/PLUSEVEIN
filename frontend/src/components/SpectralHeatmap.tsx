import { useState } from 'react'
import { HeartPulse, Activity, Cpu, Filter } from 'lucide-react'

interface Props {
  bpm?: number | null
  coherence?: number
  isFake?: boolean
}

export function SpectralHeatmap({ bpm = 74, coherence = 0.85, isFake = false }: Props) {
  const [selectedRoi, setSelectedRoi] = useState<'forehead' | 'left_cheek' | 'right_cheek'>('forehead')

  // Simulate CHROM signal arrays (3R - 2G) for 3 facial skin ROIs
  const getSignalData = () => {
    if (isFake) {
      return Array.from({ length: 40 }, () => Math.sin(Math.random() * 10) * 15 + (Math.random() - 0.5) * 20)
    }
    return Array.from({ length: 40 }, (_, i) => Math.sin(i * 0.4) * 28 + (Math.random() - 0.5) * 4)
  }

  const signalPoints = getSignalData()

  return (
    <div className="card-elevated" style={{ padding: '1.75rem', borderColor: 'rgba(0, 200, 150, 0.3)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            <HeartPulse size={15} />
            CHROM Signal Processing Engine
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
            Sub-Surface Skin ROI Spectral Heatmap
          </h3>
        </div>

        {/* ROI Region Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-base)', padding: '3px', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          {[
            { id: 'forehead' as const, label: 'Forehead ROI' },
            { id: 'left_cheek' as const, label: 'Left Cheek ROI' },
            { id: 'right_cheek' as const, label: 'Right Cheek ROI' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRoi(r.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'calc(var(--radius) - 2px)',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: selectedRoi === r.id ? 'var(--bg-surface)' : 'transparent',
                color: selectedRoi === r.id ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* CHROM Signal Waveform Visualizer */}
      <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>CHROM Projection Channel (3R - 2G)</span>
          <span style={{ color: isFake ? '#ef4444' : 'var(--accent)', fontWeight: 700 }}>
            {isFake ? 'Flat / Incoherent Spectrum' : `Dominant Pulse Peak: ${bpm} BPM`}
          </span>
        </div>

        <div style={{ height: '90px', display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
          <svg width="100%" height="70" viewBox="0 0 400 70">
            <path
              d={`M ${signalPoints.map((val, idx) => `${idx * 10},${35 - val}`).join(' L ')}`}
              fill="none"
              stroke={isFake ? '#ef4444' : '#00f2fe'}
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FFT Bandpass Filter</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.2rem' }}>
            0.67 Hz – 2.5 Hz (40–150 BPM)
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Green Spectrum Light Absorption</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.2rem' }}>
            540 nm – 580 nm Wavelength
          </div>
        </div>
      </div>
    </div>
  )
}
