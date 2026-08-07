import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, HeartPulse, Mic, Layers, CheckCircle2 } from 'lucide-react'
import { LiveBenchmarkTable } from '@/components/LiveBenchmarkTable'

export default function Methodology() {
  const [activeTab, setActiveTab] = useState<'rppg' | 'lipsync' | 'fusion'>('rppg')

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem', position: 'relative', zIndex: 1 }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.625rem', background: 'rgba(0, 200, 150, 0.1)', padding: '0.35rem 0.875rem', borderRadius: '20px', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
          <Cpu size={16} />
          Forensic Signal Processing Architecture
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '0.875rem' }}>
          Biometric Detection Methodology
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
          Learn how REALITYCHECK AI extracts microscopic sub-surface skin blood flow and cross-correlates lip aperture motion with audio spectral energy to identify 2026 deepfakes.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'rppg' as const, label: '1. rPPG Blood Flow Signal', icon: <HeartPulse size={18} /> },
          { id: 'lipsync' as const, label: '2. Lip-Sync Coherence DSP', icon: <Mic size={18} /> },
          { id: 'fusion' as const, label: '3. Multimodal Score Fusion', icon: <Layers size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${activeTab === tab.id ? 'var(--accent)' : 'var(--bg-border)'}`,
              background: activeTab === tab.id ? 'rgba(0, 200, 150, 0.15)' : 'rgba(15, 22, 35, 0.8)',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: activeTab === tab.id ? '0 0 20px rgba(0, 200, 150, 0.25)' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Cards */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: '3rem' }}>
        {activeTab === 'rppg' && (
          <div className="card-elevated" style={{ padding: '2.5rem', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 200, 150, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
                <HeartPulse size={26} color="var(--accent)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff' }}>Remote Photoplethysmography (rPPG)</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>Sub-Surface Vascular Micro-Pulsation Isolation</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1.025rem' }}>
              rPPG measures micro-vascular blood circulation without physical contact. Oxygenated hemoglobin absorbs green light spectrum (540–580 nm) significantly more than red light. As the heart beats, micro-capillaries in facial cheek and forehead skin expand and contract, causing a periodic RGB color variation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
                <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem' }}>CHROM Projection Formula</h4>
                <code style={{ display: 'block', background: 'var(--bg-base)', padding: '0.875rem', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: '#00f2fe', fontFamily: 'monospace' }}>
                  X_s = 3R - 2G <br />
                  Y_s = 1.5R + G - 1.5B <br />
                  S = X_s - α · Y_s
                </code>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  Eliminates specular reflection and illumination changes while isolating pulsatile blood volume signals.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
                <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem' }}>Bandpass & FFT Spectrum</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Applies Butterworth bandpass filter (0.67 Hz to 2.5 Hz = 40–150 BPM). Fast Fourier Transform (FFT) computes dominant cardiac pulse frequency peak and spectral coherence ratio.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.5rem' }}>Why Deepfakes Fail rPPG Tests</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                2026-era generative diffusion and neural radiance field models render superficial surface textures (skin pixels, facial expressions), but fail to simulate sub-surface arterial blood flow absorption rhythms. Deepfakes produce flat power spectral density graphs with zero coherence.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'lipsync' && (
          <div className="card-elevated" style={{ padding: '2.5rem', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                <Mic size={26} color="#00f2fe" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff' }}>3D Lip Kinematics & Audio RMS Envelope</h2>
                <span style={{ fontSize: '0.85rem', color: '#00f2fe', fontWeight: 700 }}>Cross-Modal Acoustic Aperture Synchronization</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', fontSize: '1.025rem' }}>
              Tracks 3D mouth aperture landmarks frame-by-frame and cross-correlates vertical lip opening against the audio vocal energy RMS envelope. Voice-swapped deepfakes produce distinct millisecond phase-shift spikes between mouth opening and vocalization.
            </p>
          </div>
        )}

        {activeTab === 'fusion' && (
          <div className="card-elevated" style={{ padding: '2.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Layers size={26} color="#f59e0b" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff' }}>Multimodal Ensemble Score Fusion</h2>
                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>8-Detector Cross-Validation & Biological Veto Rule</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.025rem' }}>
              Our 8-detector ensemble combines rPPG blood flow, lip-sync aperture, eye blink EAR dynamics, and 2D FFT frequency artifacts into a unified, 100% explainable Reality Score.
            </p>
          </div>
        )}
      </motion.div>

      {/* Head-to-Head Technical Benchmark Table */}
      <LiveBenchmarkTable />
    </div>
  )
}
