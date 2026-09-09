from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class MediaQualityModel(BaseModel):
    composite_score: int
    quality_tier: str # EXCELLENT | GOOD | FAIR | POOR | CRITICAL
    resolution_label: str
    width: int
    height: int
    fps: float
    duration_s: float
    face_coverage_ratio: float
    face_detected_ratio: float
    illumination_brightness: float
    illumination_contrast: float
    motion_stability_score: float
    guidance: List[str] = []


class RPPGSignal(BaseModel):
    score: int
    bpm_detected: Optional[float] = None
    coherence: float
    snr_db: float
    finding: str
    signal_quality: str
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class LipSyncSignal(BaseModel):
    score: int
    worst_timestamp_s: Optional[float] = None
    max_deviation: float
    avg_deviation: float
    sync_rate: float
    finding: str
    anomaly_timestamps: List[float] = []
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class BlinkSignal(BaseModel):
    score: int
    blink_count: int
    blink_rate_per_min: float
    avg_ear: float
    finding: str
    confidence: float
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class HeadPoseSignal(BaseModel):
    score: int
    angular_variance: float
    max_jitter_spike: float
    finding: str
    confidence: float
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class ExpressionSignal(BaseModel):
    score: int
    motion_variance: float
    coordination_ratio: float
    finding: str
    confidence: float
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class AudioFakeSignal(BaseModel):
    score: int
    spectral_flux: float
    zcr_variance: float
    synthetic_prob: float
    finding: str
    confidence: float
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class FrequencyArtifactSignal(BaseModel):
    score: int
    high_freq_residual: float
    checkerboard_magnitude: float
    finding: str
    confidence: float
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class TemporalSignal(BaseModel):
    score: int
    ssim_avg: float
    max_discontinuity_mse: float
    finding: str
    confidence: float
    status: Optional[str] = "supporting_authenticity"
    quality: Optional[str] = "GOOD"
    evidence: Optional[Dict[str, Any]] = None


class EnsembleSignal(BaseModel):
    overall_score: int
    verdict: str
    confidence_tier: str
    confidence_score: float
    analysis_quality: int = 80
    authenticity_probability: float = 0.50
    detector_agreement_ratio: float = 0.50
    detector_consensus_status: str = "MODERATE_CONSENSUS"
    detector_scores: Dict[str, int] = {}
    detector_confidences: Dict[str, float] = {}
    detector_statuses: Dict[str, str] = {}
    explainable_reasons: List[str] = []
    inconclusive_reasons: List[str] = []
    tampering_timestamps: List[float] = []
    recommended_action: str = ""
    evidence_matrix: List[Dict[str, Any]] = []


class TimelineSegment(BaseModel):
    segment_index: int
    start_time_s: float
    end_time_s: float
    authenticity_score: int
    risk_level: str # LOW | MEDIUM | HIGH
    flags: List[str] = []


class ExperimentalBiometrics(BaseModel):
    disclaimer: str = "RESEARCH DEMONSTRATION ONLY: Not a medical diagnostic device or certified biometric identifier."
    blood_pressure_estimate: Optional[str] = None
    demographic_gender_estimate: Optional[str] = None
    excluded_from_authenticity: bool = True


class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    overall_score: int # 0–100 authenticity score
    authenticity_probability: float = 0.50 # 0.00–1.00
    verdict: str # LIKELY AUTHENTIC | LIKELY MANIPULATED | INCONCLUSIVE
    confidence_tier: str # high | medium | low
    confidence_score: float = 0.80 # 0.00–1.00
    analysis_quality: int = 80 # 0–100 media quality
    detector_agreement_ratio: float = 0.80
    detector_consensus_status: str = "STRONG_CONSENSUS"
    
    # Forensic Detector signals
    rppg: RPPGSignal
    lipsync: LipSyncSignal
    blink: Optional[BlinkSignal] = None
    headpose: Optional[HeadPoseSignal] = None
    expression: Optional[ExpressionSignal] = None
    audio_fake: Optional[AudioFakeSignal] = None
    freq_artifact: Optional[FrequencyArtifactSignal] = None
    temporal: Optional[TemporalSignal] = None
    ensemble: Optional[EnsembleSignal] = None
    
    # Detailed Evidence & Explainability
    evidence_matrix: List[Dict[str, Any]] = []
    explainable_reasons: List[str] = []
    inconclusive_reasons: List[str] = []
    timeline_segments: List[TimelineSegment] = []
    tampering_timestamps: List[float] = []
    
    # Metadata & Quality
    media_quality: Optional[MediaQualityModel] = None
    confidence_note: Optional[str] = None
    recommended_action: str
    video_duration_s: float
    face_detected: bool
    quality_warning: Optional[str] = None
    sha256_hash: Optional[str] = None
    engine_version: str = "v2.2.0"
    forensic_disclaimer: str = "Probabilistic forensic estimate based on multimodal AI detectors. Not legally binding or definitive proof of authenticity."
    experimental_biometrics: Optional[ExperimentalBiometrics] = None
    
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
