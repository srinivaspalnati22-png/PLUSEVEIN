"""
Pipeline Debug & Verification Test Suite.

Executes Step 1-6 Deepfake Detection Instrumentation:
  1. Loads known_real.mp4 and known_fake.mp4.
  2. Runs pipeline end-to-end for BOTH test videos with detailed per-module instrumentation.
  3. Displays side-by-side diagnostic table.
  4. Verifies fusion formula weights & verdict threshold calibration.
"""
import sys
import os
import numpy as np

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.video_service import extract_and_process_video
from services.rppg_service import analyze_rppg
from services.lipsync_service import analyze_lipsync
from services.blink_service import analyze_blinks
from services.headpose_service import analyze_headpose
from services.expression_service import analyze_expressions
from services.audio_fake_service import analyze_audio_fake
from services.frequency_artifact_service import analyze_frequency_artifacts
from services.temporal_service import analyze_temporal_continuity
from services.ensemble_service import fuse_ensemble_predictions
from services.ai_service import _extract_audio


def inspect_video_modules(video_path: str):
    processed = extract_and_process_video(video_path, target_fps=15.0)
    audio_path = _extract_audio(video_path)

    results = []

    # 1. rPPG
    try:
        rppg = analyze_rppg(processed.face_rois, fps=15.0)
        conf_fake = round(1.0 - (rppg.score / 100.0), 3)
        cert = 0.90 if rppg.signal_quality != "poor" else 0.50
        raw_samples = f"Coh={rppg.coherence:.2f}, SNR={rppg.snr_db:.1f}dB, BPM={rppg.bpm_detected}"
        results.append(("rppg", rppg.score, conf_fake, cert, True, "None", raw_samples, rppg))
    except Exception as exc:
        results.append(("rppg", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # 2. LipSync
    try:
        lipsync = analyze_lipsync(audio_path, processed.face_landmarks, fps=15.0, video_duration_s=processed.meta.duration_s)
        conf_fake = round(1.0 - (lipsync.score / 100.0), 3)
        cert = 0.90 if lipsync.sync_rate > 0.3 else 0.50
        raw_samples = f"SyncRate={lipsync.sync_rate:.2f}, MaxDev={lipsync.max_deviation:.2f}, AvgDev={lipsync.avg_deviation:.2f}"
        results.append(("lipsync", lipsync.score, conf_fake, cert, True, "None", raw_samples, lipsync))
    except Exception as exc:
        results.append(("lipsync", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # 3. Blink
    try:
        blink = analyze_blinks(processed.face_landmarks, fps=15.0, video_duration_s=processed.meta.duration_s)
        conf_fake = round(1.0 - (blink.score / 100.0), 3)
        cert = round(blink.confidence, 2)
        raw_samples = f"Count={blink.blink_count}, Rate={blink.blink_rate_per_min:.1f}/m, AvgEAR={blink.avg_ear:.3f}"
        results.append(("blink", blink.score, conf_fake, cert, True, "None", raw_samples, blink))
    except Exception as exc:
        results.append(("blink", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # 4. HeadPose
    try:
        headpose = analyze_headpose(processed.face_landmarks, fps=15.0, video_duration_s=processed.meta.duration_s)
        conf_fake = round(1.0 - (headpose.score / 100.0), 3)
        cert = round(headpose.confidence, 2)
        raw_samples = f"Var={headpose.angular_variance:.3f}, Spike={headpose.max_jitter_spike:.1f}deg/f2, Conf={headpose.confidence:.2f}"
        results.append(("headpose", headpose.score, conf_fake, cert, True, "None", raw_samples, headpose))
    except Exception as exc:
        results.append(("headpose", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # 5. Expression
    try:
        expr = analyze_expressions(processed.face_landmarks, fps=15.0, video_duration_s=processed.meta.duration_s)
        conf_fake = round(1.0 - (expr.score / 100.0), 3)
        cert = round(expr.confidence, 2)
        raw_samples = f"Var={expr.motion_variance:.4f}, Symm={expr.coordination_ratio:.2f}, Conf={expr.confidence:.2f}"
        results.append(("expression", expr.score, conf_fake, cert, True, "None", raw_samples, expr))
    except Exception as exc:
        results.append(("expression", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # 6. Audio Fake
    try:
        audio_fake = analyze_audio_fake(audio_path, video_duration_s=processed.meta.duration_s)
        conf_fake = round(1.0 - (audio_fake.score / 100.0), 3)
        cert = round(audio_fake.confidence, 2)
        raw_samples = f"SynthProb={audio_fake.synthetic_prob:.2f}, Flux={audio_fake.spectral_flux:.4f}, ZCRVar={audio_fake.zcr_variance:.5f}"
        results.append(("audio_fake", audio_fake.score, conf_fake, cert, True, "None", raw_samples, audio_fake))
    except Exception as exc:
        results.append(("audio_fake", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # 7. Frequency Artifact
    try:
        freq = analyze_frequency_artifacts(processed.face_rois, fps=15.0)
        conf_fake = round(1.0 - (freq.score / 100.0), 3)
        cert = round(freq.confidence, 2)
        raw_samples = f"Checkerboard={freq.checkerboard_magnitude:.3f}, Res={freq.high_freq_residual:.3f}, Conf={freq.confidence:.2f}"
        results.append(("frequency_artifact", freq.score, conf_fake, cert, True, "None", raw_samples, freq))
    except Exception as exc:
        results.append(("frequency_artifact", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # 8. Temporal Continuity
    try:
        temporal = analyze_temporal_continuity(processed.face_rois, fps=15.0)
        conf_fake = round(1.0 - (temporal.score / 100.0), 3)
        cert = round(temporal.confidence, 2)
        raw_samples = f"SSIM={temporal.ssim_avg:.3f}, MaxMSE={temporal.max_discontinuity_mse:.1f}, Conf={temporal.confidence:.2f}"
        results.append(("temporal", temporal.score, conf_fake, cert, True, "None", raw_samples, temporal))
    except Exception as exc:
        results.append(("temporal", 0, 1.0, 0.0, False, str(exc)[:40], "None", None))

    # Cleanup temp audio
    try:
        os.remove(audio_path)
    except Exception:
        pass

    return results


def run_full_comparison():
    real_path = os.path.join(os.path.dirname(__file__), "test_videos", "known_real.mp4")
    fake_path = os.path.join(os.path.dirname(__file__), "test_videos", "known_fake.mp4")

    print("\n==========================================================================================")
    print("         END-TO-END PIPELINE DIAGNOSTIC INSTRUMENTATION TABLE (KNOWN REAL vs KNOWN FAKE)")
    print("==========================================================================================\n")

    real_results = inspect_video_modules(real_path)
    fake_results = inspect_video_modules(fake_path)

    header = f"{'module_name':<18} | {'KNOWN REAL (conf_fake)':<22} | {'KNOWN FAKE (conf_fake)':<22} | {'certainty':<10} | {'ran_ok':<8} | {'raw_features (fake samples)'}"
    print(header)
    print("-" * 125)

    for (r_name, r_score, r_cf, r_cert, r_ok, r_err, r_raw, r_obj), (f_name, f_score, f_cf, f_cert, f_ok, f_err, f_raw, f_obj) in zip(real_results, fake_results):
        r_str = f"{r_score}/100 (fake:{r_cf:.2f})"
        f_str = f"{f_score}/100 (fake:{f_cf:.2f})"
        print(f"{r_name:<18} | {r_str:<22} | {f_str:<22} | {f_cert:<10} | {str(f_ok):<8} | {f_raw}")

    # Fuse Ensemble Predictions
    r_objs = [res[7] for res in real_results]
    f_objs = [res[7] for res in fake_results]

    real_ens = fuse_ensemble_predictions(*r_objs)
    fake_ens = fuse_ensemble_predictions(*f_objs)

    print("\n--- ENSEMBLE FUSION SUMMARY ---")
    print(f"  KNOWN REAL CLIP  => Final Reality Score: {real_ens.overall_score}/100 | Verdict: {real_ens.verdict} | Conf: {real_ens.confidence_score}")
    print(f"  KNOWN FAKE CLIP  => Final Reality Score: {fake_ens.overall_score}/100 | Verdict: {fake_ens.verdict} | Conf: {fake_ens.confidence_score}")

    assert fake_ens.overall_score < real_ens.overall_score, "ERROR: Fake score is not lower than Real score!"
    assert fake_ens.verdict in ("FAKE", "LIKELY FAKE"), f"ERROR: Fake verdict is incorrect: {fake_ens.verdict}"
    assert real_ens.verdict in ("REAL", "LIKELY REAL"), f"ERROR: Real verdict is incorrect: {real_ens.verdict}"

    print("\n[SUCCESS] Pipeline diagnostic and score separation verified successfully!")


if __name__ == "__main__":
    run_full_comparison()
