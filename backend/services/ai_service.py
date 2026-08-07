"""
AI Service — Master Orchestrator.

Ties together video preprocessing, rPPG, Lip-Sync, Eye Blink, Head Pose,
Facial Micro-Expressions, Audio Fake, Spatial FFT Artifacts, and Temporal Continuity
into an 8-detector Ensemble Forensic Pipeline.
"""
import os
import tempfile
import subprocess
import json
from typing import Optional, List, Dict
from dataclasses import dataclass, asdict

from services.video_service import extract_and_process_video
from services.rppg_service import analyze_rppg, RPPGResult
from services.lipsync_service import analyze_lipsync, LipSyncResult
from services.blink_service import analyze_blinks, BlinkResult
from services.headpose_service import analyze_headpose, HeadPoseResult
from services.expression_service import analyze_expressions, ExpressionResult
from services.audio_fake_service import analyze_audio_fake, AudioFakeResult
from services.frequency_artifact_service import analyze_frequency_artifacts, FrequencyArtifactResult
from services.temporal_service import analyze_temporal_continuity, TemporalResult
from services.ensemble_service import fuse_ensemble_predictions, EnsembleResult


@dataclass
class AnalysisResult:
    overall_score: int
    verdict: str                          # FAKE / LIKELY FAKE / UNCERTAIN / LIKELY REAL / REAL
    rppg: RPPGResult
    lipsync: LipSyncResult
    blink: BlinkResult
    headpose: HeadPoseResult
    expression: ExpressionResult
    audio_fake: AudioFakeResult
    freq_artifact: FrequencyArtifactResult
    temporal: TemporalResult
    ensemble: EnsembleResult
    confidence_tier: str                  # high / medium / low
    confidence_note: Optional[str]
    recommended_action: str
    video_duration_s: float
    face_detected: bool
    quality_warning: Optional[str]
    is_demo: bool = False


def run_analysis(video_path: str) -> AnalysisResult:
    """
    Full 8-detector ensemble forensic pipeline.
    """
    audio_path = _extract_audio(video_path)

    processed = extract_and_process_video(video_path, target_fps=15.0)

    if not processed.meta.face_detected:
        return _no_face_result(processed.meta.duration_s, processed.meta.quality_warning)

    # 1. rPPG Signal
    rppg_res = analyze_rppg(processed.face_rois, fps=15.0)

    # 2. Lip-Sync DSP
    lipsync_res = analyze_lipsync(
        audio_path,
        processed.face_landmarks,
        fps=15.0,
        video_duration_s=processed.meta.duration_s,
    )

    # 3. Eye Blink Analysis
    blink_res = analyze_blinks(
        processed.face_landmarks,
        fps=15.0,
        video_duration_s=processed.meta.duration_s,
    )

    # 4. Head Pose 3D Consistency
    headpose_res = analyze_headpose(
        processed.face_landmarks,
        fps=15.0,
        video_duration_s=processed.meta.duration_s,
    )

    # 5. Facial Micro-Expressions
    expr_res = analyze_expressions(
        processed.face_landmarks,
        fps=15.0,
        video_duration_s=processed.meta.duration_s,
    )

    # 6. Audio Deepfake Detection
    audio_fake_res = analyze_audio_fake(
        audio_path,
        video_duration_s=processed.meta.duration_s,
    )

    # 7. Spatial 2D FFT Frequency Artifacts
    freq_res = analyze_frequency_artifacts(
        processed.face_rois,
        fps=15.0,
    )

    # 8. Temporal Frame Continuity
    temp_res = analyze_temporal_continuity(
        processed.face_rois,
        fps=15.0,
    )

    # 9. Ensemble Fusion Layer
    ensemble_res = fuse_ensemble_predictions(
        rppg_res,
        lipsync_res,
        blink_res,
        headpose_res,
        expr_res,
        audio_fake_res,
        freq_res,
        temp_res,
    )

    # Cleanup audio temp file
    try:
        os.remove(audio_path)
    except Exception:
        pass

    return AnalysisResult(
        overall_score=ensemble_res.overall_score,
        verdict=ensemble_res.verdict,
        rppg=rppg_res,
        lipsync=lipsync_res,
        blink=blink_res,
        headpose=headpose_res,
        expression=expr_res,
        audio_fake=audio_fake_res,
        freq_artifact=freq_res,
        temporal=temp_res,
        ensemble=ensemble_res,
        confidence_tier=ensemble_res.confidence_tier,
        confidence_note=processed.meta.quality_warning,
        recommended_action=ensemble_res.recommended_action,
        video_duration_s=processed.meta.duration_s,
        face_detected=True,
        quality_warning=processed.meta.quality_warning,
        is_demo=False,
    )


def _extract_audio(video_path: str) -> str:
    audio_path = video_path.replace(".mp4", "_audio.wav").replace(".webm", "_audio.wav")
    if not audio_path.endswith("_audio.wav"):
        audio_path = video_path + "_audio.wav"

    try:
        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", video_path,
                "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
                audio_path,
            ],
            capture_output=True,
            timeout=60,
        )
        if result.returncode != 0:
            _create_silent_audio(audio_path, duration=10)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        _create_silent_audio(audio_path, duration=10)

    return audio_path


def _create_silent_audio(path: str, duration: int = 10):
    import wave, struct
    sample_rate = 16000
    n_samples = sample_rate * duration
    with wave.open(path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(struct.pack("<" + "h" * n_samples, *([0] * n_samples)))


def _no_face_result(duration_s: float, quality_warning: Optional[str]) -> AnalysisResult:
    rppg = RPPGResult(score=0, bpm_detected=None, coherence=0.0, snr_db=-999.0, finding="No face detected.", signal_quality="poor")
    ls = LipSyncResult(score=0, worst_timestamp_s=None, max_deviation=1.0, avg_deviation=1.0, sync_rate=0.0, finding="No face detected.", anomaly_timestamps=[])
    blink = BlinkResult(score=0, blink_count=0, blink_rate_per_min=0.0, avg_ear=0.0, finding="No face detected.", confidence=0.0)
    headpose = HeadPoseResult(score=0, angular_variance=0.0, max_jitter_spike=0.0, finding="No face detected.", confidence=0.0)
    expr = ExpressionResult(score=0, motion_variance=0.0, coordination_ratio=0.0, finding="No face detected.", confidence=0.0)
    audio_fake = AudioFakeResult(score=50, spectral_flux=0.0, zcr_variance=0.0, synthetic_prob=0.5, finding="No face detected.", confidence=0.3)
    freq = FrequencyArtifactResult(score=0, high_freq_residual=0.0, checkerboard_magnitude=0.0, finding="No face detected.", confidence=0.0)
    temp = TemporalResult(score=0, ssim_avg=0.0, max_discontinuity_mse=0.0, finding="No face detected.", confidence=0.0)

    ensemble = fuse_ensemble_predictions(rppg, ls, blink, headpose, expr, audio_fake, freq, temp)

    return AnalysisResult(
        overall_score=0,
        verdict="UNCERTAIN",
        rppg=rppg,
        lipsync=ls,
        blink=blink,
        headpose=headpose,
        expression=expr,
        audio_fake=audio_fake,
        freq_artifact=freq,
        temporal=temp,
        ensemble=ensemble,
        confidence_tier="low",
        confidence_note="No human face detected.",
        recommended_action="Ensure the video contains a clearly visible human face.",
        video_duration_s=duration_s,
        face_detected=False,
        quality_warning=quality_warning,
        is_demo=False,
    )
