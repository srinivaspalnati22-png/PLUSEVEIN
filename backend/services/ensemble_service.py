"""
Ensemble Decision Layer Service.

Combines all 8 independent detector outputs:
  1. rPPG Blood Flow Pulse (Weight: 0.25)
  2. Audio-Visual Lip-Sync DSP (Weight: 0.20)
  3. Eye Blink EAR Analysis (Weight: 0.12)
  4. Head Pose 3D Stability (Weight: 0.10)
  5. Facial Micro-Expressions (Weight: 0.10)
  6. Audio Synthetic Vocoder (Weight: 0.10)
  7. Spatial 2D FFT Frequency Artifacts (Weight: 0.08)
  8. Temporal Frame Continuity (Weight: 0.05)

Applies dynamic confidence-weighted ensemble fusion and biological veto constraints to eliminate false positives.
Generates detector-wise breakdown, Explainable AI reasons list, and tampering timeline timestamp markers.
"""
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any

from services.rppg_service import RPPGResult
from services.lipsync_service import LipSyncResult
from services.blink_service import BlinkResult
from services.headpose_service import HeadPoseResult
from services.expression_service import ExpressionResult
from services.audio_fake_service import AudioFakeResult
from services.frequency_artifact_service import FrequencyArtifactResult
from services.temporal_service import TemporalResult


@dataclass
class EnsembleResult:
    overall_score: int                  # 0–100 (calibrated reality score)
    verdict: str                        # REAL / LIKELY REAL / UNCERTAIN / LIKELY FAKE / FAKE
    confidence_tier: str                # high / medium / low
    confidence_score: float             # Calibrated ensemble confidence 0–1
    detector_scores: Dict[str, int]     # Detector-wise 0–100 scores
    detector_confidences: Dict[str, float] # Detector-wise confidence weights
    explainable_reasons: List[str]      # Plain-English evidence points
    tampering_timestamps: List[float]   # Timestamp markers where manipulation occurred
    recommended_action: str


def fuse_ensemble_predictions(
    rppg: RPPGResult,
    lipsync: LipSyncResult,
    blink: BlinkResult,
    headpose: HeadPoseResult,
    expression: ExpressionResult,
    audio_fake: AudioFakeResult,
    freq_artifact: FrequencyArtifactResult,
    temporal: TemporalResult,
) -> EnsembleResult:
    """
    Combine 8 forensic detector outputs using confidence-weighted ensemble fusion & biological veto rules.
    """
    detectors = [
        ("rppg", rppg.score, 0.25, rppg.signal_quality != "poor", rppg.finding),
        ("lipsync", lipsync.score, 0.20, lipsync.sync_rate > 0.3, lipsync.finding),
        ("blink", blink.score, 0.12, blink.confidence > 0.5, blink.finding),
        ("headpose", headpose.score, 0.10, headpose.confidence > 0.5, headpose.finding),
        ("expression", expression.score, 0.10, expression.confidence > 0.5, expression.finding),
        ("audio_fake", audio_fake.score, 0.10, audio_fake.confidence > 0.5, audio_fake.finding),
        ("frequency_artifact", freq_artifact.score, 0.08, freq_artifact.confidence > 0.5, freq_artifact.finding),
        ("temporal", temporal.score, 0.05, temporal.confidence > 0.5, temporal.finding),
    ]

    detector_scores = {}
    detector_confidences = {}
    explainable_reasons = []

    weighted_sum = 0.0
    weight_total = 0.0

    for name, score, base_weight, is_valid, finding in detectors:
        conf = 0.90 if is_valid else 0.50
        effective_weight = base_weight * conf

        weighted_sum += score * effective_weight
        weight_total += effective_weight

        detector_scores[name] = score
        detector_confidences[name] = round(conf, 2)

        # Highlight failing or strong evidence
        if score < 42:
            explainable_reasons.append(f"⛔ {name.upper()}: {finding}")
        elif score >= 70:
            explainable_reasons.append(f"✅ {name.upper()}: {finding}")

    raw_score = weighted_sum / weight_total if weight_total > 0 else 50.0

    # Multi-Signal Biological Veto Rule:
    # Trigger biological veto ONLY if at least 2 primary biological markers flag synthetic patterns (< 28).
    # This prevents single-detector noise (e.g. silent webcam clip or low lighting) from falsely flagging real humans.
    failing_primaries = sum([
        1 if rppg.score < 28 else 0,
        1 if lipsync.score < 28 and lipsync.sync_rate < 0.3 else 0,
        1 if freq_artifact.score < 25 else 0,
    ])
    if failing_primaries >= 2:
        raw_score = min(raw_score, min(35.0, float(rppg.score + lipsync.score + freq_artifact.score) / 3.0))

    overall_score = int(max(0, min(100, raw_score)))

    # Gather tampering timestamps from desync anomalies & temporal gaps
    tampering_timestamps = sorted(list(set(
        lipsync.anomaly_timestamps +
        ([lipsync.worst_timestamp_s] if lipsync.worst_timestamp_s else [])
    )))

    # Calibrated Verdict
    if overall_score >= 75:
        verdict = "REAL"
        confidence_tier = "high"
        action = "No immediate concern. Standard biological verification practice confirms authentic human video."
    elif overall_score >= 60:
        verdict = "LIKELY REAL"
        confidence_tier = "medium"
        action = "Content appears authentic. If high-stakes, consider cross-referencing with original source."
    elif overall_score >= 42:
        verdict = "UNCERTAIN"
        confidence_tier = "medium"
        action = "Signals are inconclusive. Do not act on this content without additional verification."
    elif overall_score >= 25:
        verdict = "LIKELY FAKE"
        confidence_tier = "high"
        action = "Strong indicators of AI manipulation detected across multiple forensic signals."
    else:
        verdict = "FAKE"
        confidence_tier = "high"
        action = "Very high probability of deepfake or AI-generated video. Biological pulse and spectral markers failed."

    ensemble_confidence = round(min(0.98, max(0.60, weight_total)), 2)

    return EnsembleResult(
        overall_score=overall_score,
        verdict=verdict,
        confidence_tier=confidence_tier,
        confidence_score=ensemble_confidence,
        detector_scores=detector_scores,
        detector_confidences=detector_confidences,
        explainable_reasons=explainable_reasons[:8],
        tampering_timestamps=tampering_timestamps[:10],
        recommended_action=action,
    )
