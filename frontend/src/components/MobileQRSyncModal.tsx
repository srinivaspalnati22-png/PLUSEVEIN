import { useState } from 'react'
import { Smartphone, X, Copy, ExternalLink, Wifi } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  fingerprintId: string
}

export function MobileQRSyncModal({ isOpen, onClose, fingerprintId }: Props) {
  const [copied, setCopied] = useState(false)
  const defaultIp = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '172.15.2.198' : window.location.hostname
  const [hostIp, setHostIp] = useState(defaultIp)

  if (!isOpen) return null

  // Compute LAN IP Mobile Target URL so smartphones on the same Wi-Fi can open it
  const port = window.location.port ? `:${window.location.port}` : ''
  const reportUrl = `http://${hostIp}${port}/results/${fingerprintId.toLowerCase()}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(reportUrl)}&color=050914&bgcolor=ffffff`

  const copyUrl = () => {
    navigator.clipboard.writeText(reportUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
      <div className="card-elevated" style={{ width: '100%', maxWidth: '460px', padding: '2rem', border: '1px solid #00c896', textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(0, 200, 150, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
          <Smartphone size={28} color="#00c896" />
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
          Mobile Verification QR Sync
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Scan this QR code with your phone camera to view this report over your Wi-Fi network.
        </p>

        {/* Real 100% Scannable QR Code Image */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1rem', boxShadow: '0 0 30px rgba(0, 200, 150, 0.4)' }}>
          <img
            src={qrImageUrl}
            alt="Scannable QR Code for Mobile Verification"
            style={{ width: '180px', height: '180px', display: 'block', borderRadius: '4px' }}
          />
        </div>

        {/* Wi-Fi LAN Host IP Config Box */}
        <div style={{ background: 'rgba(5, 9, 20, 0.9)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)', marginBottom: '1.25rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            <Wifi size={14} />
            Wi-Fi Local Host IP Address
          </div>
          <input
            type="text"
            value={hostIp}
            onChange={e => setHostIp(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: '4px', padding: '0.4rem 0.625rem', color: '#ffffff', fontSize: '0.825rem', fontFamily: 'monospace' }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
            Scans to: <strong style={{ color: '#00c896' }}>{reportUrl}</strong>
          </span>
        </div>

        {/* Copy Direct Link Button */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={copyUrl} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
            <Copy size={14} />
            {copied ? 'Link Copied!' : 'Copy Wi-Fi Mobile Link'}
          </button>

          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: '#00c896', color: '#050914', textDecoration: 'none' }}>
            <ExternalLink size={14} />
            Open Link
          </a>
        </div>
      </div>
    </div>
  )
}
