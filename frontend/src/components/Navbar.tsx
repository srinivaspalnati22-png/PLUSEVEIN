import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Activity, LogOut, Scan, Radio, Cpu, Sliders, Play, FolderArchive } from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav
      style={{
        background: 'rgba(5, 9, 20, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 242, 254, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #00c896 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
              }}
            >
              <Activity size={22} color="#050914" strokeWidth={2.8} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#ffffff', letterSpacing: '0.05em' }}>
              REALITYCHECK<span style={{ color: '#00f2fe' }}> AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Link
              to="/analyze"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius)',
                color: isActive('/analyze') ? '#00f2fe' : 'var(--text-secondary)',
                background: isActive('/analyze') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Scan size={16} />
              Verify
            </Link>

            <Link
              to="/methodology"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius)',
                color: isActive('/methodology') ? '#00f2fe' : 'var(--text-secondary)',
                background: isActive('/methodology') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Cpu size={16} />
              Investigate
            </Link>

            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius)',
                color: isActive('/dashboard') ? '#00f2fe' : 'var(--text-secondary)',
                background: isActive('/dashboard') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <FolderArchive size={16} />
              Evidence Locker
            </Link>

            <Link
              to="/monitor"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius)',
                color: isActive('/monitor') ? '#00f2fe' : 'var(--text-secondary)',
                background: isActive('/monitor') ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Radio size={16} />
              Insights
            </Link>
          </div>

          {/* Right Action Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/analyze?demo=true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                color: '#00f2fe',
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              <Play size={14} fill="#00f2fe" />
              Demo Mode
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Link
                  to="/settings"
                  style={{
                    color: isActive('/settings') ? '#00f2fe' : 'var(--text-secondary)',
                    padding: '0.4rem',
                  }}
                >
                  <Sliders size={18} />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary" style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
