import { getAssetUrl } from '@/lib/assets'

export function BackgroundVideo() {
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
      {/* Full Cover Stable Background Video (No whole video rotation) */}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          opacity: 0.55,
          filter: 'brightness(1.1) contrast(1.25) saturate(1.8)',
        }}
      >
        <video
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
          background: 'radial-gradient(circle at center, rgba(8, 13, 26, 0.5) 0%, rgba(8, 13, 26, 0.88) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
