import { useState } from 'react'
import { Smartphone, X, Copy, ExternalLink, Globe, Wifi } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  fingerprintId: string
}

export function MobileQRSyncModal({ isOpen, onClose, fingerprintId }: Props) {
  const [copied, setCopied] = useState(false)
  const [useCloud, setUseCloud] = useState(true)

  if (!isOpen) return null

  // Live Cloud Production URL & Local Network URL
  const cloudUrl = `https://frontend-ochre-kappa-13.vercel.app/results/${fingerprintId.toLowerCase()}`
  const localUrl = `http://172.15.2.198:5173/results/${fingerprintId.toLowerCase()}`

  const targetUrl = useCloud ? cloudUrl : localUrl
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(targetUrl)}&color=050914&bgcolor=ffffff`

  const copyUrl = () => {
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1.5rem' }}>
      <div className="card-elevated" style={{ width: '100%', maxWidth: '460px', padding: '2rem', border: '1px solid #00c896', textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(0, 200, 150, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
          <Smartphone size={30} color="#00c896" />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
          Mobile Application QR Sync
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Scan this QR code with your smartphone camera to open the application directly on your phone.
        </p>

        {/* Toggle Mode: Live Cloud Production vs Wi-Fi LAN */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setUseCloud(true)}
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: `1px solid ${useCloud ? '#00c896' : 'var(--bg-border)'}`,
              background: useCloud ? 'rgba(0, 200, 150, 0.18)' : 'transparent',
              color: useCloud ? '#00c896' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Globe size={13} />
            Live Cloud URL (Any Network)
          </button>

          <button
            onClick={() => setUseCloud(false)}
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: `1px solid ${!useCloud ? '#00f2fe' : 'var(--bg-border)'}`,
              background: !useCloud ? 'rgba(0, 242, 254, 0.18)' : 'transparent',
              color: !useCloud ? '#00f2fe' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Wifi size={13} />
            Wi-Fi LAN URL (Local)
          </button>
        </div>

        {/* Real 100% Scannable High-Resolution QR Code Image */}
        <div style={{ background: '#ffffff', padding: '1.15rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1.25rem', boxShadow: '0 0 35px rgba(0, 200, 150, 0.45)' }}>
          <img
            src={qrImageUrl}
            alt="Scannable QR Code for Live Mobile App"
            style={{ width: '200px', height: '200px', display: 'block', borderRadius: '4px' }}
          />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1.25rem', background: 'rgba(5, 9, 20, 0.8)', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)' }}>
          Target: <strong style={{ color: useCloud ? '#00c896' : '#00f2fe' }}>{targetUrl}</strong>
        </div>

        {/* Copy Direct Link & Open Link Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={copyUrl} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
            <Copy size={14} />
            {copied ? 'Link Copied!' : 'Copy Mobile Link'}
          </button>

          <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: '#00c896', color: '#050914', textDecoration: 'none' }}>
            <ExternalLink size={14} />
            Open App
          </a>
        </div>
      </div>
    </div>
  )
}
