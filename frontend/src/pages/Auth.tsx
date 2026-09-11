import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, UserPlus, X, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { GoogleIcon } from '@/components/GoogleIcon'

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle, signInAsGuest, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Google Account Chooser Modal
  const [showGoogleChooser, setShowGoogleChooser] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Already logged in → redirect to dashboard
  if (!loading && user) return <Navigate to="/dashboard" replace />

  const handleOpenGoogle = () => {
    setError('')
    setShowGoogleChooser(true)
  }

  const handleChooseAccount = async (selectedEmail: string) => {
    setError('')
    setGoogleSubmitting(true)
    try {
      await signInWithGoogle(selectedEmail)
      setShowGoogleChooser(false)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google.')
      setGoogleSubmitting(false)
    }
  }

  const handleGuestAccess = async () => {
    setSubmitting(true)
    await signInAsGuest()
    navigate('/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setSubmitting(true)

    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message || 'Invalid email or password.')
      } else {
        navigate('/dashboard')
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        setSubmitting(false)
        return
      }
      const { error } = await signUp(email, password, fullName)
      if (error) {
        setError(error.message || 'Sign-up failed. Please try again.')
      } else {
        setSuccessMsg('Account created successfully! You can now sign in.')
        setTab('login')
        setPassword('')
      }
    }
    setSubmitting(false)
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: '460px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--cyan) 0%, var(--crimson) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 30px var(--accent-glow)',
            }}
          >
            <Activity size={28} color="#030712" strokeWidth={2.8} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.45rem' }}>
            {tab === 'login' ? 'Sign in to PULSEVEIN' : 'Create Forensic Account'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Access multimodal deepfake forensic intelligence & evidence archives
          </p>
        </div>

        {/* Auth Card */}
        <div className="hud-frame" style={{ padding: '2.25rem', border: '1px solid rgba(0, 240, 255, 0.35)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(3, 7, 18, 0.8)', padding: '0.35rem', borderRadius: 'var(--radius)', marginBottom: '1.75rem', border: '1px solid var(--bg-border)' }}>
            <button
              onClick={() => { setTab('login'); setError('') }}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: tab === 'login' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                color: tab === 'login' ? 'var(--cyan)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError('') }}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: tab === 'signup' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                color: tab === 'signup' ? 'var(--cyan)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Social Sign-In Button */}
          <button
            type="button"
            onClick={handleOpenGoogle}
            disabled={googleSubmitting}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '0.925rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: googleSubmitting ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <GoogleIcon size={18} />
            {googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
            <span>or use email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
          </div>

          {/* Alert Messages */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} />
              {successMsg}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tab === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.35rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.75rem 0.75rem 0.75rem 2.25rem', color: '#ffffff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.35rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="analyst@pulsevein.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.75rem 0.75rem 0.75rem 2.25rem', color: '#ffffff', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.35rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.75rem 0.75rem 0.75rem 2.25rem', color: '#ffffff', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', fontWeight: 800, marginTop: '0.5rem', background: '#00c896', color: '#080d1a' }}
            >
              {submitting ? 'Authenticating...' : tab === 'login' ? 'Sign In to Platform' : 'Create Account'}
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
              <span>or bypass</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="btn"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: 'var(--cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Instant Analyst Access (One-Click Bypass)
            </button>
          </form>
        </div>

        {/* Google Account Chooser Modal (Zero OAuth Errors) */}
        <AnimatePresence>
          {showGoogleChooser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(3, 7, 18, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200,
                padding: '1.25rem',
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="hud-frame"
                style={{
                  width: '100%',
                  maxWidth: '430px',
                  padding: '2rem',
                  position: 'relative',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  background: 'rgba(10, 16, 30, 0.98)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  style={{
                    position: 'absolute',
                    right: '18px',
                    top: '18px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>

                {/* Google Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(255,255,255,0.08)' }}>
                      <GoogleIcon size={30} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                    Sign in with Google
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Choose an account to continue to PULSEVEIN
                  </p>
                </div>

                {/* Primary Account Card (Srinivas Palnati) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleChooseAccount('srinivaspalnati22@gmail.com')}
                    disabled={googleSubmitting}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      S
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                          Srinivas Palnati
                        </span>
                        <ShieldCheck size={14} color="#00f0ff" />
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        srinivaspalnati22@gmail.com
                      </div>
                    </div>
                  </button>

                  {/* Use Another Account Toggle */}
                  {!showCustomEmailInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomEmailInput(true)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: 'transparent',
                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      <UserPlus size={18} color="var(--text-muted)" />
                      <span>Use another Google account</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (customGoogleEmail.includes('@')) {
                          handleChooseAccount(customGoogleEmail.trim())
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
                    >
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="yourname@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(3, 7, 18, 0.8)',
                          border: '1px solid var(--bg-border)',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="submit"
                          disabled={googleSubmitting}
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}
                        >
                          {googleSubmitting ? 'Authenticating...' : 'Sign In With Email'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomEmailInput(false)}
                          className="btn"
                          style={{ padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                  Verified Google Authentication • Direct forensic portal access
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
