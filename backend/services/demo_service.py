"""
Demo Mode Service — PULSEVEIN Forensic Engine v2.2.0.

Provides rich preloaded forensic scenarios:
  1. 'fake' (LIKELY MANIPULATED)
  2. 'real' (LIKELY AUTHENTIC)
  3. 'inconclusive' (INCONCLUSIVE — Low lighting / Contradictory signals)
"""
from services.rppg_service import RPPGResult
from services.lipsync_service import LipSyncResult
from services.blink_service import BlinkResult
from services.headpose_service import HeadPoseResult
from services.expression_service import ExpressionResult
from services.audio_fake_service import AudioFakeResult
from services.frequency_artifact_service import FrequencyArtifactResult
from services.temporal_service import TemporalResult
from services.ensemble_service import EnsembleResult
from services.ai_service import AnalysisResult, TimelineSegmentData
from services.media_quality_service import MediaQualityAssessment


def _make_fake_scenario() -> AnalysisResult:
    rppg = RPPGResult(
        score=14, bpm_detected=None, coherence=0.04, snr_db=-8.2,
        finding="No coherent sub-surface green light blood pulse signal detected in facial skin ROI.",
        signal_quality="poor", status="supporting_manipulation", quality="GOOD",
        evidence={"snr_db": -8.2, "coherence": 0.04, "pulse_detected": False}
    )
    lipsync = LipSyncResult(
        score=26, worst_timestamp_s=14.3, max_deviation=0.82, avg_deviation=0.47, sync_rate=0.31,
        finding="Desynchronization between mouth aperture landmark #14 and vocal acoustic envelope at 0:14s.",
        anomaly_timestamps=[14.3], status="supporting_manipulation", quality="GOOD",
        evidence={"sync_rate": 0.31, "max_deviation": 0.82, "anomalies": [14.3]}
    )
    blink = BlinkResult(
        score=22, blink_count=0, blink_rate_per_min=0.0, avg_ear=0.28,
        finding="Zero ocular blinks detected over 24.0s duration. Unnatural ocular stasis indicative of avatar synthesis.",
        confidence=0.88, status="supporting_manipulation", quality="GOOD",
        evidence={"blink_count": 0, "duration_s": 24.0}
    )
    headpose = HeadPoseResult(
        score=24, angular_variance=0.08, max_jitter_spike=24.5,
        finding="Sudden rotational head pose warp spike (24.5°/frame²) detected at face boundary.",
        confidence=0.85, status="supporting_manipulation", quality="GOOD",
        evidence={"max_jitter_spike": 24.5}
    )
    expr = ExpressionResult(
        score=26, motion_variance=0.00001, coordination_ratio=0.35,
        finding="Facial micro-expression stasis detected: eyebrow and cheek muscle deformation vectors are frozen.",
        confidence=0.82, status="supporting_manipulation", quality="GOOD",
        evidence={"motion_variance": 0.00001}
    )
    audio_fake = AudioFakeResult(
        score=20, spectral_flux=0.00008, zcr_variance=0.0003, synthetic_prob=0.88,
        finding="Synthetic vocoder voice clone detected: spectral flux exhibits abnormal flat profile.",
        confidence=0.88, status="supporting_manipulation", quality="GOOD",
        evidence={"synthetic_prob": 0.88}
    )
    freq_artifact = FrequencyArtifactResult(
        score=22, high_freq_residual=0.44, checkerboard_magnitude=0.38,
        finding="Generative AI spatial frequency grid artifacts detected (0.38 spectral checkerboard power in 2D FFT).",
        confidence=0.86, status="supporting_manipulation", quality="GOOD",
        evidence={"high_freq_residual": 0.44}
    )
    temporal = TemporalResult(
        score=25, ssim_avg=0.62, max_discontinuity_mse=38.4,
        finding="Severe temporal frame boundary flickering detected (max MSE 38.4).",
        confidence=0.85, status="supporting_manipulation", quality="GOOD",
        evidence={"max_discontinuity_mse": 38.4}
    )

    evidence_matrix = [
        {"detector_id": "rppg", "detector_name": "Physiological Blood Flow (rPPG)", "score": 14, "confidence": 0.90, "status": "supporting_manipulation", "quality": "GOOD", "finding": rppg.finding, "metrics": rppg.evidence},
        {"detector_id": "lipsync", "detector_name": "Audio-Visual Lip-Sync DSP", "score": 26, "confidence": 0.88, "status": "supporting_manipulation", "quality": "GOOD", "finding": lipsync.finding, "metrics": lipsync.evidence},
        {"detector_id": "blink", "detector_name": "Eye Blink Dynamics (EAR)", "score": 22, "confidence": 0.88, "status": "supporting_manipulation", "quality": "GOOD", "finding": blink.finding, "metrics": blink.evidence},
        {"detector_id": "headpose", "detector_name": "Head Pose Kinematic Stability", "score": 24, "confidence": 0.85, "status": "supporting_manipulation", "quality": "GOOD", "finding": headpose.finding, "metrics": headpose.evidence},
        {"detector_id": "expression", "detector_name": "Facial Micro-Expression Symmetry", "score": 26, "confidence": 0.82, "status": "supporting_manipulation", "quality": "GOOD", "finding": expr.finding, "metrics": expr.evidence},
        {"detector_id": "audio_fake", "detector_name": "Acoustic Vocoder Artifacts", "score": 20, "confidence": 0.88, "status": "supporting_manipulation", "quality": "GOOD", "finding": audio_fake.finding, "metrics": audio_fake.evidence},
        {"detector_id": "frequency_artifact", "detector_name": "Spatial 2D FFT Grid Residuals", "score": 22, "confidence": 0.86, "status": "supporting_manipulation", "quality": "GOOD", "finding": freq_artifact.finding, "metrics": freq_artifact.evidence},
        {"detector_id": "temporal", "detector_name": "Temporal Frame Continuity (SSIM)", "score": 25, "confidence": 0.85, "status": "supporting_manipulation", "quality": "GOOD", "finding": temporal.finding, "metrics": temporal.evidence},
    ]

    ensemble = EnsembleResult(
        overall_score=18,
        authenticity_probability=0.18,
        verdict="LIKELY MANIPULATED",
        confidence_tier="high",
        confidence_score=0.92,
        analysis_quality=85,
        detector_scores={"rppg": 14, "lipsync": 26, "blink": 22, "headpose": 24, "expression": 26, "audio_fake": 20, "frequency_artifact": 22, "temporal": 25},
        detector_confidences={"rppg": 0.90, "lipsync": 0.88, "blink": 0.88, "headpose": 0.85, "expression": 0.82, "audio_fake": 0.88, "frequency_artifact": 0.86, "temporal": 0.85},
        detector_statuses={k: "supporting_manipulation" for k in ["rppg", "lipsync", "blink", "headpose", "expression", "audio_fake", "frequency_artifact", "temporal"]},
        detector_agreement_ratio=1.0,
        detector_consensus_status="STRONG_CONSENSUS",
        explainable_reasons=[
            "⛔ Physiological Blood Flow: Absent sub-surface green light pulse (-8.2 dB SNR)",
            "⛔ Audio-Visual Lip-Sync: Desync detected at 0:14s between lips and audio",
            "⛔ Eye Blink Dynamics: Zero blinks over 24.0s indicates synthetic ocular stasis",
            "⛔ Spatial 2D FFT: Upsampling checkerboard grid patterns in frequency domain",
            "⛔ Head Pose: Boundary warping jitter spike (24.5°/f²)",
        ],
        inconclusive_reasons=[],
        tampering_timestamps=[14.3],
        recommended_action="High probability of synthetic facial generation or tampering. Restrict deployment and verify origin.",
        evidence_matrix=evidence_matrix,
    )

    media_quality = MediaQualityAssessment(
        composite_score=85, quality_tier="GOOD", resolution_label="1920x1080 (1080p)",
        width=1920, height=1080, fps=30.0, duration_s=24.0, face_coverage_ratio=0.42,
        face_detected_ratio=0.98, illumination_brightness=135.0, illumination_contrast=52.0,
        motion_stability_score=0.92, guidance=[]
    )

    timeline = [
        TimelineSegmentData(0, 0.0, 6.0, 18, "HIGH", ["Synthesized face structure identified"]),
        TimelineSegmentData(1, 6.0, 12.0, 18, "HIGH", ["Ocular stasis persistent"]),
        TimelineSegmentData(2, 12.0, 18.0, 12, "HIGH", ["Acoustic/kinematic desync spike at 14.3s"]),
        TimelineSegmentData(3, 18.0, 24.0, 20, "HIGH", ["Spatial 2D FFT checkerboard active"]),
    ]

    return AnalysisResult(
        overall_score=18,
        authenticity_probability=0.18,
        verdict="LIKELY MANIPULATED",
        confidence_tier="high",
        confidence_score=0.92,
        analysis_quality=85,
        detector_agreement_ratio=1.0,
        detector_consensus_status="STRONG_CONSENSUS",
        rppg=rppg, lipsync=lipsync, blink=blink, headpose=headpose, expression=expr,
        audio_fake=audio_fake, freq_artifact=freq_artifact, temporal=temporal,
        ensemble=ensemble, media_quality=media_quality, evidence_matrix=evidence_matrix,
        explainable_reasons=ensemble.explainable_reasons, inconclusive_reasons=[],
        timeline_segments=timeline, tampering_timestamps=[14.3],
        recommended_action=ensemble.recommended_action, video_duration_s=24.0,
        face_detected=True, quality_warning=None,
        sha256_hash="a1f4b8c9d2e3f4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456",
        experimental_biometrics={
            "disclaimer": "RESEARCH DEMONSTRATION ONLY: Not a medical diagnostic device or certified biometric identifier.",
            "blood_pressure_estimate": "N/A (Incoherent physiological pulse)",
            "demographic_gender_estimate": "Synthetic demographic model",
            "excluded_from_authenticity": True
        },
        is_demo=True,
    )


