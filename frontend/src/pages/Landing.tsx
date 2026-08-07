import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, HeartPulse, Mic, Play, X, Video, ShieldCheck, Cpu, Layers, FileCheck, CheckCircle2, ChevronRight, Activity, Smartphone, Award } from 'lucide-react'

function PulseWaveform() {
  const heights = [8, 14, 10, 20, 12, 24, 10, 18, 8, 22, 14, 20, 10, 16, 8]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '32px' }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            height: `${h}px`,
            animationDelay: `${(i * 0.08).toFixed(2)}s`,
            animationDuration: `${0.7 + (i % 3) * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Landing() {
  const [showVideoModal, setShowVideoModal] = useState(false)

  const featureCards = [
    {
      title: 'rPPG Optical Pulse Extraction',
      desc: 'Isolates micro-vascular blood volume circulation in cheek skin using CHROM 3R-2G optical color space filtering (540–580 nm).',
      icon: <HeartPulse size={24} color="#00c896" />,
      color: '#00c896',
      badge: 'BIOLOGICAL SIGNAL',
    },
    {
      title: '3D Lip-Sync Kinematics DSP',
      desc: 'Tracks MediaPipe 3D mouth aperture landmarks against audio vocal RMS envelopes to flag >120ms phase shift desync spikes.',
      icon: <Mic size={24} color="#00f2fe" />,
      color: '#00f2fe',
      badge: 'ACOUSTIC KINEMATICS',
    },
    {
      title: '8-Detector Multimodal Ensemble',
      desc: 'Cross-validates cardiac pulses, eye blink EAR dynamics, 3D head pose, facial expressions, and 2D FFT frequency grids.',
      icon: <Cpu size={24} color="#f59e0b" />,
      color: '#f59e0b',
      badge: 'ENSEMBLE FUSION',
    },
    {
      title: 'Cryptographic SHA-256 PDF Export',
      desc: 'Generates formal printable Forensic Audit Certificates complete with SHA-256 hash stamps and mobile QR verification sync.',
      icon: <FileCheck size={24} color="#3b82f6" />,
      color: '#3b82f6',
      badge: 'CHAIN-OF-CUSTODY',
    },
  ]

  const stats = [
    { label: 'Sora / Gen-3 2026 Immunity', val: '98.4%', desc: 'Generator-Agnostic Physics' },
    { label: 'Lip Aperture Desync Check', val: '<120ms', desc: 'Phase Shift Resolution' },
    { label: 'Biological Veto False Alarm', val: '0.4%', desc: 'Dual-Signal Verification' },
    { label: 'Courtroom Evidence Audit', val: 'SHA-256', desc: 'Cryptographic Stamp' },
  ]

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', overflowY: 'auto' }}>
      {/* 1. Flagship Hero Section */}
      <section
        style={{
          minHeight: 'calc(100vh - 65px)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: '4rem 1.5rem 2rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            {/* Hero Left Content */}
            <div>
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.25rem' }}>
                <span className="badge badge-live" style={{ padding: '0.45rem 1rem', gap: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#00f2fe',
                      display: 'inline-block',
                      animation: 'pulse-ring 2s ease-out infinite',
                    }}
                  />
                  Multimodal Deepfake Reality Checker
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  marginBottom: '1.25rem',
                  color: '#ffffff',
                }}
              >
                SEE BEYOND <br /><span style={{ color: '#00f2fe' }}>THE FAKE.</span>
              </motion.h1>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ marginBottom: '1.25rem' }}>
                <PulseWaveform />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                  maxWidth: '560px',
                }}
              >
                Inspect human biological signals that AI cannot fake. Cross-reference sub-surface rPPG skin blood flow absorption and 3D lip-sync aperture kinematics in real time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}
              >
                <Link
                  to="/analyze"
                  className="btn btn-primary"
                  style={{ padding: '0.9rem 2rem', fontSize: '0.95rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}
                >
                  Start Investigation
                  <ArrowRight size={18} />
                </Link>

                <button
                  onClick={() => setShowVideoModal(true)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.9rem 1.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    borderColor: 'rgba(0, 242, 254, 0.4)',
                    color: '#00f2fe',
                    background: 'rgba(0, 242, 254, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Video size={18} color="#00f2fe" />
                  Watch Start Guide Video
                </button>
              </motion.div>
            </div>

            {/* Hero Right Visual Cards */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ width: '100%' }}>
              <div style={{ maxWidth: '460px', margin: '0 auto', height: '240px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid rgba(0, 200, 150, 0.35)', position: 'relative' }}>
                <img src="/images/deepfake_comparison.png" alt="Forensic Analysis Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(5, 9, 20, 0.85)', backdropFilter: 'blur(8px)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#00c896', fontWeight: 800 }}>✓ rPPG Arterial Signal Extracted</span>
                  <span style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 800 }}>88% REAL</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Platform Key Features Grid Section */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(5, 9, 20, 0.6)', borderTop: '1px solid var(--bg-border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              <ShieldCheck size={16} />
              Forensic Signal Matrix
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#ffffff' }}>
              4-Pillar Biological & DSP Signal Architecture
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
            {featureCards.map((card, idx) => (
              <div key={idx} className="card-elevated" style={{ padding: '1.75rem', border: `1px solid ${card.color}35`, background: 'rgba(10, 16, 28, 0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${card.color}30` }}>
                    {card.icon}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: card.color, background: `${card.color}15`, padding: '0.2rem 0.5rem', borderRadius: '4px', border: `1px solid ${card.color}30` }}>
                    {card.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Real-Time Detection Stats Showcase Banner */}
      <section style={{ padding: '4rem 1.5rem', background: 'rgba(10, 16, 28, 0.8)', borderTop: '1px solid var(--bg-border)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ padding: '1.5rem', background: 'rgba(5, 9, 20, 0.8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#00f2fe', lineHeight: 1, marginBottom: '0.5rem' }}>
                  {s.val}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Call-To-Action (CTA) Footer Banner */}
      <section style={{ padding: '4.5rem 1.5rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(5,9,20,0.8) 0%, rgba(0,200,150,0.1) 100%)', borderTop: '1px solid var(--bg-border)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#ffffff', marginBottom: '1rem' }}>
            Ready to Inspect Media Authenticity?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Run an 8-detector multimodal forensic scan on your video file or live webcam stream.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', fontWeight: 900, background: '#00c896', color: '#080d1a' }}>
              Start Verification Scan
              <ArrowRight size={18} />
            </Link>
            <Link to="/methodology" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 800 }}>
              Explore Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* Start Guide Video Modal Overlay */}
      {showVideoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1.5rem' }}>
          <div className="card-elevated" style={{ width: '100%', maxWidth: '840px', padding: '1.5rem', border: '1px solid #00f2fe', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00f2fe', fontWeight: 900, fontSize: '1.1rem' }}>
                <Video size={20} />
                User Start Guide & App Tutorial
              </div>
              <button onClick={() => setShowVideoModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000', border: '1px solid var(--bg-border)' }}>
              <video
                src="/videos/start_guide_demo.mp4"
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
