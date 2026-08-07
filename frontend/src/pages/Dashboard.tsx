import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Scan, TrendingUp, AlertTriangle, HelpCircle, CheckCircle, Search, Download, ShieldCheck, FolderArchive, Fingerprint } from 'lucide-react'
import { api } from '@/lib/api'
import type { HistoryItem, Stats } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const VERDICT_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  'FAKE':        { color: '#ef4444', icon: <AlertTriangle size={14} /> },
  'LIKELY FAKE': { color: '#f97316', icon: <AlertTriangle size={14} /> },
  'UNCERTAIN':   { color: '#f59e0b', icon: <HelpCircle size={14} /> },
  'LIKELY REAL': { color: '#84cc16', icon: <CheckCircle size={14} /> },
  'REAL':        { color: '#22c55e', icon: <CheckCircle size={14} /> },
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [h, s] = await Promise.all([api.getHistory(50), api.getStats()])
        setHistory(h)
        setStats(s)
      } catch {
        const fallbackHistory: HistoryItem[] = [
          {
            id: 'hist-demo-1',
            video_filename: 'deepfake_speech_clip.mp4',
            overall_score: 18,
            verdict: 'FAKE',
            confidence_tier: 'high',
            is_demo: true,
            created_at: new Date().toISOString(),
            video_duration_s: 24.0,
          },
          {
            id: 'hist-demo-2',
            video_filename: 'authentic_press_conference.mp4',
            overall_score: 88,
            verdict: 'REAL',
            confidence_tier: 'high',
            is_demo: true,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            video_duration_s: 18.0,
          },
          {
            id: 'hist-demo-3',
            video_filename: 'low_light_interview.mp4',
            overall_score: 48,
            verdict: 'UNCERTAIN',
            confidence_tier: 'low',
            is_demo: true,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            video_duration_s: 14.0,
          },
        ]
        setHistory(fallbackHistory)
        setStats({
          total_analyses: 12,
          live_analyses: 4,
          fake_detected: 6,
          real_detected: 4,
          uncertain: 2,
          avg_score: 51.4,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.video_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
    const matchesVerdict = verdictFilter === 'ALL' || item.verdict.includes(verdictFilter)
    return matchesSearch && matchesVerdict
  })

  const exportCSV = () => {
    const headers = 'ID,Fingerprint,Filename,Reality Score,Verdict,Confidence,Mode,Date\n'
    const rows = filteredHistory
      .map(
        h =>
          `"${h.id}","DF-2026-${h.id.slice(0, 4).toUpperCase()}","${h.video_filename || ''}",${h.overall_score},"${h.verdict}","${h.confidence_tier}","${h.is_demo ? 'DEMO' : 'LIVE'}","${h.created_at}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `realitycheck-evidence-export-${Date.now()}.csv`
    a.click()
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem', position: 'relative', zIndex: 1 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '0.5rem', background: 'rgba(0, 200, 150, 0.1)', padding: '0.35rem 0.875rem', borderRadius: '20px', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
            <FolderArchive size={16} />
            Forensic Evidence Locker
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Evidence Locker & Analysis Archive
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.975rem' }}>
            Auditor: <strong style={{ color: '#ffffff' }}>{user?.email || 'analyst@realitycheck.ai'}</strong> | Complete forensic case history and Deepfake Fingerprints™.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportCSV} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem', fontSize: '0.85rem' }}>
            <Download size={16} />
            Export Locker CSV
          </button>

          <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}>
            <Scan size={16} />
            Start Investigation
          </Link>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Archived Evidence', val: stats?.total_analyses ?? 0, note: 'Cases Recorded', color: '#00f2fe', icon: <FolderArchive size={20} /> },
          { label: 'Deepfakes Flagged', val: stats?.fake_detected ?? 0, note: 'Synthetic Media Cases', color: '#ef4444', icon: <AlertTriangle size={20} /> },
          { label: 'Authentic Media', val: stats?.real_detected ?? 0, note: 'Human Verified Cases', color: '#22c55e', icon: <ShieldCheck size={20} /> },
          { label: 'Average Confidence', val: `${stats?.avg_score ?? 0}%`, note: 'Overall Reality Mean', color: 'var(--accent)', icon: <TrendingUp size={20} /> },
        ].map((card, idx) => (
          <div key={idx} className="card-elevated" style={{ padding: '1.5rem', border: `1px solid ${card.color}30` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{card.label}</span>
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: card.color, lineHeight: 1, marginBottom: '0.35rem' }}>
              {card.val}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.note}</span>
          </div>
        ))}
      </div>

      {/* History Log Table Box */}
      <div className="card-elevated" style={{ padding: '1.75rem', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            Archived Case Files ({filteredHistory.length})
          </h2>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search filename or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                }}
              />
            </div>

            <select
              value={verdictFilter}
              onChange={e => setVerdictFilter(e.target.value)}
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius)',
                padding: '0.5rem 0.875rem',
                fontSize: '0.85rem',
                color: '#ffffff',
              }}
            >
              <option value="ALL">All Verdicts</option>
              <option value="FAKE">FAKE</option>
              <option value="REAL">REAL</option>
              <option value="UNCERTAIN">UNCERTAIN</option>
            </select>
          </div>
        </div>

        {/* History Records Grid / Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading evidence locker cases...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No analysis case files match your search query.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredHistory.map(item => {
              const cfg = VERDICT_CONFIG[item.verdict] || { color: 'var(--text-secondary)', icon: null }
              const itemFingerprint = `DF-2026-${item.id.slice(0, 4).toUpperCase()}`

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(5, 9, 20, 0.7)',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--bg-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                        {item.video_filename || 'media_clip_input.mp4'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.25)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Fingerprint size={12} />
                        {itemFingerprint}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                      <span>⏱ {item.video_duration_s ? `${item.video_duration_s.toFixed(1)}s` : '15.0s'}</span>
                      <span>📅 {formatDate(item.created_at)}</span>
                      <span>{item.is_demo ? '⚡ DEMO' : '🔴 LIVE'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: `${cfg.color}18`,
                        color: cfg.color,
                        padding: '0.35rem 0.875rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        border: `1px solid ${cfg.color}40`,
                      }}
                    >
                      {cfg.icon}
                      {item.verdict} ({item.overall_score}%)
                    </div>

                    <Link
                      to={`/results/${item.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Inspect Report
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
