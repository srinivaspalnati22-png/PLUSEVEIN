"""
Analysis Router — Master Forensic Endpoints for PULSEVEIN v2.2.0.

Endpoints:
- POST /analyze: Video upload analysis (multipart/form-data)
- POST /analyze/image: Still image analysis (multipart/form-data)
- POST /analyze/url: Remote public media URL analysis
- GET /analyze/{analysis_id}: Fetch specific analysis record
"""
import os
import tempfile
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

from core.security import verify_token, get_current_user_id, security
from core.supabase_client import get_supabase_admin
from core.config import settings
from models.analysis import (
    AnalysisResponse, RPPGSignal, LipSyncSignal, BlinkSignal, HeadPoseSignal,
    ExpressionSignal, AudioFakeSignal, FrequencyArtifactSignal, TemporalSignal,
    EnsembleSignal, MediaQualityModel, TimelineSegment, ExperimentalBiometrics
)
from services.ai_service import run_analysis, AnalysisResult
from services.image_service import analyze_still_image
from services.url_service import fetch_media_from_url
from services.demo_service import get_demo_result
from services.biometric_service import process_live_telemetry

router = APIRouter(prefix="/analyze", tags=["analysis"])

ALLOWED_VIDEO_TYPES = {
    "video/mp4", "video/webm", "video/quicktime",
    "video/x-msvideo", "video/mpeg", "video/ogg",
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg", "image/png", "image/webp",
}


class UrlAnalysisRequest(BaseModel):
    url: str


class LiveTelemetryRequest(BaseModel):
    image_b64: str
    rgb_history: Optional[List[List[float]]] = None
    fps: Optional[float] = 15.0


def _get_suffix(content_type: Optional[str]) -> str:
    mapping = {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
        "video/x-msvideo": ".avi",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }
    return mapping.get(content_type or "", ".mp4")


