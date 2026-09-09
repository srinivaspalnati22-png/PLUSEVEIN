"""
Ensemble Decision Layer Service — PULSEVEIN Forensic Engine v2.2.0.

Implements the Hierarchical Decision Pipeline:
  Media Quality -> Signal Validation -> Individual Detectors ->
  Cross-Modal & Agreement Engine -> Calibrated Score & Confidence -> Final Verdict

Verdicts:
  - LIKELY AUTHENTIC (prob >= 0.70, confidence >= 0.60, agreement >= 0.60)
  - LIKELY MANIPULATED (prob <= 0.35, confidence >= 0.60, agreement >= 0.60)
  - INCONCLUSIVE (quality degraded, low confidence, or contradictory detectors)
"""
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

from services.rppg_service import RPPGResult
from services.lipsync_service import LipSyncResult
from services.blink_service import BlinkResult
from services.headpose_service import HeadPoseResult
from services.expression_service import ExpressionResult
from services.audio_fake_service import AudioFakeResult
from services.frequency_artifact_service import FrequencyArtifactResult
from services.temporal_service import TemporalResult
from services.calibration_service import ForensicCalibrator


@dataclass
class EnsembleResult:
    overall_score: int                      # 0–100 (calibrated authenticity percentage)
    authenticity_probability: float         # 0.00–1.00 P(Authentic)
    verdict: str                            # LIKELY AUTHENTIC | LIKELY MANIPULATED | INCONCLUSIVE
    confidence_tier: str                    # high | medium | low
    confidence_score: float                 # 0.00–1.00
    analysis_quality: int                   # 0–100 input media quality
    detector_scores: Dict[str, int]         # Detector-wise 0–100 scores
    detector_confidences: Dict[str, float]  # Detector-wise confidence weights
    detector_statuses: Dict[str, str]       # supporting_authenticity | supporting_manipulation | insufficient_signal
    detector_agreement_ratio: float         # 0.00–1.00
    detector_consensus_status: str          # STRONG_CONSENSUS | MODERATE_CONSENSUS | CONTRADICTORY
    explainable_reasons: List[str]          # Plain-English forensic findings
    inconclusive_reasons: List[str]         # Plain-English explanation when inconclusive
    tampering_timestamps: List[float]       # Specific anomaly timestamps
    recommended_action: str
    evidence_matrix: List[Dict[str, Any]] = field(default_factory=list)


