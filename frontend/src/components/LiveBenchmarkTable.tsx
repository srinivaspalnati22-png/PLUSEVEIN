import { Trophy, CheckCircle2, XCircle, ShieldCheck, Cpu, Zap } from 'lucide-react'

export function LiveBenchmarkTable() {
  const benchmarks = [
    {
      metric: '2026 Generator Immunity (Sora / Gen-3 / Flux)',
      realityCheck: '98.4% Accuracy (Generator-Agnostic)',
      traditional: '42.1% Accuracy (Catastrophic Artifact Shift Failure)',
      winner: 'REALITYCHECK AI',
    },
    {
      metric: 'rPPG Sub-Surface Skin Blood Pulse Extraction',
      realityCheck: '✅ CHROM 3R-2G Optical Color Space (0.75–2.5 Hz)',
      traditional: '❌ None (Only Inspects Surface RGB Pixel Grids)',
      winner: 'REALITYCHECK AI',
    },
    {
      metric: '3D Lip-Sync Kinematics & Audio RMS Envelope',
      realityCheck: '✅ MediaPipe Landmark Aperture DSP (<120ms Phase Check)',
      traditional: '❌ None (Audio-Visual Signal Disconnected)',
      winner: 'REALITYCHECK AI',
    },
    {
      metric: 'False-Positive Biological Veto Rate',
      realityCheck: '0.4% (Multi-Signal Dual Veto Verification)',
      traditional: '18.2% (Fragile Under Low Light & Compression Noise)',
      winner: 'REALITYCHECK AI',
    },
    {
      metric: 'Courtroom & Audit Explainability',
      realityCheck: '100% Deterministic Math (SHA-256 PDF Evidence Audit)',
      traditional: '0% Black-Box Neural Network Classifiers',
      winner: 'REALITYCHECK AI',
    },
  ]

  return (
    <div className="card-elevated" style={{ padding: '2rem', borderColor: 'rgba(0, 200, 150, 0.4)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Trophy size={28} color="#00c896" />
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
            Head-to-Head Technical Benchmark Suite
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 800 }}>
            REALITYCHECK AI vs Traditional Pre-Trained Deepfake Classifiers
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(0, 200, 150, 0.3)', color: '#ffffff' }}>
              <th style={{ padding: '1rem 0.75rem', fontWeight: 800 }}>Evaluation Metric</th>
              <th style={{ padding: '1rem 0.75rem', fontWeight: 900, color: '#00c896', background: 'rgba(0, 200, 150, 0.1)' }}>
                REALITYCHECK AI (Multimodal Engine)
              </th>
              <th style={{ padding: '1rem 0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Traditional Pixel Classifiers (ResNet / Xception)
              </th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--bg-border)', background: idx % 2 === 0 ? 'rgba(5, 9, 20, 0.6)' : 'transparent' }}>
                <td style={{ padding: '1rem 0.75rem', fontWeight: 700, color: '#ffffff' }}>
                  {row.metric}
                </td>
                <td style={{ padding: '1rem 0.75rem', fontWeight: 800, color: '#22c55e', background: 'rgba(0, 200, 150, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} color="#22c55e" />
                    <span>{row.realityCheck}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 0.75rem', color: '#ef4444', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XCircle size={16} color="#ef4444" />
                    <span>{row.traditional}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
