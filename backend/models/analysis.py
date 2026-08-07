from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class RPPGSignal(BaseModel):
    score: int
    bpm_detected: Optional[float] = None
    coherence: float
    snr_db: float
    finding: str
    signal_quality: str


class LipSyncSignal(BaseModel):
    score: int
    worst_timestamp_s: Optional[float] = None
    max_deviation: float
    avg_deviation: float
    sync_rate: float
    finding: str
    anomaly_timestamps: List[float] = []


class BlinkSignal(BaseModel):
    score: int
    blink_count: int
    blink_rate_per_min: float
    avg_ear: float
    finding: str
    confidence: float


class HeadPoseSignal(BaseModel):
    score: int
    angular_variance: float
    max_jitter_spike: float
    finding: str
    confidence: float


class ExpressionSignal(BaseModel):
    score: int
    motion_variance: float
    coordination_ratio: float
    finding: str
    confidence: float


class AudioFakeSignal(BaseModel):
    score: int
    spectral_flux: float
    zcr_variance: float
    synthetic_prob: float
    finding: str
    confidence: float


class FrequencyArtifactSignal(BaseModel):
    score: int
    high_freq_residual: float
    checkerboard_magnitude: float
    finding: str
    confidence: float


class TemporalSignal(BaseModel):
    score: int
    ssim_avg: float
    max_discontinuity_mse: float
    finding: str
    confidence: float


class EnsembleSignal(BaseModel):
    overall_score: int
    verdict: str
    confidence_tier: str
    confidence_score: float
    detector_scores: Dict[str, int]
    detector_confidences: Dict[str, float]
    explainable_reasons: List[str] = []
    tampering_timestamps: List[float] = []
    recommended_action: str


class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    overall_score: int
    verdict: str
    rppg: RPPGSignal
    lipsync: LipSyncSignal
    blink: Optional[BlinkSignal] = None
    headpose: Optional[HeadPoseSignal] = None
    expression: Optional[ExpressionSignal] = None
    audio_fake: Optional[AudioFakeSignal] = None
    freq_artifact: Optional[FrequencyArtifactSignal] = None
    temporal: Optional[TemporalSignal] = None
    ensemble: Optional[EnsembleSignal] = None
    confidence_tier: str
    confidence_note: Optional[str] = None
    recommended_action: str
    video_duration_s: float
    face_detected: bool
    quality_warning: Optional[str] = None
    is_demo: bool = False
    created_at: Optional[datetime] = None
    video_filename: Optional[str] = None


class HistoryItem(BaseModel):
    id: str
    overall_score: int
    verdict: str
    confidence_tier: str
    is_demo: bool
    created_at: datetime
    video_filename: Optional[str] = None
    video_duration_s: Optional[float] = None
