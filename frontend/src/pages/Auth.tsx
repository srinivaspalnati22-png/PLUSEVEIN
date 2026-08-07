import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { GoogleIcon } from '@/components/GoogleIcon'

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Google Account Prompt Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleUserEmail, setGoogleUserEmail] = useState('')
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Already logged in → redirect to dashboard
  if (!loading && user) return <Navigate to="/dashboard" replace />

  const openGoogleModal = () => {
    setError('')
    setShowGoogleModal(true)
  }

  const handleGoogleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleUserEmail || !googleUserEmail.includes('@')) {
      setError('Please enter a valid Google Account email address.')
      return
    }
    setGoogleSubmitting(true)
    try {
      await signInWithGoogle(googleUserEmail)
      setShowGoogleModal(false)
      navigate('/dashboard')
    } catch {
      setError('Google Sign-In failed. Please try again.')
    } finally {
      setGoogleSubmitting(false)
    }
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
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00c896 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 25px rgba(0, 200, 150, 0.4)',
            }}
          >
            <Activity size={26} color="#080d1a" strokeWidth={2.8} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            {tab === 'login' ? 'Sign in to Pulsevein' : 'Create Forensic Account'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Access multimodal deepfake forensic intelligence & history
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-elevated" style={{ padding: '2rem', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '0.25rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid var(--bg-border)' }}>
            <button
              onClick={() => { setTab('login'); setError('') }}
              style={{
                flex: 1,
                padding: '0.625rem',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: tab === 'login' ? 'rgba(0, 200, 150, 0.15)' : 'transparent',
                color: tab === 'login' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError('') }}
              style={{
                flex: 1,
                padding: '0.625rem',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: tab === 'signup' ? 'rgba(0, 200, 150, 0.15)' : 'transparent',
                color: tab === 'signup' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Social Sign-In Button */}
          <button
            onClick={openGoogleModal}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', fontWeight: 700 }}
          >
            <GoogleIcon size={18} />
            Continue with Google
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
          </form>
        </div>

        {/* Google Account Email Input Modal */}
        <AnimatePresence>
          {showGoogleModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
              <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="card-elevated" style={{ width: '100%', maxWidth: '400px', padding: '1.75rem', position: 'relative', border: '1px solid rgba(0, 200, 150, 0.4)' }}>
                <button onClick={() => setShowGoogleModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <GoogleIcon size={24} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>Google Account Sign-In</h3>
                </div>

                <form onSubmit={handleGoogleAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.35rem' }}>Enter Google Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="username@gmail.com"
                      value={googleUserEmail}
                      onChange={e => setGoogleUserEmail(e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.75rem', color: '#ffffff', fontSize: '0.9rem' }}
                    />
                  </div>

                  <button type="submit" disabled={googleSubmitting} className="btn btn-primary" style={{ padding: '0.875rem', fontSize: '0.9rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}>
                    {googleSubmitting ? 'Authenticating...' : 'Sign In with Google Account'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
