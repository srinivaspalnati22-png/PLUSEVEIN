import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, HeartPulse, Mic, Layers, X, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react'

export function BiometricGuideModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn-outline"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
          background: 'rgba(0, 200, 150, 0.1)',
        }}
      >
        <HelpCircle size={16} />
        How Pulsevein Analyzes Video (3D Guide)
      </button>

      {/* Guide Modal */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 13, 26, 0.88)', backdropFilter: 'blur(16px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: '640px', background: 'rgba(15, 22, 35, 0.96)', border: '1px solid rgba(0, 200, 150, 0.35)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={22} color="var(--accent)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>How Pulsevein Detects Deepfakes</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="btn-ghost" style={{ padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Step Progress Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { id: 1 as const, title: '1. Face ROI' },
                { id: 2 as const, title: '2. rPPG Pulse' },
                { id: 3 as const, title: '3. Lip-Sync' },
                { id: 4 as const, title: '4. Fusion Score' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.25rem',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: step === s.id ? 'var(--accent)' : 'var(--bg-base)',
                    color: step === s.id ? '#080d1a' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Step Details */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)', marginBottom: '1.5rem' }}>
              {step === 1 && (
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Step 1: 3D Facial Mesh & ROI Skin Extraction
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    MediaPipe tracks 468 3D facial landmarks to isolate cheek and forehead skin regions. Skin pixels are filtered to eliminate background noise, clothing, and specular glare.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Step 2: Sub-Surface rPPG Blood Flow Pulse Engine
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Applies the peer-reviewed CHROM algorithm ($X_s = 3R - 2G, Y_s = 1.5R + G - 1.5B$). Measures microscopic green-light absorption caused by oxygenated arterial blood flow during each heartbeat (40–150 BPM).
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Step 3: Lip-Sync Aperture & Audio Envelope DSP
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Extracts 3D lip landmark aperture opening ratio $A(t)$ and librosa audio energy RMS envelope $E(t)$. Computes normalized cross-correlation to flag millisecond voice-swapping phase shifts.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Step 4: Multimodal Score Fusion & Verdict
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Fuses biological rPPG pulse coherence (55% weight) and lip-sync aperture match (45% weight) into a single 0–100 Reality Score, outputting a clear plain-English verdict.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn-outline"
                onClick={() => setStep(step > 1 ? (step - 1) as 1 | 2 | 3 | 4 : 1)}
                disabled={step === 1}
                style={{ padding: '0.5rem 1.25rem', opacity: step === 1 ? 0.5 : 1 }}
              >
                Previous Step
              </button>
              {step < 4 ? (
                <button
                  className="btn-primary"
                  onClick={() => setStep((step + 1) as 1 | 2 | 3 | 4)}
                  style={{ padding: '0.5rem 1.25rem', fontWeight: 700 }}
                >
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setIsOpen(false)}
                  style={{ padding: '0.5rem 1.5rem', fontWeight: 700 }}
                >
                  <CheckCircle2 size={16} /> Got It!
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
