import { useEffect, useRef } from 'react'
import { getAssetUrl } from '@/lib/assets'

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true
      videoRef.current.muted = true
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy handled gracefully
        })
      }
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Full Cover Stable Background Video */}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          opacity: 0.75,
          filter: 'brightness(1.15) contrast(1.2) saturate(1.6)',
        }}
      >
        <video
          ref={videoRef}
          src={getAssetUrl('videos/bg.mp4')}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Cybernetic Contrast Overlay for high text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(3, 7, 18, 0.42) 0%, rgba(3, 7, 18, 0.82) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