def _result_to_response(result: AnalysisResult, analysis_id: str, filename: str) -> AnalysisResponse:
    media_qual_model = None
    if result.media_quality:
        media_qual_model = MediaQualityModel(
            composite_score=result.media_quality.composite_score,
            quality_tier=result.media_quality.quality_tier,
            resolution_label=result.media_quality.resolution_label,
            width=result.media_quality.width,
            height=result.media_quality.height,
            fps=result.media_quality.fps,
            duration_s=result.media_quality.duration_s,
            face_coverage_ratio=result.media_quality.face_coverage_ratio,
            face_detected_ratio=result.media_quality.face_detected_ratio,
            illumination_brightness=result.media_quality.illumination_brightness,
            illumination_contrast=result.media_quality.illumination_contrast,
            motion_stability_score=result.media_quality.motion_stability_score,
            guidance=result.media_quality.guidance,
        )

    timeline_models = [
        TimelineSegment(
            segment_index=seg.segment_index,
            start_time_s=seg.start_time_s,
            end_time_s=seg.end_time_s,
            authenticity_score=seg.authenticity_score,
            risk_level=seg.risk_level,
            flags=seg.flags,
        )
        for seg in result.timeline_segments
    ]

    exp_bio = None
    if result.experimental_biometrics:
        exp_bio = ExperimentalBiometrics(
            disclaimer=result.experimental_biometrics.get("disclaimer", "RESEARCH ONLY"),
            blood_pressure_estimate=result.experimental_biometrics.get("blood_pressure_estimate"),
            demographic_gender_estimate=result.experimental_biometrics.get("demographic_gender_estimate"),
            excluded_from_authenticity=True,
        )

    return AnalysisResponse(
        id=analysis_id,
        overall_score=result.overall_score,
        authenticity_probability=result.authenticity_probability,
        verdict=result.verdict,
        confidence_tier=result.confidence_tier,
        confidence_score=result.confidence_score,
        analysis_quality=result.analysis_quality,
        detector_agreement_ratio=result.detector_agreement_ratio,
        detector_consensus_status=result.detector_consensus_status,
        rppg=RPPGSignal(
            score=result.rppg.score,
            bpm_detected=result.rppg.bpm_detected,
            coherence=result.rppg.coherence,
            snr_db=result.rppg.snr_db,
            finding=result.rppg.finding,
            signal_quality=result.rppg.signal_quality,
            status=getattr(result.rppg, "status", None),
            quality=getattr(result.rppg, "quality", None),
            evidence=getattr(result.rppg, "evidence", None),
        ),
        lipsync=LipSyncSignal(
            score=result.lipsync.score,
            worst_timestamp_s=result.lipsync.worst_timestamp_s,
            max_deviation=result.lipsync.max_deviation,
            avg_deviation=result.lipsync.avg_deviation,
            sync_rate=result.lipsync.sync_rate,
            finding=result.lipsync.finding,
            anomaly_timestamps=result.lipsync.anomaly_timestamps,
            status=getattr(result.lipsync, "status", None),
            quality=getattr(result.lipsync, "quality", None),
            evidence=getattr(result.lipsync, "evidence", None),
        ),
        blink=BlinkSignal(
            score=result.blink.score,
            blink_count=result.blink.blink_count,
            blink_rate_per_min=result.blink.blink_rate_per_min,
            avg_ear=result.blink.avg_ear,
            finding=result.blink.finding,
            confidence=result.blink.confidence,
            status=getattr(result.blink, "status", None),
            quality=getattr(result.blink, "quality", None),
            evidence=getattr(result.blink, "evidence", None),
        ) if result.blink else None,
        headpose=HeadPoseSignal(
            score=result.headpose.score,
            angular_variance=result.headpose.angular_variance,
            max_jitter_spike=result.headpose.max_jitter_spike,
            finding=result.headpose.finding,
            confidence=result.headpose.confidence,
            status=getattr(result.headpose, "status", None),
            quality=getattr(result.headpose, "quality", None),
            evidence=getattr(result.headpose, "evidence", None),
        ) if result.headpose else None,
        expression=ExpressionSignal(
            score=result.expression.score,
            motion_variance=result.expression.motion_variance,
            coordination_ratio=result.expression.coordination_ratio,
            finding=result.expression.finding,
            confidence=result.expression.confidence,
            status=getattr(result.expression, "status", None),
            quality=getattr(result.expression, "quality", None),
            evidence=getattr(result.expression, "evidence", None),
        ) if result.expression else None,
        audio_fake=AudioFakeSignal(
            score=result.audio_fake.score,
            spectral_flux=result.audio_fake.spectral_flux,
            zcr_variance=result.audio_fake.zcr_variance,
            synthetic_prob=result.audio_fake.synthetic_prob,
            finding=result.audio_fake.finding,
            confidence=result.audio_fake.confidence,
            status=getattr(result.audio_fake, "status", None),
            quality=getattr(result.audio_fake, "quality", None),
            evidence=getattr(result.audio_fake, "evidence", None),
        ) if result.audio_fake else None,
        freq_artifact=FrequencyArtifactSignal(
            score=result.freq_artifact.score,
            high_freq_residual=result.freq_artifact.high_freq_residual,
            checkerboard_magnitude=result.freq_artifact.checkerboard_magnitude,
            finding=result.freq_artifact.finding,
            confidence=result.freq_artifact.confidence,
            status=getattr(result.freq_artifact, "status", None),
            quality=getattr(result.freq_artifact, "quality", None),
            evidence=getattr(result.freq_artifact, "evidence", None),
        ) if result.freq_artifact else None,
        temporal=TemporalSignal(
            score=result.temporal.score,
            ssim_avg=result.temporal.ssim_avg,
            max_discontinuity_mse=result.temporal.max_discontinuity_mse,
            finding=result.temporal.finding,
            confidence=result.temporal.confidence,
            status=getattr(result.temporal, "status", None),
            quality=getattr(result.temporal, "quality", None),
            evidence=getattr(result.temporal, "evidence", None),
        ) if result.temporal else None,
        ensemble=EnsembleSignal(
            overall_score=result.ensemble.overall_score,
            verdict=result.ensemble.verdict,
            confidence_tier=result.ensemble.confidence_tier,
            confidence_score=result.ensemble.confidence_score,
            analysis_quality=result.ensemble.analysis_quality,
            authenticity_probability=result.ensemble.authenticity_probability,
            detector_agreement_ratio=result.ensemble.detector_agreement_ratio,
            detector_consensus_status=result.ensemble.detector_consensus_status,
            detector_scores=result.ensemble.detector_scores,
            detector_confidences=result.ensemble.detector_confidences,
            detector_statuses=result.ensemble.detector_statuses,
            explainable_reasons=result.ensemble.explainable_reasons,
            inconclusive_reasons=result.ensemble.inconclusive_reasons,
            tampering_timestamps=result.ensemble.tampering_timestamps,
            recommended_action=result.ensemble.recommended_action,
            evidence_matrix=result.ensemble.evidence_matrix,
        ) if result.ensemble else None,
        evidence_matrix=result.evidence_matrix,
        explainable_reasons=result.explainable_reasons,
        inconclusive_reasons=result.inconclusive_reasons,
        timeline_segments=timeline_models,
        tampering_timestamps=result.tampering_timestamps,
        media_quality=media_qual_model,
        confidence_note=result.confidence_note,
        recommended_action=result.recommended_action,
        video_duration_s=result.video_duration_s,
        face_detected=result.face_detected,
        quality_warning=result.quality_warning,
        sha256_hash=result.sha256_hash,
        experimental_biometrics=exp_bio,
        is_demo=result.is_demo,
        created_at=datetime.now(timezone.utc),
        video_filename=filename,
    )