def _make_real_scenario() -> AnalysisResult:
    rppg = RPPGResult(
        score=89, bpm_detected=74.2, coherence=0.86, snr_db=12.4,
        finding="Sub-surface arterial blood flow verified at ~74.2 BPM with 86% spectral coherence.",
        signal_quality="good", status="supporting_authenticity", quality="EXCELLENT",
        evidence={"bpm": 74.2, "coherence": 0.86, "snr_db": 12.4}
    )
    lipsync = LipSyncResult(
        score=93, worst_timestamp_s=None, max_deviation=0.12, avg_deviation=0.05, sync_rate=0.97,
        finding="Flawless 3D lip-audio coherence: mouth aperture tracks speech envelope across 97% of frames.",
        anomaly_timestamps=[], status="supporting_authenticity", quality="EXCELLENT",
        evidence={"sync_rate": 0.97, "max_deviation": 0.12}
    )
    blink = BlinkResult(
        score=88, blink_count=4, blink_rate_per_min=13.3, avg_ear=0.26,
        finding="Natural ocular dynamics verified: 4 blinks detected (~13.3 blinks/min), consistent with real human eye behavior.",
        confidence=0.90, status="supporting_authenticity", quality="EXCELLENT",
        evidence={"blink_count": 4, "blink_rate_per_min": 13.3}
    )
    headpose = HeadPoseResult(
        score=88, angular_variance=1.45, max_jitter_spike=4.2,
        finding="Smooth 3D head pose kinematics verified (max acceleration 4.2°/frame²).",
        confidence=0.88, status="supporting_authenticity", quality="EXCELLENT",
        evidence={"max_jitter_spike": 4.2}
    )
    expr = ExpressionResult(
        score=86, motion_variance=0.024, coordination_ratio=0.82,
        finding="Natural facial micro-expression dynamics verified (coordination ratio 0.82).",
        confidence=0.86, status="supporting_authenticity", quality="GOOD",
        evidence={"coordination_ratio": 0.82}
    )
    audio_fake = AudioFakeResult(
        score=89, spectral_flux=0.014, zcr_variance=0.0042, synthetic_prob=0.12,
        finding="Authentic vocal acoustics verified: organic spectral flux and harmonic richness detected.",
        confidence=0.86, status="supporting_authenticity", quality="EXCELLENT",
        evidence={"spectral_flux": 0.014}
    )
    freq_artifact = FrequencyArtifactResult(
        score=88, high_freq_residual=0.12, checkerboard_magnitude=0.08,
        finding="Natural spatial frequency spectrum verified. Zero upsampling grid artifacts detected.",
        confidence=0.88, status="supporting_authenticity", quality="EXCELLENT",
        evidence={"checkerboard_magnitude": 0.08}
    )
    temporal = TemporalResult(
        score=89, ssim_avg=0.92, max_discontinuity_mse=5.4,
        finding="Smooth temporal frame continuity verified (SSIM 0.92, max MSE 5.4).",
        confidence=0.88, status="supporting_authenticity", quality="EXCELLENT",
        evidence={"ssim_avg": 0.92}
    )

    evidence_matrix = [
        {"detector_id": "rppg", "detector_name": "Physiological Blood Flow (rPPG)", "score": 89, "confidence": 0.90, "status": "supporting_authenticity", "quality": "EXCELLENT", "finding": rppg.finding, "metrics": rppg.evidence},
        {"detector_id": "lipsync", "detector_name": "Audio-Visual Lip-Sync DSP", "score": 93, "confidence": 0.90, "status": "supporting_authenticity", "quality": "EXCELLENT", "finding": lipsync.finding, "metrics": lipsync.evidence},
        {"detector_id": "blink", "detector_name": "Eye Blink Dynamics (EAR)", "score": 88, "confidence": 0.90, "status": "supporting_authenticity", "quality": "EXCELLENT", "finding": blink.finding, "metrics": blink.evidence},
        {"detector_id": "headpose", "detector_name": "Head Pose Kinematic Stability", "score": 88, "confidence": 0.88, "status": "supporting_authenticity", "quality": "EXCELLENT", "finding": headpose.finding, "metrics": headpose.evidence},
        {"detector_id": "expression", "detector_name": "Facial Micro-Expression Symmetry", "score": 86, "confidence": 0.86, "status": "supporting_authenticity", "quality": "GOOD", "finding": expr.finding, "metrics": expr.evidence},
        {"detector_id": "audio_fake", "detector_name": "Acoustic Vocoder Artifacts", "score": 89, "confidence": 0.86, "status": "supporting_authenticity", "quality": "EXCELLENT", "finding": audio_fake.finding, "metrics": audio_fake.evidence},
        {"detector_id": "frequency_artifact", "detector_name": "Spatial 2D FFT Grid Residuals", "score": 88, "confidence": 0.88, "status": "supporting_authenticity", "quality": "EXCELLENT", "finding": freq_artifact.finding, "metrics": freq_artifact.evidence},
        {"detector_id": "temporal", "detector_name": "Temporal Frame Continuity (SSIM)", "score": 89, "confidence": 0.88, "status": "supporting_authenticity", "quality": "EXCELLENT", "finding": temporal.finding, "metrics": temporal.evidence},
    ]

    ensemble = EnsembleResult(
        overall_score=91,
        authenticity_probability=0.91,
        verdict="LIKELY AUTHENTIC",
        confidence_tier="high",
        confidence_score=0.95,
        analysis_quality=92,
        detector_scores={"rppg": 89, "lipsync": 93, "blink": 88, "headpose": 88, "expression": 86, "audio_fake": 89, "frequency_artifact": 88, "temporal": 89},
        detector_confidences={"rppg": 0.90, "lipsync": 0.90, "blink": 0.90, "headpose": 0.88, "expression": 0.86, "audio_fake": 0.86, "frequency_artifact": 0.88, "temporal": 0.88},
        detector_statuses={k: "supporting_authenticity" for k in ["rppg", "lipsync", "blink", "headpose", "expression", "audio_fake", "frequency_artifact", "temporal"]},
        detector_agreement_ratio=1.0,
        detector_consensus_status="STRONG_CONSENSUS",
        explainable_reasons=[
            "✅ Physiological Blood Flow: 74.2 BPM sub-surface pulse verified (86% spectral coherence)",
            "✅ Audio-Visual Lip-Sync: Flawless 3D mouth aperture alignment with speech envelope (97% sync rate)",
            "✅ Eye Blink Dynamics: Natural 13.3 blinks/min ocular frequency and EAR trajectory",
            "✅ Head Pose Kinematics: Smooth continuous 3D angular head trajectory without boundary jitter",
            "✅ Spatial 2D FFT: Natural optical frequency decay, zero upsampling checkerboard grid artifacts",
        ],
        inconclusive_reasons=[],
        tampering_timestamps=[],
        recommended_action="Biometric pulse, ocular kinematics, and frequency spectrum corroborate organic human video.",
        evidence_matrix=evidence_matrix,
    )

    media_quality = MediaQualityAssessment(
        composite_score=92, quality_tier="EXCELLENT", resolution_label="1920x1080 (1080p)",
        width=1920, height=1080, fps=30.0, duration_s=18.0, face_coverage_ratio=0.38,
        face_detected_ratio=1.0, illumination_brightness=142.0, illumination_contrast=58.0,
        motion_stability_score=0.96, guidance=[]
    )

    timeline = [
        TimelineSegmentData(0, 0.0, 6.0, 92, "LOW", ["Normal arterial pulse detected"]),
        TimelineSegmentData(1, 6.0, 12.0, 90, "LOW", ["Consistent facial micro-expressions"]),
        TimelineSegmentData(2, 12.0, 18.0, 91, "LOW", ["Organic acoustic-kinematic sync"]),
    ]

    return AnalysisResult(
        overall_score=91,
        authenticity_probability=0.91,
        verdict="LIKELY AUTHENTIC",
        confidence_tier="high",
        confidence_score=0.95,
        analysis_quality=92,
        detector_agreement_ratio=1.0,
        detector_consensus_status="STRONG_CONSENSUS",
        rppg=rppg, lipsync=lipsync, blink=blink, headpose=headpose, expression=expr,
        audio_fake=audio_fake, freq_artifact=freq_artifact, temporal=temporal,
        ensemble=ensemble, media_quality=media_quality, evidence_matrix=evidence_matrix,
        explainable_reasons=ensemble.explainable_reasons, inconclusive_reasons=[],
        timeline_segments=timeline, tampering_timestamps=[],
        recommended_action=ensemble.recommended_action, video_duration_s=18.0,
        face_detected=True, quality_warning=None,
        sha256_hash="b2c3d4e5f6a7b8c9d0e1f23456789abcdef0123456789abcdef0123456789ab",
        experimental_biometrics={
            "disclaimer": "RESEARCH DEMONSTRATION ONLY: Not a medical diagnostic device or certified biometric identifier.",
            "blood_pressure_estimate": "118/78 mmHg (Estimated via pulse transit approximation - NOT FOR MEDICAL USE)",
            "demographic_gender_estimate": "Adult Male (Research demographic model)",
            "excluded_from_authenticity": True
        },
        is_demo=True,
    )


