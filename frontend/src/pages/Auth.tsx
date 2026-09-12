import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Database } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { GoogleIcon } from '@/components/GoogleIcon'

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle, signInAsGuest, loading, authError, clearAuthError } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Already logged in → redirect to dashboard
  if (!loading && user) return <Navigate to="/dashboard" replace />

  const handleGoogleSignIn = async () => {
    setError('')
    setSuccessMsg('')
    clearAuthError()
    setGoogleSubmitting(true)
    try {
      const redirectUrl = `${window.location.origin}/dashboard`
      const { error: oauthError } = await signInWithGoogle(redirectUrl)
      if (oauthError) {
        setError(oauthError.message || 'Failed to initialize Google Sign-In.')
        setGoogleSubmitting(false)
      }
      // Note: If successful, browser will redirect to Google authentication screen
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Google Sign-In.')
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
    clearAuthError()
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

  const activeError = error || authError

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
          {/* Supabase Connection Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.75rem',
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
              <Database size={13} color="var(--cyan)" />
              Supabase Auth
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              wxucgspsyekiwbxjjrnw
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(3, 7, 18, 0.8)', padding: '0.35rem', borderRadius: 'var(--radius)', marginBottom: '1.75rem', border: '1px solid var(--bg-border)' }}>
            <button
              onClick={() => { setTab('login'); setError(''); clearAuthError() }}
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
              onClick={() => { setTab('signup'); setError(''); clearAuthError() }}
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

          {/* Social Sign-In Button (Direct Supabase Google OAuth) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleSubmitting}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.925rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: googleSubmitting ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              color: '#ffffff',
            }}
          >
            <GoogleIcon size={19} />
            {googleSubmitting ? 'Connecting to Google OAuth...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
            <span>or use email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bg-border)' }} />
          </div>

          {/* Alert Messages */}
          {activeError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, wordBreak: 'break-word' }}>{activeError}</div>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
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
              <ShieldCheck size={16} />
              Instant Analyst Access (One-Click Bypass)
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
