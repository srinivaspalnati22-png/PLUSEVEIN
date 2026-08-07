import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="waveform-bar"
              style={{ animationDelay: `${i * 0.15}s`, height: '16px' }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}
