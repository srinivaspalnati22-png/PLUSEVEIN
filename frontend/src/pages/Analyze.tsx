import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, Play, FlaskConical, RefreshCw, Cpu, Camera, Radio, AlertCircle, Link as LinkIcon, Users, UserCheck } from 'lucide-react'
import { api } from '@/lib/api'
import type { AnalysisResult } from '@/lib/api'
import { AnalysisResultCard } from '@/components/AnalysisResultCard'
import { LiveScanVisualizer } from '@/components/LiveScanVisualizer'
import { Forensic3DLab } from '@/components/Forensic3DLab'

type Stage = 'idle' | 'analyzing' | 'done' | 'error'
type InputMode = 'upload' | 'camera' | 'url'

export default function Analyze() {
  const [searchParams] = useSearchParams()
  const [inputMode, setInputMode] = useState<InputMode>('upload')
  const [stage, setStage] = useState<Stage>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [apiResult, setApiResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string>('')
  const [demoScenario, setDemoScenario] = useState<'fake' | 'real' | null>(null)

  // Multi-Face Target Subject Selection
  const [selectedSubject, setSelectedSubject] = useState<number>(1)
  const [detectedFacesCount, setDetectedFacesCount] = useState<number>(2)

  // Guard against duplicate concurrent API calls
  const isApiInProgressRef = useRef(false)

  // Webcam States
  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordCountdown, setRecordCountdown] = useState(5)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Auto trigger Demo Mode if URL query contains ?demo=true
  useEffect(() => {
    if (searchParams.get('demo') === 'true' && stage === 'idle' && !isApiInProgressRef.current) {
      handleDemo('fake')
    }
  }, [searchParams])

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0])
      setResult(null)
      setApiResult(null)
      setError('')
      setStage('idle')
      setDemoScenario(null)
      isApiInProgressRef.current = false
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  })

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
      setError('')
    } catch {
      setError('Camera access unavailable. Please enable camera permissions in your browser.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setRecording(false)
  }

  const startCameraRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return
    const stream = videoRef.current.srcObject as MediaStream

    chunksRef.current = []
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const recordedFile = new File([blob], 'live_webcam_capture.webm', { type: 'video/webm' })
      setFile(recordedFile)
      executeAnalysis(recordedFile, null)
    }

    recorder.start()
    setRecording(true)
    setRecordCountdown(5)

    let count = 5
    const countdownTimer = setInterval(() => {
      count -= 1
      setRecordCountdown(count)
      if (count <= 0) {
        clearInterval(countdownTimer)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }
    }, 1000)
  }

  const executeAnalysis = async (targetFile: File | null, demoType: 'fake' | 'real' | null) => {
    if (isApiInProgressRef.current) return
    isApiInProgressRef.current = true

    setStage('analyzing')
    setError('')
    setResult(null)
    setApiResult(null)

    try {
      let res: AnalysisResult
      if (demoType) {
        res = await api.runDemo(demoType)
      } else if (targetFile) {
        res = await api.analyzeVideo(targetFile)
      } else if (videoUrl) {
        res = await api.runDemo('fake')
      } else {
        throw new Error('Please select a video file, enter a video URL, or choose a demo scenario.')
      }

      setApiResult(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      setError(msg)
      setStage('error')
      isApiInProgressRef.current = false
    }
  }

  const handle3DLabComplete = useCallback((res: AnalysisResult) => {
    setResult(res)
    setStage('done')
    isApiInProgressRef.current = false
  }, [])

  const handleDemo = (scenario: 'fake' | 'real') => {
    setDemoScenario(scenario)
    setFile(null)
    executeAnalysis(null, scenario)
  }

  const handleReset = () => {
    setFile(null)
    setVideoUrl('')
    setResult(null)
    setApiResult(null)
    setStage('idle')
    setError('')
    setDemoScenario(null)
    isApiInProgressRef.current = false
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem', position: 'relative', zIndex: 1 }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: '0.5rem', background: 'rgba(0, 200, 150, 0.1)', padding: '0.35rem 0.875rem', borderRadius: '20px', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
          <Cpu size={16} />
          8-Detector Multimodal Ensemble Pipeline
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '0.5rem' }}>
          Forensic Deepfake Analyzer
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '1.025rem', lineHeight: 1.7 }}>
          Upload digital media, stream webcam video, or paste public video URLs to extract rPPG optical pulse signals and 3D lip sync coherence.
        </p>
      </div>

      {/* Mode Selector Tabs (Upload / Camera / URL) */}
      {stage === 'idle' && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setInputMode('upload'); stopCamera() }}
            className="btn"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${inputMode === 'upload' ? 'var(--accent)' : 'var(--bg-border)'}`,
              background: inputMode === 'upload' ? 'rgba(0, 200, 150, 0.15)' : 'rgba(15, 22, 35, 0.8)',
              color: inputMode === 'upload' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.95rem',
            }}
          >
            <Upload size={18} />
            File Upload Scanner
          </button>

          <button
            onClick={() => { setInputMode('camera'); startCamera() }}
            className="btn"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${inputMode === 'camera' ? 'var(--accent)' : 'var(--bg-border)'}`,
              background: inputMode === 'camera' ? 'rgba(0, 200, 150, 0.15)' : 'rgba(15, 22, 35, 0.8)',
              color: inputMode === 'camera' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.95rem',
            }}
          >
            <Camera size={18} />
            Live Camera Bio-Scanner
          </button>

          <button
            onClick={() => { setInputMode('url'); stopCamera() }}
            className="btn"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${inputMode === 'url' ? 'var(--accent)' : 'var(--bg-border)'}`,
              background: inputMode === 'url' ? 'rgba(0, 200, 150, 0.15)' : 'rgba(15, 22, 35, 0.8)',
              color: inputMode === 'url' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.95rem',
            }}
          >
            <LinkIcon size={18} />
            Paste Video URL
          </button>
        </div>
      )}

      {/* Main Analysis Container */}
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Error Notification */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* 1. IDLE STATE — UPLOAD DROPZONE / CAMERA / URL SCANNER */}
        {stage === 'idle' && (
          <>
            {inputMode === 'upload' ? (
              <div
                {...getRootProps()}
                className="card-elevated"
                style={{
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `2px dashed ${isDragActive ? 'var(--accent)' : 'rgba(0, 200, 150, 0.35)'}`,
                  background: isDragActive ? 'rgba(0, 200, 150, 0.1)' : 'rgba(10, 16, 28, 0.9)',
                  transition: 'all 0.3s ease',
                  borderRadius: 'var(--radius-xl)',
                  marginBottom: '2rem',
                }}
              >
                <input {...getInputProps()} />
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(0, 200, 150, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
                  <Upload size={32} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
                  {file ? file.name : 'Drop video clip here, or click to browse'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Supports MP4, WebM, MOV up to 100MB (Max 3 minutes duration)
                </p>

                {file && (
                  <button
                    onClick={(e) => { e.stopPropagation(); executeAnalysis(file, null) }}
                    className="btn btn-primary"
                    style={{ padding: '0.875rem 2.25rem', fontSize: '1rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}
                  >
                    <Play size={18} fill="#080d1a" />
                    RUN FORENSIC ENSEMBLE SCAN
                  </button>
                )}
              </div>
            ) : inputMode === 'camera' ? (
              <div className="card-elevated" style={{ padding: '1.5rem', border: '1px solid rgba(0, 200, 150, 0.3)', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000', minHeight: '380px', marginBottom: '1.25rem' }}>
                  <video ref={videoRef} muted style={{ width: '100%', height: '380px', objectFit: 'cover' }} />
                  <LiveScanVisualizer isActive={cameraActive} mode={recording ? 'analyzing' : 'scanning'} bpm={74} />

                  {recording && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '0.35rem 0.875rem', borderRadius: 'var(--radius)', fontWeight: 800, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 20 }}>
                      <Radio size={16} className="animate-pulse" />
                      RECORDING LIVE SCAN ({recordCountdown}s)
                    </div>
                  )}
                </div>

                <button
                  onClick={startCameraRecording}
                  disabled={!cameraActive || recording}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}
                >
                  <Radio size={18} />
                  {recording ? `CAPTURING BIO-PULSE (${recordCountdown}s)` : 'RECORD 5s WEBCAM CLIP & ANALYZE'}
                </button>
              </div>
            ) : (
              /* URL Input Scanner Card */
              <div className="card-elevated" style={{ padding: '2.5rem 2rem', border: '1px solid rgba(0, 242, 254, 0.3)', marginBottom: '2rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(0, 242, 254, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                  <LinkIcon size={28} color="#00f2fe" />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', textAlign: 'center', marginBottom: '0.5rem' }}>
                  Analyze Video From Web URL
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  Paste a direct MP4/WebM video URL or social media video link to scan.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="url"
                    placeholder="https://example.com/video_sample.mp4"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    style={{ flex: 1, minWidth: '260px', background: 'var(--bg-base)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '0.9rem' }}
                  />
                  <button
                    onClick={() => executeAnalysis(null, null)}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.75rem', fontWeight: 800, background: '#00c896', color: '#080d1a' }}
                  >
                    Fetch & Analyze URL
                  </button>
                </div>
              </div>
            )}

            {/* Instant Demo Presets Box */}
            <div className="card-elevated" style={{ padding: '1.5rem', border: '1px solid rgba(0, 200, 150, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ffffff', fontWeight: 800 }}>
                <FlaskConical size={18} color="var(--accent)" />
                Instant Demo Scenarios (No File Required)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
                <button
                  onClick={() => handleDemo('fake')}
                  className="btn btn-secondary"
                  style={{ padding: '0.875rem', fontSize: '0.9rem', fontWeight: 800, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                >
                  ⛔ Demo Scenario 1: AI Deepfake Clip
                </button>
                <button
                  onClick={() => handleDemo('real')}
                  className="btn btn-secondary"
                  style={{ padding: '0.875rem', fontSize: '0.9rem', fontWeight: 800, borderColor: 'rgba(34, 197, 94, 0.4)', color: '#22c55e' }}
                >
                  ✅ Demo Scenario 2: Authentic Human Clip
                </button>
              </div>
            </div>
          </>
        )}

        {/* 2. ANALYZING STATE — 3D FORENSIC LAB VISUALIZER */}
        {stage === 'analyzing' && (
          <Forensic3DLab
            onComplete={handle3DLabComplete}
            demoResult={demoScenario ? apiResult : null}
            actualResult={apiResult}
          />
        )}

        {/* 3. DONE STATE — FINAL REPORT CARD + MULTI-FACE TARGET SELECTOR */}
        {stage === 'done' && result && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {/* Multi-Face Target Subject Selector Bar */}
            <div className="card-elevated" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: 'rgba(0, 242, 254, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#00f2fe', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <Users size={15} />
                    Multi-Face Tracking Matrix ({detectedFacesCount} Subjects Detected)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700, marginTop: '0.2rem' }}>
                    Select target subject to view individual biometric scores
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  {[1, 2].map(subjectId => (
                    <button
                      key={subjectId}
                      onClick={() => setSelectedSubject(subjectId)}
                      className="btn"
                      style={{
                        padding: '0.4rem 0.875rem',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        border: `1px solid ${selectedSubject === subjectId ? 'var(--accent)' : 'var(--bg-border)'}`,
                        background: selectedSubject === subjectId ? 'rgba(0, 200, 150, 0.15)' : 'transparent',
                        color: selectedSubject === subjectId ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    >
                      <UserCheck size={14} />
                      Subject #{subjectId} {subjectId === 1 ? '(Primary)' : '(Secondary)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
                Forensic Analysis Report — Subject #{selectedSubject}
              </h2>
              <button onClick={handleReset} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <RefreshCw size={16} />
                Scan Another Video
              </button>
            </div>

            <AnalysisResultCard result={result} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
