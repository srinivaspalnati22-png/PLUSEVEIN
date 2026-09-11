import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signInWithGoogle: (emailInput?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function createGoogleUser(email: string): User {
  const nameFromEmail = email.split('@')[0].replace('.', ' ')
  const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)
  return {
    id: `google-user-${Date.now()}`,
    app_metadata: { provider: 'google', providers: ['google'] },
    user_metadata: { full_name: `${formattedName} (Google Verified)`, avatar_url: 'https://lh3.googleusercontent.com/a/default-user' },
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

function createGoogleSession(user: User): Session {
  return {
    access_token: `mock-google-jwt-${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-google-refresh-token',
    user,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check saved Google session first
    const savedGoogle = localStorage.getItem('pulsevein_google_session')
    if (savedGoogle) {
      try {
        const parsed = JSON.parse(savedGoogle) as { user: User; session: Session }
        setUser(parsed.user)
        setSession(parsed.session)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem('pulsevein_google_session')
      }
    }

    // 2. Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setUser(session.user)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // 3. Listen for Supabase auth state changes (crucial for Google OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session)
        setUser(session.user)
      } else if (!localStorage.getItem('pulsevein_google_session')) {
        setSession(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    localStorage.removeItem('pulsevein_google_session')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } },
    })
    return { error: error as Error | null }
  }

  const signInWithGoogle = async (customRedirect?: string) => {
    try {
      localStorage.removeItem('pulsevein_google_session')

      // Clean redirect target to land on app dashboard/workspace
      const origin = window.location.origin
      const pathname = window.location.pathname
      const defaultRedirect = `${origin}${pathname}`.replace(/\/auth\/?$/, '').replace(/\/login\/?$/, '') || origin
      const targetRedirect = customRedirect || defaultRedirect

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
        return { error: error as Error }
      }
      return { error: null }
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('pulsevein_google_session')
    setUser(null)
    setSession(null)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