def fuse_ensemble_predictions(
    rppg: RPPGResult,
    lipsync: LipSyncResult,
    blink: BlinkResult,
    headpose: HeadPoseResult,
    expression: ExpressionResult,
    audio_fake: AudioFakeResult,
    freq_artifact: FrequencyArtifactResult,
    temporal: TemporalResult,
    media_quality: int = 80,
    video_duration_s: float = 5.0,
) -> EnsembleResult:
    """
    Combines all forensic detectors through dynamic weight adjustment,
    detector agreement calculation, probability calibration, and hierarchical gating.
    """
    # Raw detector definitions: (name, label, result_object, base_weight, is_primary)
    raw_detectors = [
        ("rppg", "Physiological Blood Flow (rPPG)", rppg, 0.25, True),
        ("lipsync", "Audio-Visual Lip-Sync DSP", lipsync, 0.20, True),
        ("blink", "Eye Blink Dynamics (EAR)", blink, 0.12, False),
        ("headpose", "Head Pose Kinematic Stability", headpose, 0.10, False),
        ("expression", "Facial Micro-Expression Symmetry", expression, 0.10, False),
        ("audio_fake", "Acoustic Vocoder Artifacts", audio_fake, 0.10, False),
        ("frequency_artifact", "Spatial 2D FFT Grid Residuals", freq_artifact, 0.08, True),
        ("temporal", "Temporal Frame Continuity (SSIM)", temporal, 0.05, False),
    ]

    detector_scores: Dict[str, int] = {}
    detector_confidences: Dict[str, float] = {}
    detector_statuses: Dict[str, str] = {}
    evidence_matrix: List[Dict[str, Any]] = []
    explainable_reasons: List[str] = []

    weighted_sum = 0.0
    weight_total = 0.0
    valid_detector_count = 0
    active_scores_for_agreement: Dict[str, int] = {}

    for name, label, res, base_weight, is_primary in raw_detectors:
        score = int(res.score)
        conf = float(res.confidence)
        status = getattr(res, "status", "supporting_authenticity" if score >= 60 else ("supporting_manipulation" if score <= 40 else "insufficient_signal"))
        quality = getattr(res, "quality", "GOOD")
        evidence = getattr(res, "evidence", {})

        detector_scores[name] = score
        detector_confidences[name] = round(conf, 2)
        detector_statuses[name] = status

        # Dynamic weight gating:
        # If signal is insufficient or degraded, dynamically downweight or eliminate its voting power
        effective_weight = base_weight * conf
        if status == "insufficient_signal" or quality == "POOR":
            effective_weight = base_weight * 0.10 # minimal weight for inconclusive signal
        else:
            valid_detector_count += 1
            active_scores_for_agreement[name] = score

        weighted_sum += score * effective_weight
        weight_total += effective_weight

        # Evidence table item
        evidence_matrix.append({
            "detector_id": name,
            "detector_name": label,
            "score": score,
            "confidence": round(conf, 2),
            "status": status,
            "quality": quality,
            "finding": res.finding,
            "metrics": evidence,
        })

        # Explainable bullet point
        if status == "supporting_manipulation":
            explainable_reasons.append(f"⛔ {label}: {res.finding}")
        elif status == "supporting_authenticity" and conf >= 0.80:
            explainable_reasons.append(f"✅ {label}: {res.finding}")
        elif status == "insufficient_signal":
            explainable_reasons.append(f"⚠️ {label}: Insufficient signal quality ({res.finding})")

    # Raw combined score [0, 100]
    raw_score = (weighted_sum / weight_total) if weight_total > 0 else 50.0

    # Multi-Signal Primary Biological Veto:
    # Only if multiple primary signals decisively fail with high confidence
    failing_primaries = 0
    if rppg.status == "supporting_manipulation" and rppg.confidence >= 0.70:
        failing_primaries += 1
    if lipsync.status == "supporting_manipulation" and lipsync.confidence >= 0.70 and lipsync.sync_rate < 0.35:
        failing_primaries += 1
    if freq_artifact.status == "supporting_manipulation" and freq_artifact.confidence >= 0.75:
        failing_primaries += 1

    if failing_primaries >= 2:
        raw_score = min(raw_score, 32.0)

    # 1. Calibrated Authenticity Probability P(Authentic)
    authenticity_prob = ForensicCalibrator.calibrate_probability(raw_score)
    overall_score = int(round(authenticity_prob * 100))

    # 2. Detector Agreement Index
    agreement_ratio, auth_votes, manip_votes, consensus_status = ForensicCalibrator.compute_detector_agreement(
        active_scores_for_agreement if active_scores_for_agreement else detector_scores
    )

    # 3. Calibrated Confidence Estimation with anti-overconfidence penalties
    confidence_score, confidence_tier, confidence_penalties = ForensicCalibrator.estimate_confidence(
        authenticity_prob=authenticity_prob,
        detector_agreement=agreement_ratio,
        analysis_quality=media_quality,
        duration_s=video_duration_s,
        num_valid_detectors=valid_detector_count,
    )

    # 4. Tampering timestamps from anomalous intervals
    tampering_timestamps = sorted(list(set(
        lipsync.anomaly_timestamps +
        ([lipsync.worst_timestamp_s] if lipsync.worst_timestamp_s else [])
    )))

    # 5. Hierarchical Final Verdict
    inconclusive_reasons = []

    # Rule A: Media Quality gate
    if media_quality < 35:
        verdict = "INCONCLUSIVE"
        inconclusive_reasons.append(f"Input video quality ({media_quality}/100) is too severely degraded for forensic reliance.")
    # Rule B: Low confidence gate
    elif confidence_score < 0.50:
        verdict = "INCONCLUSIVE"
        inconclusive_reasons.append(f"Overall confidence ({int(confidence_score * 100)}%) is below acceptable forensic threshold.")
        inconclusive_reasons.extend(confidence_penalties)
    # Rule C: Contradictory detectors
    elif consensus_status == "CONTRADICTORY" or agreement_ratio < 0.55:
        verdict = "INCONCLUSIVE"
        inconclusive_reasons.append(f"Independent detectors produced contradictory findings ({auth_votes} authentic vs {manip_votes} manipulated).")
    # Rule D: Strong Authentic Evidence
    elif authenticity_prob >= 0.70 and confidence_score >= 0.60 and agreement_ratio >= 0.60:
        verdict = "LIKELY AUTHENTIC"
    # Rule E: Strong Manipulated Evidence
    elif authenticity_prob <= 0.35 and confidence_score >= 0.60 and agreement_ratio >= 0.60:
        verdict = "LIKELY MANIPULATED"
    # Rule F: Boundary zone / Inconclusive
    else:
        verdict = "INCONCLUSIVE"
        inconclusive_reasons.append("Signals reside within the ambiguous threshold boundary without strong consensus.")

    # Recommended Action
    if verdict == "LIKELY AUTHENTIC":
        recommended_action = "Biometric pulse, ocular kinematics, and frequency spectrum corroborate organic human video."
    elif verdict == "LIKELY MANIPULATED":
        recommended_action = "High probability of synthetic facial generation or tampering. Restrict deployment and verify origin."
    else:
        recommended_action = "Signals are inconclusive. Do not rely on automated assessment alone; perform secondary verification."

    return EnsembleResult(
        overall_score=overall_score,
        authenticity_probability=authenticity_prob,
        verdict=verdict,
        confidence_tier=confidence_tier,
        confidence_score=confidence_score,
        analysis_quality=media_quality,
        detector_scores=detector_scores,
        detector_confidences=detector_confidences,
        detector_statuses=detector_statuses,
        detector_agreement_ratio=agreement_ratio,
        detector_consensus_status=consensus_status,
        explainable_reasons=explainable_reasons[:10],
        inconclusive_reasons=inconclusive_reasons,
        tampering_timestamps=tampering_timestamps[:10],
        recommended_action=recommended_action,
        evidence_matrix=evidence_matrix,
    )
