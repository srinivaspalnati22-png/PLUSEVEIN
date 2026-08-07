"""
Demo Mode Service.
Provides preloaded realistic scenarios for presentation fallbacks.
Updated with complete 8-detector Ensemble Forensic results.
"""
from dataclasses import dataclass
from services.rppg_service import RPPGResult
from services.lipsync_service import LipSyncResult
from services.blink_service import BlinkResult
from services.headpose_service import HeadPoseResult
from services.expression_service import ExpressionResult
from services.audio_fake_service import AudioFakeResult
from services.frequency_artifact_service import FrequencyArtifactResult
from services.temporal_service import TemporalResult
from services.ensemble_service import EnsembleResult
from services.ai_service import AnalysisResult


DEMO_SCENARIOS = {
    "fake": AnalysisResult(
        overall_score=18,
        verdict="FAKE",
        rppg=RPPGResult(
            score=12, bpm_detected=None, coherence=0.04, snr_db=-8.2,
            finding="No consistent pulse signal found in facial skin. Sub-surface blood flow is absent or incoherent.",
            signal_quality="poor",
        ),
        lipsync=LipSyncResult(
            score=26, worst_timestamp_s=14.3, max_deviation=0.82, avg_deviation=0.47, sync_rate=0.31,
            finding="Poor lip-sync: 3D mouth aperture landmark #14 desynced from audio RMS energy envelope at 0:14s.",
            anomaly_timestamps=[14.3],
        ),
        blink=BlinkResult(
            score=22, blink_count=0, blink_rate_per_min=0.0, avg_ear=0.28,
            finding="Zero eye blinks detected over 24.0s. Unnatural ocular stasis indicative of synthetic rendering.",
            confidence=0.88,
        ),
        headpose=HeadPoseResult(
            score=24, angular_variance=0.08, max_jitter_spike=24.5,
            finding="Significant 3D head pose angular acceleration spike (24.5°/frame²) detected at face boundary.",
            confidence=0.85,
        ),
        expression=ExpressionResult(
            score=26, motion_variance=0.0003, coordination_ratio=-0.35,
            finding="Facial micro-expression stasis detected: eyebrow and cheek muscle vectors are frozen.",
            confidence=0.82,
        ),
        audio_fake=AudioFakeResult(
            score=20, spectral_flux=0.0008, zcr_variance=0.0003, synthetic_prob=0.88,
            finding="Synthetic vocoder voice clone detected: spectral flux exhibits neural voice synthesis artifacts.",
            confidence=0.88,
        ),
        freq_artifact=FrequencyArtifactResult(
            score=22, high_freq_residual=0.44, checkerboard_magnitude=0.38,
            finding="Generative AI spatial frequency grid artifacts detected (0.38 spectral checkerboard power).",
            confidence=0.86,
        ),
        temporal=TemporalResult(
            score=25, ssim_avg=0.62, max_discontinuity_mse=38.4,
            finding="Severe temporal frame boundary flickering detected (max MSE 38.4).",
            confidence=0.85,
        ),
        ensemble=EnsembleResult(
            overall_score=18, verdict="FAKE", confidence_tier="high", confidence_score=0.92,
            detector_scores={"rppg": 12, "lipsync": 26, "blink": 22, "headpose": 24, "expression": 26, "audio_fake": 20, "frequency_artifact": 22, "temporal": 25},
            detector_confidences={"rppg": 0.9, "lipsync": 0.9, "blink": 0.88, "headpose": 0.85, "expression": 0.82, "audio_fake": 0.88, "frequency_artifact": 0.86, "temporal": 0.85},
            explainable_reasons=[
                "⛔ RPPG: Absent sub-surface green light blood pulse (-8.2 dB SNR)",
                "⛔ LIPSYNC: 142ms mouth aperture vs audio energy desync gap at 0:14s",
                "⛔ BLINK: Zero ocular blinks detected over 24.0 seconds (frozen eyes)",
                "⛔ HEADPOSE: 24.5°/frame² angular acceleration jitter spike",
                "⛔ FREQUENCY: 0.38 spatial 2D FFT upsampling checkerboard grid pattern",
            ],
            tampering_timestamps=[14.3],
            recommended_action="Very high probability of deepfake or AI-generated video. Do not rely on this content.",
        ),
        confidence_tier="high",
        confidence_note=None,
        recommended_action="Very high probability of deepfake or AI-generated video. Do not rely on this content.",
        video_duration_s=24.0,
        face_detected=True,
        quality_warning=None,
        is_demo=True,
    ),
    "real": AnalysisResult(
        overall_score=91,
        verdict="REAL",
        rppg=RPPGResult(
            score=89, bpm_detected=74.2, coherence=0.86, snr_db=12.4,
            finding="Sub-surface arterial blood flow verified at ~74 BPM with 86% spectral coherence.",
            signal_quality="good",
        ),
        lipsync=LipSyncResult(
            score=93, worst_timestamp_s=None, max_deviation=0.12, avg_deviation=0.05, sync_rate=0.97,
            finding="Flawless 3D lip-audio coherence: mouth aperture matches speech envelope in 97% of frames.",
            anomaly_timestamps=[],
        ),
        blink=BlinkResult(
            score=88, blink_count=4, blink_rate_per_min=13.3, avg_ear=0.26,
            finding="Natural ocular dynamics verified: 4 blinks detected (~13.3 blinks/min), consistent with real human eye behavior.",
            confidence=0.90,
        ),
        headpose=HeadPoseResult(
            score=88, angular_variance=1.45, max_jitter_spike=4.2,
            finding="Smooth 3D head pose kinematics verified (max acceleration 4.2°/frame²).",
            confidence=0.88,
        ),
        expression=ExpressionResult(
            score=86, motion_variance=0.024, coordination_ratio=0.82,
            finding="Natural facial micro-expression dynamics verified (coordination ratio 0.82).",
            confidence=0.86,
        ),
        audio_fake=AudioFakeResult(
            score=89, spectral_flux=0.014, zcr_variance=0.0042, synthetic_prob=0.12,
            finding="Authentic vocal acoustics verified: organic spectral flux and harmonic richness detected.",
            confidence=0.86,
        ),
        freq_artifact=FrequencyArtifactResult(
            score=88, high_freq_residual=0.12, checkerboard_magnitude=0.08,
            finding="Natural spatial frequency spectrum verified. Zero upsampling grid artifacts detected.",
            confidence=0.88,
        ),
        temporal=TemporalResult(
            score=89, ssim_avg=0.92, max_discontinuity_mse=5.4,
            finding="Smooth temporal frame continuity verified (SSIM 0.92, max MSE 5.4).",
            confidence=0.88,
        ),
        ensemble=EnsembleResult(
            overall_score=91, verdict="REAL", confidence_tier="high", confidence_score=0.95,
            detector_scores={"rppg": 89, "lipsync": 93, "blink": 88, "headpose": 88, "expression": 86, "audio_fake": 89, "frequency_artifact": 88, "temporal": 89},
            detector_confidences={"rppg": 0.9, "lipsync": 0.9, "blink": 0.9, "headpose": 0.88, "expression": 0.86, "audio_fake": 0.86, "frequency_artifact": 0.88, "temporal": 0.88},
            explainable_reasons=[
                "✅ RPPG: 74 BPM sub-surface blood pulse verified (86% spectral coherence)",
                "✅ LIPSYNC: Flawless 3D lip landmark aperture alignment with audio envelope",
                "✅ BLINK: Natural 13.3 blinks/min ocular frequency",
                "✅ HEADPOSE: Smooth 3D angular head trajectory without boundary jitter",
                "✅ FREQUENCY: Zero 2D FFT upsampling grid artifacts detected",
            ],
            tampering_timestamps=[],
            recommended_action="Video verified authentic human biology.",
        ),
        confidence_tier="high",
        confidence_note=None,
        recommended_action="Video verified authentic human biology.",
        video_duration_s=18.0,
        face_detected=True,
        quality_warning=None,
        is_demo=True,
    ),
}


def get_demo_result(scenario: str = "fake") -> AnalysisResult:
    """Return a preloaded demo scenario."""
    return DEMO_SCENARIOS.get(scenario, DEMO_SCENARIOS["fake"])