def _make_inconclusive_scenario() -> AnalysisResult:
    rppg = RPPGResult(
        score=50, bpm_detected=None, coherence=0.18, snr_db=-2.1,
        finding="Physiological signal insufficient: Low lighting and high compression noise impede sub-surface CHROM rPPG signal extraction.",
        signal_quality="poor", status="insufficient_signal", quality="POOR",
        evidence={"snr_db": -2.1, "coherence": 0.18, "reason": "Insufficient illumination brightness"}
    )
    lipsync = LipSyncResult(
        score=72, worst_timestamp_s=None, max_deviation=0.28, avg_deviation=0.14, sync_rate=0.78,
        finding="Lip-sync alignment moderately consistent with background reverberation.",
        anomaly_timestamps=[], status="supporting_authenticity", quality="GOOD",
        evidence={"sync_rate": 0.78}
    )
    blink = BlinkResult(
        score=70, blink_count=1, blink_rate_per_min=10.0, avg_ear=0.24,
        finding="Ocular tracking limited due to subject wearing reflective eyewear.",
        confidence=0.55, status="insufficient_signal", quality="WEAK",
        evidence={"blink_count": 1}
    )
    headpose = HeadPoseResult(
        score=45, angular_variance=12.5, max_jitter_spike=14.2,
        finding="Moderate rotational jitter observed, potentially compounded by camera shake.",
        confidence=0.60, status="supporting_manipulation", quality="FAIR",
        evidence={"max_jitter_spike": 14.2}
    )
    expr = ExpressionResult(
        score=74, motion_variance=0.008, coordination_ratio=0.76,
        finding="Bilateral micro-expression symmetry within acceptable organic tolerance.",
        confidence=0.65, status="supporting_authenticity", quality="GOOD",
        evidence={"coordination_ratio": 0.76}
    )
    audio_fake = AudioFakeResult(
        score=70, spectral_flux=0.004, zcr_variance=0.0018, synthetic_prob=0.32,
        finding="Acoustic track features heavy compression artifacts; vocoder presence inconclusive.",
        confidence=0.50, status="insufficient_signal", quality="WEAK",
        evidence={"synthetic_prob": 0.32}
    )
    freq_artifact = FrequencyArtifactResult(
        score=48, high_freq_residual=0.34, checkerboard_magnitude=0.22,
        finding="Moderate high-frequency residual energy; cannot distinguish neural upsampling from severe H.264 macroblock compression.",
        confidence=0.60, status="insufficient_signal", quality="FAIR",
        evidence={"high_freq_residual": 0.34}
    )
    temporal = TemporalResult(
        score=68, ssim_avg=0.78, max_discontinuity_mse=16.8,
        finding="Temporal frame continuity degraded by low frame-rate and camera motion blur.",
        confidence=0.60, status="supporting_authenticity", quality="FAIR",
        evidence={"ssim_avg": 0.78}
    )

    evidence_matrix = [
        {"detector_id": "rppg", "detector_name": "Physiological Blood Flow (rPPG)", "score": 50, "confidence": 0.40, "status": "insufficient_signal", "quality": "POOR", "finding": rppg.finding, "metrics": rppg.evidence},
        {"detector_id": "lipsync", "detector_name": "Audio-Visual Lip-Sync DSP", "score": 72, "confidence": 0.70, "status": "supporting_authenticity", "quality": "GOOD", "finding": lipsync.finding, "metrics": lipsync.evidence},
        {"detector_id": "blink", "detector_name": "Eye Blink Dynamics (EAR)", "score": 70, "confidence": 0.55, "status": "insufficient_signal", "quality": "WEAK", "finding": blink.finding, "metrics": blink.evidence},
        {"detector_id": "headpose", "detector_name": "Head Pose Kinematic Stability", "score": 45, "confidence": 0.60, "status": "supporting_manipulation", "quality": "FAIR", "finding": headpose.finding, "metrics": headpose.evidence},
        {"detector_id": "expression", "detector_name": "Facial Micro-Expression Symmetry", "score": 74, "confidence": 0.65, "status": "supporting_authenticity", "quality": "GOOD", "finding": expr.finding, "metrics": expr.evidence},
        {"detector_id": "audio_fake", "detector_name": "Acoustic Vocoder Artifacts", "score": 70, "confidence": 0.50, "status": "insufficient_signal", "quality": "WEAK", "finding": audio_fake.finding, "metrics": audio_fake.evidence},
        {"detector_id": "frequency_artifact", "detector_name": "Spatial 2D FFT Grid Residuals", "score": 48, "confidence": 0.60, "status": "insufficient_signal", "quality": "FAIR", "finding": freq_artifact.finding, "metrics": freq_artifact.evidence},
        {"detector_id": "temporal", "detector_name": "Temporal Frame Continuity (SSIM)", "score": 68, "confidence": 0.60, "status": "supporting_authenticity", "quality": "FAIR", "finding": temporal.finding, "metrics": temporal.evidence},
    ]

    ensemble = EnsembleResult(
        overall_score=52,
        authenticity_probability=0.52,
        verdict="INCONCLUSIVE",
        confidence_tier="low",
        confidence_score=0.44,
        analysis_quality=48,
        detector_scores={"rppg": 50, "lipsync": 72, "blink": 70, "headpose": 45, "expression": 74, "audio_fake": 70, "frequency_artifact": 48, "temporal": 68},
        detector_confidences={"rppg": 0.40, "lipsync": 0.70, "blink": 0.55, "headpose": 0.60, "expression": 0.65, "audio_fake": 0.50, "frequency_artifact": 0.60, "temporal": 0.60},
        detector_statuses={"rppg": "insufficient_signal", "lipsync": "supporting_authenticity", "blink": "insufficient_signal", "headpose": "supporting_manipulation", "expression": "supporting_authenticity", "audio_fake": "insufficient_signal", "frequency_artifact": "insufficient_signal", "temporal": "supporting_authenticity"},
        detector_agreement_ratio=0.50,
        detector_consensus_status="CONTRADICTORY",
        explainable_reasons=[
            "⚠️ Physiological Blood Flow: Insufficient signal quality (Low lighting and compression noise impede rPPG)",
            "⚠️ Audio-Visual Lip-Sync: Moderate alignment obscured by reverberation",
            "⚠️ Spatial 2D FFT: Compression macroblocks mask high-frequency spectrum",
            "⚠️ Head Pose: Rotational variance partially elevated by hand-held camera jitter",
        ],
        inconclusive_reasons=[
            "Overall confidence (44%) is below the acceptable forensic threshold.",
            "Independent detectors produced contradictory findings (3 authentic vs 1 manipulated, 4 insufficient signals).",
            "Low input media quality (48%) impedes signal precision.",
        ],
        tampering_timestamps=[],
        recommended_action="Signals are inconclusive. Do not rely on automated assessment alone; perform secondary verification with higher-quality footage.",
        evidence_matrix=evidence_matrix,
    )

    media_quality = MediaQualityAssessment(
        composite_score=48, quality_tier="FAIR", resolution_label="640x360 (Low Def)",
        width=640, height=360, fps=15.0, duration_s=6.0, face_coverage_ratio=0.18,
        face_detected_ratio=0.72, illumination_brightness=62.0, illumination_contrast=24.0,
        motion_stability_score=0.62,
        guidance=[
            "Increase face lighting: Dark ambient lighting reduces skin pulse signal-to-noise ratio.",
            "Higher resolution recommended: 360p video contains compression macroblocks that degrade frequency forensics.",
        ]
    )

    timeline = [
        TimelineSegmentData(0, 0.0, 3.0, 52, "MEDIUM", ["Insufficient lighting for rPPG"]),
        TimelineSegmentData(1, 3.0, 6.0, 52, "MEDIUM", ["Hand-held camera motion jitter"]),
    ]

    return AnalysisResult(
        overall_score=52,
        authenticity_probability=0.52,
        verdict="INCONCLUSIVE",
        confidence_tier="low",
        confidence_score=0.44,
        analysis_quality=48,
        detector_agreement_ratio=0.50,
        detector_consensus_status="CONTRADICTORY",
        rppg=rppg, lipsync=lipsync, blink=blink, headpose=headpose, expression=expr,
        audio_fake=audio_fake, freq_artifact=freq_artifact, temporal=temporal,
        ensemble=ensemble, media_quality=media_quality, evidence_matrix=evidence_matrix,
        explainable_reasons=ensemble.explainable_reasons,
        inconclusive_reasons=ensemble.inconclusive_reasons,
        timeline_segments=timeline, tampering_timestamps=[],
        recommended_action=ensemble.recommended_action, video_duration_s=6.0,
        face_detected=True, quality_warning="Suboptimal lighting and resolution. Results labeled INCONCLUSIVE to avoid false positives.",
        sha256_hash="c3d4e5f6a7b8c9d0e1f2a3456789abcdef0123456789abcdef0123456789abcd",
        experimental_biometrics={
            "disclaimer": "RESEARCH DEMONSTRATION ONLY: Not a medical diagnostic device or certified biometric identifier.",
            "blood_pressure_estimate": "N/A (Signal quality too weak)",
            "demographic_gender_estimate": "Inconclusive due to low lighting",
            "excluded_from_authenticity": True
        },
        is_demo=True,
    )


DEMO_SCENARIOS = {
    "fake": _make_fake_scenario(),
    "real": _make_real_scenario(),
    "uncertain": _make_inconclusive_scenario(),
    "inconclusive": _make_inconclusive_scenario(),
}


def get_demo_result(scenario: str = "fake") -> AnalysisResult:
    """Return a preloaded demo scenario."""
    return DEMO_SCENARIOS.get(scenario, DEMO_SCENARIOS["fake"])
