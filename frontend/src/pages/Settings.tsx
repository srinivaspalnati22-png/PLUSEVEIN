import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sliders, Key, CheckCircle2, User, Code, Terminal, Copy } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function Settings() {
  const { user } = useAuth()
  const [rppgWeight, setRppgWeight] = useState(55)
  const [sensitivity, setSensitivity] = useState<'standard' | 'high' | 'strict'>('standard')
  const [saved, setSaved] = useState(false)
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'node'>('curl')
  const [copiedCode, setCopiedCode] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const snippets = {
    curl: `curl -X POST "http://localhost:8000/api/analyze" \\
  -H "Authorization: Bearer pv_live_sec_88992211445588" \\
  -F "file=@suspect_video.mp4"`,
    python: `import requests

url = "http://localhost:8000/api/analyze"
headers = {"Authorization": "Bearer pv_live_sec_88992211445588"}
files = {"file": open("suspect_video.mp4", "rb")}

response = requests.post(url, headers=headers, files=files)
print(response.json())`,
    node: `const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('suspect_video.mp4'));

axios.post('http://localhost:8000/api/analyze', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer pv_live_sec_88992211445588'
  }
}).then(res => console.log(res.data));`,
  }

  const copyCode = () => {
    navigator.clipboard.writeText(snippets[activeLang])
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '3.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem', background: 'rgba(0, 240, 255, 0.1)', padding: '0.35rem 0.875rem', borderRadius: '20px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
          <Sliders size={16} />
          System Preferences
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Forensic Engine & Developer API Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
          Calibrate ensemble weighting thresholds, developer API key access, and webhook integrations.
        </p>
      </div>

      {saved && (
        <div style={{ background: 'rgba(0, 245, 155, 0.15)', border: '1px solid var(--emerald)', color: '#ffffff', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
          <CheckCircle2 size={20} color="var(--emerald)" />
          System preferences updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '880px' }}>
        {/* User Profile Card */}
        <div className="hud-frame" style={{ padding: '2rem', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <User size={20} color="var(--cyan)" />
              Authenticated User Profile
            </h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.65rem', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
              Supabase Connected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0, 240, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
              <img
                src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                alt="Profile"
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cyan)' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan) 0%, var(--crimson) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#030712', fontSize: '1.2rem' }}>
                {(user?.user_metadata?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.05rem' }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Forensic Investigator'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {user?.email || 'analyst@pulsevein.ai'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.35rem' }}>Authentication Provider</label>
              <input
                type="text"
                value={
                  user?.app_metadata?.provider === 'google'
                    ? 'Google OAuth 2.0 (Verified via Supabase)'
                    : user?.app_metadata?.provider === 'guest'
                    ? 'Instant Guest Access (Bypass)'
                    : 'Email & Password (Supabase RLS)'
                }
                disabled
                style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.75rem', color: '#ffffff', fontSize: '0.9rem', opacity: 0.9, fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.35rem' }}>Supabase Project URL</label>
              <input
                type="text"
                value="https://wxucgspsyekiwbxjjrnw.supabase.co"
                disabled
                style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.75rem', color: 'var(--cyan)', fontWeight: 700, fontSize: '0.85rem', opacity: 0.9, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>
        </div>

        {/* Fusion Weighting Calibration */}
        <div className="card-elevated" style={{ padding: '2rem', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="var(--accent)" />
            Ensemble Fusion Weighting
          </h3>

          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem', fontSize: '0.95rem' }}>
              <span>rPPG Cardiac Weight: <strong style={{ color: 'var(--accent)', fontWeight: 900 }}>{rppgWeight}%</strong></span>
              <span>Lip-Sync DSP Weight: <strong style={{ color: '#00f2fe', fontWeight: 900 }}>{100 - rppgWeight}%</strong></span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={rppgWeight}
              onChange={e => setRppgWeight(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)', height: '6px', cursor: 'pointer' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.75rem' }}>Detection Sensitivity Threshold</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {(['standard', 'high', 'strict'] as const).map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSensitivity(s)}
                  className="btn"
                  style={{
                    flex: 1,
                    textTransform: 'capitalize',
                    border: `1px solid ${sensitivity === s ? 'var(--accent)' : 'var(--bg-border)'}`,
                    color: sensitivity === s ? 'var(--accent)' : 'var(--text-secondary)',
                    background: sensitivity === s ? 'rgba(0, 200, 150, 0.15)' : 'var(--bg-base)',
                    fontWeight: 800,
                    padding: '0.75rem',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API Integration Key */}
        <div className="card-elevated" style={{ padding: '2rem', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="#00f2fe" />
            API Key & Webhook Credentials
          </h3>
          <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <code style={{ fontSize: '0.9rem', color: '#00f2fe', fontFamily: 'monospace' }}>pv_live_sec_88992211445588</code>
            <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.875rem', fontSize: '0.8rem' }}>
              Regenerate Key
            </button>
          </div>

          {/* Developer Code Snippets Box */}
          <div style={{ background: 'rgba(5, 9, 20, 0.9)', borderRadius: 'var(--radius)', border: '1px solid var(--bg-border)', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['curl', 'python', 'node'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className="btn"
                    style={{
                      padding: '0.25rem 0.625rem',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      border: `1px solid ${activeLang === lang ? '#00f2fe' : 'var(--bg-border)'}`,
                      background: activeLang === lang ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                      color: activeLang === lang ? '#00f2fe' : 'var(--text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button type="button" onClick={copyCode} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                <Copy size={14} />
                {copiedCode ? 'Copied Code!' : 'Copy Code'}
              </button>
            </div>

            <pre style={{ fontSize: '0.8rem', color: '#cbd5e1', fontFamily: 'monospace', overflowX: 'auto', margin: 0, lineHeight: 1.5 }}>
              {snippets[activeLang]}
            </pre>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}>
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  )
}
