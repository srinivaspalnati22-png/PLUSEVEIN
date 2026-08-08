import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Activity, LogOut, Scan, Radio, Cpu, Sliders, Play, FolderArchive, Moon, Sun, Menu, X } from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOled, setIsOled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const toggleTheme = () => {
    const nextOled = !isOled
    setIsOled(nextOled)
    if (nextOled) {
      document.documentElement.setAttribute('data-theme', 'oled')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { label: 'Verify', path: '/analyze', icon: <Scan size={18} /> },
    { label: 'Investigate', path: '/methodology', icon: <Cpu size={18} /> },
    { label: 'Evidence Locker', path: '/dashboard', icon: <FolderArchive size={18} /> },
    { label: 'Insights', path: '/monitor', icon: <Radio size={18} /> },
  ]

  return (
    <nav
      style={{
        background: isOled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(5, 9, 20, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 242, 254, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Brand Logo */}
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
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
                flexShrink: 0,
              }}
            >
              <Activity size={22} color="#050914" strokeWidth={2.8} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 'clamp(1rem, 4vw, 1.2rem)', color: '#ffffff', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              REALITYCHECK<span style={{ color: '#00f2fe' }}> AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.35rem' }}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius)',
                  color: isActive(item.path) ? '#00f2fe' : 'var(--text-secondary)',
                  background: isActive(item.path) ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Action Menu */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleTheme}
              title={isOled ? 'Switch to Cyberpunk Dark Theme' : 'Switch to Pure OLED Midnight Theme'}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                borderColor: isOled ? '#00f2fe' : 'var(--bg-border)',
                color: isOled ? '#00f2fe' : 'var(--text-muted)',
                background: isOled ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              }}
            >
              {isOled ? <Sun size={15} color="#00f2fe" /> : <Moon size={15} />}
              <span>{isOled ? 'OLED On' : 'OLED Mode'}</span>
            </button>

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

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <Link
              to="/analyze?demo=true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '16px',
                background: 'rgba(0, 242, 254, 0.12)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                color: '#00f2fe',
                fontSize: '0.75rem',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              <Play size={12} fill="#00f2fe" />
              Demo
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--bg-border)',
                color: '#ffffff',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={22} color="#00f2fe" /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            style={{
              padding: '1rem 0 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
            className="md:hidden"
          >
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  color: isActive(item.path) ? '#00f2fe' : 'var(--text-primary)',
                  background: isActive(item.path) ? 'rgba(0, 242, 254, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${isActive(item.path) ? 'rgba(0, 242, 254, 0.3)' : 'var(--bg-border)'}`,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={toggleTheme}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  fontSize: '0.85rem',
                  borderColor: isOled ? '#00f2fe' : 'var(--bg-border)',
                  color: isOled ? '#00f2fe' : 'var(--text-muted)',
                  background: isOled ? 'rgba(0, 242, 254, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                }}
              >
                {isOled ? <Sun size={16} color="#00f2fe" /> : <Moon size={16} />}
                <span>{isOled ? 'OLED Mode' : 'Cyberpunk Dark'}</span>
              </button>

              {user && (
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    color: isActive('/settings') ? '#00f2fe' : 'var(--text-secondary)',
                  }}
                >
                  <Sliders size={16} />
                  Settings
                </Link>
              )}
            </div>

            {user ? (
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', background: '#00c896', color: '#080d1a', textAlign: 'center' }}
              >
                Sign In / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
