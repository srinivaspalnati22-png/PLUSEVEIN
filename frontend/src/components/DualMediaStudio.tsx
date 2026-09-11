import { useState } from 'react'
import { Columns, Play, AlertOctagon, CheckCircle2, HeartPulse, Mic } from 'lucide-react'
import { getAssetUrl } from '@/lib/assets'

export function DualMediaStudio() {
  const [activeTab, setActiveTab] = useState<'rppg' | 'lipsync'>('rppg')

  return (
    <div className="card-elevated" style={{ padding: '1.75rem', borderColor: 'rgba(0, 242, 254, 0.35)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#00f2fe', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Columns size={16} />
            Side-by-Side Dual Media Comparison Studio
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem' }}>
            Reference Media vs Suspected Deepfake Diffing
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('rppg')}
            className="btn"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              border: `1px solid ${activeTab === 'rppg' ? 'var(--accent)' : 'var(--bg-border)'}`,
              background: activeTab === 'rppg' ? 'rgba(0, 200, 150, 0.15)' : 'transparent',
              color: activeTab === 'rppg' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: 800,
            }}
          >
            <HeartPulse size={14} />
            rPPG Pulse Diff
          </button>

          <button
            onClick={() => setActiveTab('lipsync')}
            className="btn"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              border: `1px solid ${activeTab === 'lipsync' ? '#00f2fe' : 'var(--bg-border)'}`,
              background: activeTab === 'lipsync' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: activeTab === 'lipsync' ? '#00f2fe' : 'var(--text-muted)',
              fontWeight: 800,
            }}
          >
            <Mic size={14} />
            Lip-Sync Aperture Diff
          </button>
        </div>
      </div>

      {/* Dual Video Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Authentic Reference Clip */}
        <div style={{ background: 'rgba(5, 9, 20, 0.85)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(34, 197, 94, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} />
              MEDIA A: Authentic Reference (88% REAL)
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Baseline Signal</span>
          </div>

          <div style={{ height: '140px', background: '#000', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', border: '1px solid var(--bg-border)' }}>
            <img src={getAssetUrl('images/rppg_scan.png')} alt="Reference Media A" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {activeTab === 'rppg' ? '✓ Coherent CHROM arterial pulse detected (74 BPM, SNR: 12.4 dB).' : '✓ 3D mouth aperture matches audio RMS energy envelope perfectly.'}
          </div>
        </div>

        {/* Right: Suspected Deepfake Clip */}
        <div style={{ background: 'rgba(5, 9, 20, 0.85)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertOctagon size={16} />
              MEDIA B: Suspected Deepfake (18% FAKE)
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Signal</span>
          </div>

          <div style={{ height: '140px', background: '#000', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', border: '1px solid var(--bg-border)' }}>
            <img src={getAssetUrl('images/deepfake_comparison.png')} alt="Suspected Deepfake Media B" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700 }}>
            {activeTab === 'rppg' ? '⛔ Zero skin blood volume pulse detected (SNR: -4.2 dB).' : '⛔ 142ms desync aperture spike detected at timestamp 0:14s.'}
          </div>
        </div>
      </div>
    </div>
  )
}