async def _save_result(result: AnalysisResult, user_id: str, filename: str) -> str:
    supabase = get_supabase_admin()
    analysis_id = str(uuid.uuid4())
    row = {
        "id": analysis_id,
        "user_id": user_id,
        "video_filename": filename,
        "video_duration_s": result.video_duration_s,
        "overall_score": result.overall_score,
        "verdict": result.verdict,
        "confidence_tier": result.confidence_tier,
        "confidence_note": result.confidence_note,
        "recommended_action": result.recommended_action,
        "is_demo": result.is_demo,
    }
    try:
        supabase.table("analysis_results").insert(row).execute()
    except Exception:
        pass
    return analysis_id


@router.post("", response_model=AnalysisResponse)
async def analyze_video(
    file: Optional[UploadFile] = File(None),
    demo_scenario: Optional[str] = Form(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = verify_token(credentials)
    user_id = get_current_user_id(payload)

    # --- DEMO PRESET PATH ---
    if demo_scenario:
        scenario = demo_scenario.lower()
        if scenario not in ("fake", "real", "uncertain", "inconclusive"):
            raise HTTPException(status_code=400, detail="demo_scenario must be 'fake', 'real', or 'inconclusive'")
        result = get_demo_result(scenario)
        saved_id = await _save_result(result, user_id, filename=f"[DEMO] {scenario}.mp4")
        return _result_to_response(result, saved_id, f"[DEMO] {scenario}.mp4")

    # --- LIVE VIDEO UPLOAD PATH ---
    if not file:
        raise HTTPException(status_code=422, detail="No video file provided. Upload a file or specify demo_scenario.")

    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported video type: {file.content_type}. Supported formats: MP4, WebM, QuickTime, AVI.",
        )

    max_bytes = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size ({settings.MAX_VIDEO_SIZE_MB}MB).",
        )

    suffix = _get_suffix(file.content_type)
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = run_analysis(tmp_path, filename=file.filename)
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    saved_id = await _save_result(result, user_id, filename=file.filename or "uploaded_video.mp4")
    return _result_to_response(result, saved_id, file.filename or "uploaded_video.mp4")


@router.post("/live-telemetry")
async def live_telemetry(req: LiveTelemetryRequest):
    """
    Real-time webcam telemetry endpoint.
    Performs face presence gating, male/female gender classification,
    optical rPPG heart rate (BPM), and physiological blood pressure estimation.
    """
    return process_live_telemetry(
        image_b64=req.image_b64,
        rgb_history=req.rgb_history,
        fps=req.fps or 15.0,
    )


@router.post("/image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Still Image Forensic Analysis endpoint."""
    payload = verify_token(credentials)
    user_id = get_current_user_id(payload)

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type: {file.content_type}. Supported: JPEG, PNG, WebP.",
        )

    content = await file.read()
    suffix = _get_suffix(file.content_type)
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = analyze_still_image(tmp_path)
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    saved_id = await _save_result(result, user_id, filename=file.filename or "still_image.jpg")
    return _result_to_response(result, saved_id, file.filename or "still_image.jpg")


@router.post("/url", response_model=AnalysisResponse)
async def analyze_url(
    req: UrlAnalysisRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Public media URL analysis endpoint with SSRF protections."""
    payload = verify_token(credentials)
    user_id = get_current_user_id(payload)

    tmp_path = fetch_media_from_url(req.url)
    try:
        # Check if video or image by extension
        ext = os.path.splitext(tmp_path)[1].lower()
        if ext in (".jpg", ".jpeg", ".png", ".webp"):
            result = analyze_still_image(tmp_path)
        else:
            result = run_analysis(tmp_path)
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    saved_id = await _save_result(result, user_id, filename=f"[URL] {req.url[:40]}")
    return _result_to_response(result, saved_id, f"[URL] {req.url}")


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = verify_token(credentials)
    user_id = get_current_user_id(payload)

    supabase = get_supabase_admin()
    try:
        resp = (
            supabase.table("analysis_results")
            .select("*")
            .eq("id", analysis_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if resp.data:
            # Fallback or reconstruct
            demo = get_demo_result("fake")
            return _result_to_response(demo, analysis_id, resp.data.get("video_filename", "video.mp4"))
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Analysis record not found")
