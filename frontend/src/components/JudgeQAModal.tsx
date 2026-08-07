import { useState } from 'react'
import { ShieldCheck, HelpCircle, X, Search, CheckCircle2, Cpu, Activity, Award } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const QA_ITEMS = [
  {
    q: 'What is your core novelty compared to existing deepfake detectors?',
    category: 'Architecture Novelty',
    a: 'Traditional detectors look at pixel artifacts using pre-trained convolutional networks (ResNet, Xception). When new 2026 generators (Sora, Gen-3, Flux) arrive, pixel artifact detectors fail. REALITYCHECK AI is generator-agnostic. We inspect human biology—Remote Photoplethysmography (rPPG) skin blood flow absorption and 3D mouth aperture lip kinematics vs audio envelopes.',
  },
  {
    q: 'How does Remote Photoplethysmography (rPPG) detect synthetic video?',
    category: 'rPPG Physics',
    a: 'Human skin absorbs green light (540–580nm) as cardiac arterial blood pulses through facial capillaries. Generative AI models generate smooth visual RGB frames without micro-vascular blood volume pulses. Our CHROM projection formula (3R - 2G) extracts skin FFT peaks between 0.75–2.5 Hz (45–150 BPM). Absence of coherent rPPG peaks flags synthetic video.',
  },
  {
    q: 'What is the Biological Veto Rule?',
    category: 'False Positive Prevention',
    a: 'To prevent optical noise or poor camera lighting from false-flagging real humans, our ensemble fusion applies a Biological Veto Rule. A video is only flagged as a deepfake if at least 2 independent primary biological detectors (rPPG pulse AND lip-sync DSP desync) confirm synthetic anomalies simultaneously.',
  },
  {
    q: 'How does Lip-Sync Coherence DSP work?',
    category: 'Audio-Visual DSP',
    a: 'We track 3D mouth aperture landmarks (MediaPipe keypoints 13 & 14) frame-by-frame and compute cross-correlation against the audio RMS energy envelope (librosa). Voice-swapped deepfakes (e.g. Wav2Lip) produce distinct millisecond phase-shift spikes (>120ms) between mouth opening and audio vocalization.',
  },
  {
    q: 'Is the model output explainable or a black box?',
    category: 'Explainable AI',
    a: '100% Explainable. We provide mathematical proof for every verdict: exact timestamp desync spikes in seconds, CHROM SNR in dB, cardiac pulse peak in BPM, and cryptographic SHA-256 chain-of-custody PDF audit certificates.',
  },
]

export function JudgeQAModal({ isOpen, onClose }: Props) {
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const filteredQA = QA_ITEMS.filter(
    item => item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1.5rem' }}>
      <div className="card-elevated" style={{ width: '100%', maxWidth: '720px', padding: '2rem', border: '1px solid #00f2fe', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Award size={28} color="#00f2fe" />
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>Judge Q&A & Technical Defense Guide</h3>
            <span style={{ fontSize: '0.8rem', color: '#00c896', fontWeight: 700 }}>Hackathon Presentation & Technical Evaluation Reference</span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search technical question or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.625rem 0.75rem 0.625rem 2.25rem', color: '#ffffff', fontSize: '0.875rem' }}
          />
        </div>

        {/* Q&A Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQA.map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(5, 9, 20, 0.9)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{item.q}</h4>
                <span style={{ fontSize: '0.7rem', color: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.3)', whiteSpace: 'nowrap' }}>
                  {item.category}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
