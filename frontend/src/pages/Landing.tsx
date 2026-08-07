import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, HeartPulse, Mic, Play, X, Video } from 'lucide-react'

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

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Flagship Hero Section */}
      <section
        style={{
          minHeight: 'calc(100vh - 65px)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: '3rem 1.5rem',
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
                Analyze digital media with AI-powered forensic signals to identify potential synthetic manipulation and understand why the model reached its conclusion.
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
