import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import {
  HeartPulse,
  LogOut,
  Scan,
  Radio,
  Cpu,
  Sliders,
  FolderArchive,
  Palette,
  Menu,
  X,
  BarChart3,
  Sparkles,
} from 'lucide-react'

type PaletteTheme = 'abyss' | 'crimson' | 'matrix' | 'oled'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTheme, setCurrentTheme] = useState<PaletteTheme>('abyss')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Initialize theme from localStorage if set
  useEffect(() => {
    const saved = localStorage.getItem('pv_theme') as PaletteTheme | null
    if (saved) {
      setCurrentTheme(saved)
      if (saved === 'abyss') {
        document.documentElement.removeAttribute('data-theme')
      } else {
        document.documentElement.setAttribute('data-theme', saved)
      }
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const cycleTheme = () => {
    const themes: PaletteTheme[] = ['abyss', 'crimson', 'matrix', 'oled']
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length
    const nextTheme = themes[nextIdx]
    setCurrentTheme(nextTheme)
    localStorage.setItem('pv_theme', nextTheme)
    if (nextTheme === 'abyss') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', nextTheme)
    }
  }

  const getThemeLabel = (t: PaletteTheme) => {
    switch (t) {
      case 'abyss': return 'Abyss'
      case 'crimson': return 'Neon'
      case 'matrix': return 'Matrix'
      case 'oled': return 'OLED'
    }
  }

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { label: 'Analyzer', path: '/analyze', icon: <Scan size={16} /> },
    { label: 'Live Monitor', path: '/monitor', icon: <Radio size={16} /> },
    { label: 'Benchmarks', path: '/evaluation', icon: <BarChart3 size={16} /> },
    { label: 'Evidence Locker', path: '/dashboard', icon: <FolderArchive size={16} /> },
    { label: 'Architecture', path: '/methodology', icon: <Cpu size={16} /> },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl transition-all duration-200 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 group text-decoration-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-[1.5px] shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 ring-1 ring-emerald-500/50" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                PULSE<span className="text-cyan-400">VEIN</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                FORENSIC AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/[0.06]">
            {navItems.map(item => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span className={active ? 'text-cyan-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Live System Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-medium shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              title={`Switch Theme (Current: ${getThemeLabel(currentTheme)})`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white font-mono text-xs transition shadow-sm"
            >
              <Palette size={14} className="text-cyan-400" />
              <span className="text-[11px] font-medium">{getThemeLabel(currentTheme)}</span>
            </button>

            {/* User Authentication Actions */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/settings"
                  className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white transition shadow-sm"
                  title="Settings & API"
                >
                  <Sliders size={15} />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition shadow-sm"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-sans font-bold text-xs shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition duration-150"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu & Theme Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.08] text-slate-300"
              title="Switch Theme"
            >
              <Palette size={16} className="text-cyan-400" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.08] text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PIPELINE ONLINE</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">v2.2.0</span>
          </div>

          {navItems.map(item => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-mono font-medium transition ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <span className={active ? 'text-cyan-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}

          <div className="pt-3 border-t border-white/[0.08]">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-300 font-mono text-xs flex items-center justify-center gap-2"
                >
                  <Sliders size={15} />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs flex items-center justify-center gap-2"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-center text-xs flex items-center justify-center shadow-md shadow-cyan-500/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
