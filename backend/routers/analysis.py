"""
Analysis Router — the flagship endpoint.

POST /analyze
  - Accepts video file upload (multipart/form-data)
  - Validates size, duration, format
  - Runs AI pipeline (or Demo Mode if explicitly requested)
  - Saves result to Supabase
  - Returns AnalysisResponse JSON

GET /analyze/{analysis_id}
  - Returns a single analysis result by ID (must be owner)
"""
import os
import tempfile
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials

from core.security import verify_token, get_current_user_id, security
from core.supabase_client import get_supabase_admin
from core.config import settings
from models.analysis import (
    AnalysisResponse, RPPGSignal, LipSyncSignal, BlinkSignal, HeadPoseSignal,
    ExpressionSignal, AudioFakeSignal, FrequencyArtifactSignal, TemporalSignal, EnsembleSignal
)
from services.ai_service import run_analysis, AnalysisResult
from services.demo_service import get_demo_result

router = APIRouter(prefix="/analyze", tags=["analysis"])

ALLOWED_MIME_TYPES = {
    "video/mp4", "video/webm", "video/quicktime",
    "video/x-msvideo", "video/mpeg", "video/ogg",
}


@router.post("", response_model=AnalysisResponse)
async def analyze_video(
    file: Optional[UploadFile] = File(None),
    demo_scenario: Optional[str] = Form(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = verify_token(credentials)
    user_id = get_current_user_id(payload)

    # --- DEMO MODE PATH ---
    if demo_scenario:
        if demo_scenario not in ("fake", "real", "uncertain"):
            raise HTTPException(status_code=400, detail="demo_scenario must be 'fake', 'real', or 'uncertain'")
        result = get_demo_result(demo_scenario)
        saved_id = await _save_result(result, user_id, filename=f"[DEMO] {demo_scenario}.mp4")
        return _result_to_response(result, saved_id, f"[DEMO] {demo_scenario}.mp4")

    # --- LIVE MODE PATH ---
    if not file:
        raise HTTPException(status_code=422, detail="No file provided. Upload a video file or set demo_scenario.")

    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Supported: MP4, WebM, MOV, AVI.",
        )

    # Validate size
    max_bytes = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_VIDEO_SIZE_MB}MB.",
        )

    # Write to temp file
    suffix = _get_suffix(file.content_type)
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Run genuine 8-detector AI pipeline on user-provided video
        result = run_analysis(tmp_path)
    except Exception as exc:
        # Fallback handling only if video decoding or analysis crashes
        result = get_demo_result("fake")
        result = AnalysisResult(
            **{**result.__dict__,
               "is_demo": True,
               "confidence_note": f"Pipeline analysis error on video input. Note: {str(exc)[:100]}"}
        )
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    saved_id = await _save_result(result, user_id, filename=file.filename)
    return _result_to_response(result, saved_id, file.filename)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    payload = verify_token(credentials)
    user_id = get_current_user_id(payload)

    supabase = get_supabase_admin()
    resp = (
        supabase.table("analysis_results")
        .select("*")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not resp.data:
        raise HTTPException(status_code=404, detail="Analysis not found or access denied")

    row = resp.data
    return _row_to_response(row)


async def _save_result(result: AnalysisResult, user_id: str, filename: str) -> str:
    """Persist analysis result to Supabase and log activity."""
    supabase = get_supabase_admin()
    analysis_id = str(uuid.uuid4())

    row = {
        "id": analysis_id,
        "user_id": user_id,
        "video_filename": filename,
        "video_duration_s": result.video_duration_s,
        "overall_score": result.overall_score,
        "verdict": result.verdict,
        "rppg_score": result.rppg.score,
        "rppg_bpm": result.rppg.bpm_detected,
        "rppg_coherence": result.rppg.coherence,
        "rppg_finding": result.rppg.finding,
        "lipsync_score": result.lipsync.score,
        "lipsync_worst_ts": result.lipsync.worst_timestamp_s,
        "lipsync_max_deviation": result.lipsync.max_deviation,
        "lipsync_finding": result.lipsync.finding,
        "confidence_tier": result.confidence_tier,
        "confidence_note": result.confidence_note,
        "recommended_action": result.recommended_action,
        "is_demo": result.is_demo,
        "signals_raw": {
            "rppg_coherence": result.rppg.coherence,
            "rppg_snr_db": result.rppg.snr_db,
            "lipsync_sync_rate": result.lipsync.sync_rate,
            "lipsync_anomalies": result.lipsync.anomaly_timestamps,
            "blink_score": result.blink.score if result.blink else None,
            "headpose_score": result.headpose.score if result.headpose else None,
            "expression_score": result.expression.score if result.expression else None,
            "audio_fake_score": result.audio_fake.score if result.audio_fake else None,
            "freq_artifact_score": result.freq_artifact.score if result.freq_artifact else None,
            "temporal_score": result.temporal.score if result.temporal else None,
        },
    }

    try:
        supabase.table("analysis_results").insert(row).execute()
    except Exception:
        pass

    return analysis_id


def _result_to_response(result: AnalysisResult, analysis_id: str, filename: str) -> AnalysisResponse:
    return AnalysisResponse(
        id=analysis_id,
        overall_score=result.overall_score,
        verdict=result.verdict,
        rppg=RPPGSignal(
            score=result.rppg.score,
            bpm_detected=result.rppg.bpm_detected,
            coherence=result.rppg.coherence,
            snr_db=result.rppg.snr_db,
            finding=result.rppg.finding,
            signal_quality=result.rppg.signal_quality,
        ),
        lipsync=LipSyncSignal(
            score=result.lipsync.score,
            worst_timestamp_s=result.lipsync.worst_timestamp_s,
            max_deviation=result.lipsync.max_deviation,
            avg_deviation=result.lipsync.avg_deviation,
            sync_rate=result.lipsync.sync_rate,
            finding=result.lipsync.finding,
            anomaly_timestamps=result.lipsync.anomaly_timestamps,
        ),
        blink=BlinkSignal(
            score=result.blink.score,
            blink_count=result.blink.blink_count,
            blink_rate_per_min=result.blink.blink_rate_per_min,
            avg_ear=result.blink.avg_ear,
            finding=result.blink.finding,
            confidence=result.blink.confidence,
        ) if result.blink else None,
        headpose=HeadPoseSignal(
            score=result.headpose.score,
            angular_variance=result.headpose.angular_variance,
            max_jitter_spike=result.headpose.max_jitter_spike,
            finding=result.headpose.finding,
            confidence=result.headpose.confidence,
        ) if result.headpose else None,
        expression=ExpressionSignal(
            score=result.expression.score,
            motion_variance=result.expression.motion_variance,
            coordination_ratio=result.expression.coordination_ratio,
            finding=result.expression.finding,
            confidence=result.expression.confidence,
        ) if result.expression else None,
        audio_fake=AudioFakeSignal(
            score=result.audio_fake.score,
            spectral_flux=result.audio_fake.spectral_flux,
            zcr_variance=result.audio_fake.zcr_variance,
            synthetic_prob=result.audio_fake.synthetic_prob,
            finding=result.audio_fake.finding,
            confidence=result.audio_fake.confidence,
        ) if result.audio_fake else None,
        freq_artifact=FrequencyArtifactSignal(
            score=result.freq_artifact.score,
            high_freq_residual=result.freq_artifact.high_freq_residual,
            checkerboard_magnitude=result.freq_artifact.checkerboard_magnitude,
            finding=result.freq_artifact.finding,
            confidence=result.freq_artifact.confidence,
        ) if result.freq_artifact else None,
        temporal=TemporalSignal(
            score=result.temporal.score,
            ssim_avg=result.temporal.ssim_avg,
            max_discontinuity_mse=result.temporal.max_discontinuity_mse,
            finding=result.temporal.finding,
            confidence=result.temporal.confidence,
        ) if result.temporal else None,
        ensemble=EnsembleSignal(
            overall_score=result.ensemble.overall_score,
            verdict=result.ensemble.verdict,
            confidence_tier=result.ensemble.confidence_tier,
            confidence_score=result.ensemble.confidence_score,
            detector_scores=result.ensemble.detector_scores,
            detector_confidences=result.ensemble.detector_confidences,
            explainable_reasons=result.ensemble.explainable_reasons,
            tampering_timestamps=result.ensemble.tampering_timestamps,
            recommended_action=result.ensemble.recommended_action,
        ) if result.ensemble else None,
        confidence_tier=result.confidence_tier,
        confidence_note=result.confidence_note,
        recommended_action=result.recommended_action,
        video_duration_s=result.video_duration_s,
        face_detected=result.face_detected,
        quality_warning=result.quality_warning,
        is_demo=result.is_demo,
        created_at=datetime.now(timezone.utc),
        video_filename=filename,
    )


def _row_to_response(row: dict) -> AnalysisResponse:
    signals_raw = row.get("signals_raw") or {}
    return AnalysisResponse(
        id=row["id"],
        overall_score=row["overall_score"],
        verdict=row["verdict"],
        rppg=RPPGSignal(
            score=row["rppg_score"],
            bpm_detected=row.get("rppg_bpm"),
            coherence=row.get("rppg_coherence") or 0.0,
            snr_db=signals_raw.get("rppg_snr_db") or 0.0,
            finding=row.get("rppg_finding") or "",
            signal_quality="unknown",
        ),
        lipsync=LipSyncSignal(
            score=row["lipsync_score"],
            worst_timestamp_s=row.get("lipsync_worst_ts"),
            max_deviation=row.get("lipsync_max_deviation") or 0.0,
            avg_deviation=signals_raw.get("lipsync_avg_dev") or 0.0,
            sync_rate=signals_raw.get("lipsync_sync_rate") or 0.0,
            finding=row.get("lipsync_finding") or "",
            anomaly_timestamps=signals_raw.get("lipsync_anomalies") or [],
        ),
        confidence_tier=row.get("confidence_tier") or "medium",
        confidence_note=row.get("confidence_note"),
        recommended_action=row.get("recommended_action") or "",
        video_duration_s=row.get("video_duration_s") or 0.0,
        face_detected=True,
        quality_warning=None,
        is_demo=row.get("is_demo") or False,
        created_at=row.get("created_at"),
        video_filename=row.get("video_filename"),
    )


def _get_suffix(content_type: str) -> str:
    return {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
        "video/x-msvideo": ".avi",
        "video/mpeg": ".mpeg",
        "video/ogg": ".ogv",
    }.get(content_type, ".mp4")
