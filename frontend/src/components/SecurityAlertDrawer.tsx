import { useState } from 'react'
import { Bell, X, ShieldAlert } from 'lucide-react'

export function SecurityAlertDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  const alerts = [
    { id: 1, type: 'CRITICAL', title: 'Deepfake Threat Detected', msg: 'deepfake_speech_clip.mp4 (18% REAL) flagged via rPPG absence.', time: '2 mins ago' },
    { id: 2, type: 'WARNING', title: 'Lip-Sync Desync Spike', msg: 'interview_clip_02.mp4 phase shift 142ms at 0:14s.', time: '15 mins ago' },
    { id: 3, type: 'INFO', title: 'System Engine Verified', msg: '8-detector ensemble model calibrated successfully.', time: '1 hour ago' },
  ]

  return (
    <>
      {/* Floating Security Bell Button — Offset to left of Copilot Chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Security Threat Alert Center"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '200px',
          height: '46px',
          padding: '0 1rem',
          borderRadius: '24px',
          background: 'rgba(239, 68, 68, 0.18)',
          border: '1px solid #ef4444',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 800,
          fontSize: '0.825rem',
          cursor: 'pointer',
          boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
          zIndex: 9999,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Bell size={18} className="animate-pulse" />
        <span>Security Threats (2)</span>
      </button>

      {/* Slide-over Threat Drawer */}
      {isOpen && (
        <div style={{ position: 'fixed', bottom: '80px', right: '200px', width: '360px', zIndex: 9999 }}>
          <div className="card-elevated" style={{ padding: '1.5rem', border: '1px solid #ef4444', boxShadow: '0 12px 40px rgba(0,0,0,0.85)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 900, fontSize: '0.95rem' }}>
                <ShieldAlert size={18} />
                Security Threat Alert Center
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.map(a => (
                <div key={a.id} style={{ background: 'rgba(5, 9, 20, 0.95)', padding: '0.75rem', borderRadius: 'var(--radius)', border: `1px solid ${a.type === 'CRITICAL' ? 'rgba(239, 68, 68, 0.4)' : 'var(--bg-border)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: a.type === 'CRITICAL' ? '#ef4444' : '#f59e0b', marginBottom: '0.2rem' }}>
                    <span>{a.title}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {a.msg}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
