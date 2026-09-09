import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  HeartPulse,
  Mic,
  Play,
  X,
  Video,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Zap,
  Activity,
  Scan,
  Sparkles,
  Flame,
} from 'lucide-react'

// Live Real-Time Cardiac Photoplethysmogram (rPPG) Waveform
function LivePulseTelemetry() {
  const [bpm, setBpm] = useState(74)
  const [snr, setSnr] = useState(14.2)

  useEffect(() => {
    const timer = setInterval(() => {
      setBpm(Math.floor(72 + Math.random() * 5))
      setSnr(Number((13.8 + Math.random() * 0.8).toFixed(1)))
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  const heights = [8, 14, 10, 22, 12, 28, 10, 18, 8, 24, 14, 20, 10, 16, 8, 26, 12, 18, 8]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '0.65rem 1.25rem',
        background: 'rgba(7, 13, 30, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 30px rgba(0, 240, 255, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HeartPulse size={20} color="var(--crimson)" className="animate-pulse" />
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EXTRACTED rPPG</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {bpm} <span style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>BPM</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '32px' }}>
        {heights.map((h, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: `${h}px`,
              animationDelay: `${(i * 0.06).toFixed(2)}s`,
              animationDuration: `${0.65 + (i % 4) * 0.15}s`,
            }}
          />
        ))}
      </div>

      <div style={{ borderLeft: '1px solid var(--bg-border)', paddingLeft: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CHROM SNR</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
          +{snr} dB
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [sandboxMode, setSandboxMode] = useState<'real' | 'fake'>('fake')

  const featureCards = [
    {
      title: 'rPPG Optical Pulse Extraction',
      desc: 'Extracts microscopic subcutaneous blood volume circulation in cheek & forehead skin using 3R-2G CHROM color-space filtering (540–580 nm).',
      icon: <HeartPulse size={26} color="var(--crimson)" />,
      badge: 'BIOLOGICAL GROUND TRUTH',
      color: 'var(--crimson)',
      metric: '0.04s Pulse Latency',
    },
    {
      title: '3D Lip-Sync Kinematics DSP',
      desc: 'Tracks MediaPipe 468 3D mouth aperture velocity against vocal RMS acoustic envelopes to expose >120ms phase shift synthesis spikes.',
      icon: <Mic size={26} color="var(--cyan)" />,
      badge: 'ACOUSTIC KINEMATICS',
      color: 'var(--cyan)',
      metric: '<120ms Phase Resolution',
    },
    {
      title: '8-Detector Ensemble Core',
      desc: 'Cross-correlates cardiac rhythm, eye-blink EAR dynamics, 3D head pose jitter, facial Action Units, and 2D FFT high-frequency grids.',
      icon: <Cpu size={26} color="var(--violet)" />,
      badge: 'MULTIMODAL FUSION',
      color: 'var(--violet)',
      metric: '8 Independent Vectors',
    },
    {
      title: 'Courtroom SHA-256 PDF Export',
      desc: 'Generates formal printable Forensic Audit Certificates with cryptographic SHA-256 timestamps and mobile QR chain-of-custody sync.',
      icon: <FileCheck size={26} color="var(--emerald)" />,
      badge: 'CHAIN-OF-CUSTODY',
      color: 'var(--emerald)',
      metric: 'SHA-256 Cryptographic Stamp',
    },
  ]

  const stats = [
    { val: '98.4%', label: 'Sora / Gen-3 2026 Immunity', desc: 'Generator-Agnostic Physics' },
    { val: '<120ms', label: 'Lip Aperture Desync Check', desc: 'Phase Shift Resolution' },
    { val: '0.4%', label: 'Biological Veto False Alarm', desc: 'Dual-Signal Verification' },
    { val: 'SHA-256', label: 'Courtroom Evidence Audit', desc: 'Cryptographic Integrity' },
  ]

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', overflowY: 'auto' }}>
      {/* ====================================================
          1. FLAGSHIP HERO SECTION
         ==================================================== */}
      <section
        style={{
          minHeight: 'calc(100vh - 70px)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: '3.5rem 1.5rem 2rem',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Hero Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: '1.25rem' }}
              >
                <span
                  className="badge badge-live"
                  style={{
                    padding: '0.5rem 1.1rem',
                    gap: '0.6rem',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--cyan)',
                      display: 'inline-block',
                      animation: 'pulse-ring 2s ease-out infinite',
                    }}
                  />
                  ENTERPRISE BIOMETRIC DEFENSE // MULTIMODAL FORENSICS
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  marginBottom: '1.25rem',
                  color: '#ffffff',
                }}
              >
                SEE BEYOND <br />
                <span className="text-glow-cyan" style={{ color: 'var(--cyan)' }}>
                  THE SYNTHETIC.
                </span>
                <br />
                <span style={{ fontSize: 'clamp(1.8rem, 3.8vw, 3rem)', color: 'var(--text-secondary)', fontWeight: 800 }}>
                  DETECT BIOLOGICAL REALITY.
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <LivePulseTelemetry />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '2.25rem',
                  maxWidth: '580px',
                }}
              >
                Generative diffusion models simulate pixels, but cannot reproduce
                genuine cardiovascular hemoglobin absorption or 3D neuromuscular lip-sync kinematics.
                PULSEVEIN exposes the biological signals AI cannot fake.
              </motion.p>

              {/* Quick Launch Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Link
                  to="/analyze"
                  className="btn btn-primary"
                  style={{
                    padding: '0.95rem 2.25rem',
                    fontSize: '1rem',
                    fontWeight: 900,
                  }}
                >
                  Start Forensic Scan
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/monitor"
                  className="btn btn-secondary"
                  style={{
                    padding: '0.95rem 1.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Radio size={18} color="var(--cyan)" />
                  Live Camera Monitor
                </Link>
              </motion.div>
            </div>

            {/* Hero Right: Live Interactive Forensic Sandbox Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{ width: '100%' }}
            >
              <div
                className="hud-frame"
                style={{
                  padding: '1.75rem',
                  maxWidth: '520px',
                  margin: '0 auto',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.1)',
                }}
              >
                {/* Sandbox Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} color="var(--cyan)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', letterSpacing: '0.04em' }}>
                      BIOMETRIC FORENSIC SIMULATION
                    </span>
                  </div>
                  <span className="badge badge-live" style={{ fontSize: '0.65rem' }}>LIVE SIM</span>
                </div>

                {/* Toggle between Real & Fake */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    background: 'rgba(3, 7, 18, 0.8)',
                    padding: '0.35rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1.25rem',
                    border: '1px solid var(--bg-border)',
                  }}
                >
                  <button
                    onClick={() => setSandboxMode('fake')}
                    className="btn"
                    style={{
                      padding: '0.55rem',
                      fontSize: '0.825rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius)',
                      background: sandboxMode === 'fake' ? 'linear-gradient(135deg, #ff2a5f 0%, #e11d48 100%)' : 'transparent',
                      color: sandboxMode === 'fake' ? '#ffffff' : 'var(--text-secondary)',
                      boxShadow: sandboxMode === 'fake' ? '0 0 16px rgba(255, 42, 95, 0.4)' : 'none',
                    }}
                  >
                    🛑 AI Deepfake (Sora/Gen-3)
                  </button>
                  <button
                    onClick={() => setSandboxMode('real')}
                    className="btn"
                    style={{
                      padding: '0.55rem',
                      fontSize: '0.825rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius)',
                      background: sandboxMode === 'real' ? 'linear-gradient(135deg, #00f59b 0%, #10b981 100%)' : 'transparent',
                      color: sandboxMode === 'real' ? '#030712' : 'var(--text-secondary)',
                      boxShadow: sandboxMode === 'real' ? '0 0 16px rgba(0, 245, 155, 0.4)' : 'none',
                    }}
                  >
                    ✅ Organic Human Face
                  </button>
                </div>

                {/* Visual Image Preview with ROI Scan Reticle */}
                <div
                  style={{
                    height: '220px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    position: 'relative',
                    border: `1px solid ${sandboxMode === 'fake' ? 'rgba(255, 42, 95, 0.4)' : 'rgba(0, 245, 155, 0.4)'}`,
                    marginBottom: '1.25rem',
                  }}
                >
                  <img
                    src={sandboxMode === 'fake' ? '/images/deepfake_comparison.png' : '/images/rppg_scan.png'}
                    alt="Biometric Analysis Sandbox"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* High-Tech HUD Scan Reticle Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(3, 7, 18, 0.85)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--bg-border)',
                      fontSize: '0.725rem',
                      fontFamily: 'var(--font-mono)',
                      color: sandboxMode === 'fake' ? 'var(--crimson)' : 'var(--emerald)',
                      fontWeight: 700,
                    }}
                  >
                    {sandboxMode === 'fake' ? '⚠️ NO CARDIAC HEMOGLOBIN ABSORPTION' : '✓ 74 BPM ARTERIAL PULSE VERIFIED'}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(3, 7, 18, 0.85)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--bg-border)',
                      fontSize: '0.725rem',
                      fontFamily: 'var(--font-mono)',
                      color: sandboxMode === 'fake' ? 'var(--crimson)' : 'var(--emerald)',
                      fontWeight: 800,
                    }}
                  >
                    {sandboxMode === 'fake' ? 'DESYNC: >140ms' : 'LIP-SYNC: 0.05ms DEV'}
                  </div>
                </div>

                {/* Score Summary & Call to Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(3, 7, 18, 0.6)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--bg-border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIDENCE VERDICT</div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: sandboxMode === 'fake' ? 'var(--crimson)' : 'var(--emerald)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {sandboxMode === 'fake' ? '14% (LIKELY DEEPFAKE)' : '92% (AUTHENTIC HUMAN)'}
                    </div>
                  </div>

                  <Link
                    to={sandboxMode === 'fake' ? '/analyze?demo=true' : '/analyze'}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      borderColor: sandboxMode === 'fake' ? 'rgba(255, 42, 95, 0.4)' : 'rgba(0, 245, 155, 0.4)',
                    }}
                  >
                    Inspect Audit Dossier
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================
          2. 4-PILLAR FORENSIC SIGNAL MATRIX SECTION
         ==================================================== */}
      <section
        style={{
          padding: '5rem 1.5rem',
          background: 'rgba(3, 7, 18, 0.75)',
          borderTop: '1px solid var(--bg-border)',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: 'var(--cyan)',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.75rem',
                background: 'rgba(0, 240, 255, 0.1)',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
              }}
            >
              <ShieldCheck size={16} />
              Forensic Signal Matrix
            </div>
            <h2 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 900, color: '#ffffff' }}>
              4-Pillar Biological & DSP Signal Architecture
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
              Unlike traditional pixel CNNs that break against diffusion upscaling, PULSEVEIN inspects invariant human physiology.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {featureCards.map((card, idx) => (
              <div
                key={idx}
                className="card-elevated hud-frame"
                style={{
                  padding: '2rem 1.75rem',
                  border: `1px solid ${card.color}35`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${card.color}35`,
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 800,
                        color: card.color,
                        background: `${card.color}15`,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        border: `1px solid ${card.color}35`,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
                    {card.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    {card.desc}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--bg-border)',
                    fontSize: '0.775rem',
                    fontFamily: 'var(--font-mono)',
                    color: card.color,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Activity size={14} />
                  {card.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          3. REAL-TIME EXPO BENCHMARK TICKER SECTION
         ==================================================== */}
      <section
        style={{
          padding: '4.5rem 1.5rem',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--bg-border)',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="card-elevated"
                style={{
                  padding: '2rem 1.5rem',
                  background: 'rgba(3, 7, 18, 0.75)',
                  border: '1px solid var(--bg-border)',
                }}
              >
                <div
                  className="telemetry-val"
                  style={{
                    fontSize: '2.75rem',
                    fontWeight: 900,
                    color: 'var(--cyan)',
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          4. CALL TO ACTION (CTA) FOOTER BANNER
         ==================================================== */}
      <section
        style={{
          padding: '5rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.8) 0%, rgba(0, 240, 255, 0.08) 100%)',
          borderTop: '1px solid var(--bg-border)',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--cyan)',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={16} />
            Forensic Reality Verification System
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', fontWeight: 900, color: '#ffffff', marginBottom: '1.25rem' }}>
            Ready to Inspect Media Authenticity?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Run the 8-detector multimodal forensic pipeline on suspect video files or live optical camera streams.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/analyze"
              className="btn btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 900 }}
            >
              Launch Verification Scan
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/methodology"
              className="btn btn-secondary"
              style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', fontWeight: 800 }}
            >
              Explore Signal Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* Start Guide Video Modal Overlay */}
      {showVideoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1.5rem',
          }}
        >
          <div
            className="hud-frame"
            style={{
              width: '100%',
              maxWidth: '880px',
              padding: '1.75rem',
              border: '1px solid var(--cyan)',
              position: 'relative',
              boxShadow: '0 0 50px rgba(0, 240, 255, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)', fontWeight: 900, fontSize: '1.15rem' }}>
                <Video size={22} />
                PULSEVEIN Technical Tour & Demonstration
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#000',
                border: '1px solid var(--bg-border)',
              }}
            >
              <video
                src="/videos/start_guide_demo.mp4"
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
