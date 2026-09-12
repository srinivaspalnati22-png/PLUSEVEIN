import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  authError: string | null
  clearAuthError: () => void
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signInWithGoogle: (customRedirect?: string) => Promise<{ error: Error | null }>
  signInWithGoogleOAuth: (customRedirect?: string) => Promise<{ error: Error | null }>
  signInAsGuest: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function createMockGuestUser(email: string, name: string): User {
  return {
    id: `guest-user-${Date.now()}`,
    app_metadata: { provider: 'guest', providers: ['guest'] },
    user_metadata: {
      full_name: name,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    aud: 'authenticated',
    confirmation_sent_at: new Date().toISOString(),
    recovery_sent_at: '',
    email_change_sent_at: '',
    new_email: '',
    new_phone: '',
    invited_at: '',
    action_link: '',
    email,
    phone: '',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: '',
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
    identities: [],
    factors: [],
  }
}

function createMockGuestSession(user: User): Session {
  return {
    access_token: `guest-access-token-${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'guest-refresh-token',
    user,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const clearAuthError = () => setAuthError(null)

  useEffect(() => {
    // 1. Check for OAuth callback errors in URL query or hash fragment
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash
      const hashParams = new URLSearchParams(hash)

      const errorDescription =
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error')

      if (errorDescription) {
        const decoded = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        setAuthError(decoded)
        // Clean URL to avoid persisting error params in browser address bar
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch {
      // Ignore URL parsing errors
    }

    // 2. Fetch active Supabase session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          localStorage.removeItem('pulsevein_guest_session')
          localStorage.removeItem('pulsevein_google_session')
          setSession(session)
          setUser(session.user)
        } else {
          // If no active Supabase session, check for offline guest session
          const savedGuest = localStorage.getItem('pulsevein_guest_session')
          if (savedGuest) {
            try {
              const parsed = JSON.parse(savedGuest) as { user: User; session: Session }
              setUser(parsed.user)
              setSession(parsed.session)
            } catch {
              localStorage.removeItem('pulsevein_guest_session')
            }
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.warn('[PULSEVEIN Auth] getSession error:', err)
        setLoading(false)
      })

    // 3. Listen for Supabase auth state changes (crucial for Google OAuth redirect callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        localStorage.removeItem('pulsevein_guest_session')
        localStorage.removeItem('pulsevein_google_session')
        setSession(newSession)
        setUser(newSession.user)
        setAuthError(null)
      } else if (!localStorage.getItem('pulsevein_guest_session')) {
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    localStorage.removeItem('pulsevein_guest_session')
    localStorage.removeItem('pulsevein_google_session')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.session) {
      setSession(data.session)
      setUser(data.user)
    }
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    })
    return { error: error as Error | null }
  }

  /**
   * Real Supabase Google OAuth Provider Authentication
   * Redirects user to Google OAuth consent page and lands back on application dashboard.
   */
  const signInWithGoogle = async (customRedirect?: string) => {
    try {
      localStorage.removeItem('pulsevein_guest_session')
      localStorage.removeItem('pulsevein_google_session')
      setAuthError(null)

      const origin = window.location.origin
      const base = import.meta.env.BASE_URL || '/'
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
      const targetRedirect = customRedirect || `${origin}${cleanBase}/dashboard`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        setAuthError(error.message)
        return { error: error as Error }
      }
      return { error: null }
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setAuthError(errorObj.message)
      return { error: errorObj }
    }
  }

  // Alias for backward compatibility
  const signInWithGoogleOAuth = signInWithGoogle

  const signInAsGuest = async () => {
    localStorage.removeItem('pulsevein_google_session')
    const guestUser = createMockGuestUser('forensic.analyst@pulsevein.ai', 'Lead Forensic Investigator')
    const guestSession = createMockGuestSession(guestUser)
    localStorage.setItem(
      'pulsevein_guest_session',
      JSON.stringify({ user: guestUser, session: guestSession })
    )
    setUser(guestUser)
    setSession(guestSession)
    setAuthError(null)
  }

  const signOut = async () => {
    localStorage.removeItem('pulsevein_guest_session')
    localStorage.removeItem('pulsevein_google_session')
    setUser(null)
    setSession(null)
    setAuthError(null)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authError,
        clearAuthError,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGoogleOAuth,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
