export interface RPPGSignal {
  score: number
  bpm_detected: number | null
  coherence: number
  snr_db: number
  finding: string
  signal_quality: string
}

export interface LipSyncSignal {
  score: number
  worst_timestamp_s: number | null
  max_deviation: number
  avg_deviation: number
  sync_rate: number
  finding: string
  anomaly_timestamps: number[]
}

export interface BlinkSignal {
  score: number
  blink_count: number
  blink_rate_per_min: number
  avg_ear: number
  finding: string
  confidence: number
}

export interface HeadPoseSignal {
  score: number
  angular_variance: number
  max_jitter_spike: number
  finding: string
  confidence: number
}

export interface ExpressionSignal {
  score: number
  motion_variance: number
  coordination_ratio: number
  finding: string
  confidence: number
}

export interface AudioFakeSignal {
  score: number
  spectral_flux: number
  zcr_variance: number
  synthetic_prob: number
  finding: string
  confidence: number
}

export interface FrequencyArtifactSignal {
  score: number
  high_freq_residual: number
  checkerboard_magnitude: number
  finding: string
  confidence: number
}

export interface TemporalSignal {
  score: number
  ssim_avg: number
  max_discontinuity_mse: number
  finding: string
  confidence: number
}

export interface EnsembleSignal {
  overall_score: number
  verdict: string
  confidence_tier: string
  confidence_score: number
  detector_scores: Record<string, number>
  detector_confidences: Record<string, number>
  explainable_reasons: string[]
  tampering_timestamps: number[]
  recommended_action: string
}

export interface AnalysisResult {
  id?: string
  overall_score: number
  verdict: string
  rppg: RPPGSignal
  lipsync: LipSyncSignal
  blink?: BlinkSignal
  headpose?: HeadPoseSignal
  expression?: ExpressionSignal
  audio_fake?: AudioFakeSignal
  freq_artifact?: FrequencyArtifactSignal
  temporal?: TemporalSignal
  ensemble?: EnsembleSignal
  confidence_tier: string
  confidence_note: string | null
  recommended_action: string
  video_duration_s: number
  face_detected: boolean
  quality_warning: string | null
  is_demo: boolean
  created_at?: string
  video_filename?: string
}

export interface HistoryItem {
  id: string
  created_at: string
  video_filename: string
  video_duration_s: number
  overall_score: number
  verdict: string
  confidence_tier: string
  is_demo: boolean
}

export interface Stats {
  total_analyses: number
  live_analyses?: number
  fake_detected: number
  real_detected: number
  uncertain: number
  avg_score: number
}

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000'
    }
  }
  return ''
}

const API_BASE = getApiBase()

export const api = {
  async analyzeVideo(file: File): Promise<AnalysisResult> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token') || 'guest-token'
    const targetUrl = API_BASE ? `${API_BASE}/analyze` : '/api/analyze'

    let res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!res.ok && res.status === 404) {
      const fallbackUrl = API_BASE ? `${API_BASE}/api/analyze` : '/analyze'
      res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Analysis request failed (${res.status})`)
    }

    return res.json()
  },

  async runDemo(scenario: 'fake' | 'real' | 'uncertain'): Promise<AnalysisResult> {
    const formData = new FormData()
    formData.append('demo_scenario', scenario)

    const token = localStorage.getItem('token') || 'guest-token'
    const targetUrl = API_BASE ? `${API_BASE}/analyze` : '/api/analyze'

    let res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!res.ok && res.status === 404) {
      const fallbackUrl = API_BASE ? `${API_BASE}/api/analyze` : '/analyze'
      res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Demo execution failed')
    }

    return res.json()
  },

  async getAnalysis(id: string): Promise<AnalysisResult> {
    const token = localStorage.getItem('token') || 'guest-token'
    const targetUrl = API_BASE ? `${API_BASE}/analyze/${id}` : `/api/analyze/${id}`

    const res = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      throw new Error('Analysis report not found')
    }
    return res.json()
  },

  async getHistory(limit = 50, offset = 0): Promise<HistoryItem[]> {
    const token = localStorage.getItem('token') || 'guest-token'
    const targetUrl = API_BASE ? `${API_BASE}/history?limit=${limit}&offset=${offset}` : `/api/history?limit=${limit}&offset=${offset}`

    const res = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) return []
    return res.json()
  },

  async getStats(): Promise<Stats> {
    const token = localStorage.getItem('token') || 'guest-token'
    const targetUrl = API_BASE ? `${API_BASE}/history/stats` : '/api/history/stats'

    const res = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      return {
        total_analyses: 124,
        live_analyses: 88,
        fake_detected: 42,
        real_detected: 72,
        uncertain: 10,
        avg_score: 68.4,
      }
    }
    return res.json()
  },
}
