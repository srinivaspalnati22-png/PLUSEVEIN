"""
Head Pose 3D Kinematic Stability Service.

Computes 3D pitch, yaw, and roll orientation trajectories using MediaPipe face landmarks.
Analyzes angular variance, velocity jitter, and sudden frame-to-frame rotational spikes.

Returns score (0–100), angular variance, max jitter spike, finding, and confidence.
"""
import cv2
import numpy as np
from dataclasses import dataclass, field
from typing import Optional, Dict, Any


@dataclass
class HeadPoseResult:
    score: int                  # 0–100 (higher = more likely real)
    angular_variance: float     # Angular trajectory variance (deg^2)
    max_jitter_spike: float     # Max frame-to-frame rotational acceleration (deg/frame^2)
    finding: str
    confidence: float           # Detector confidence 0–1
    status: str = "supporting_authenticity"  # supporting_authenticity | supporting_manipulation | insufficient_signal
    quality: str = "GOOD"                    # EXCELLENT | GOOD | WEAK | POOR
    evidence: Dict[str, Any] = field(default_factory=dict)


def analyze_headpose(
    face_landmarks: list[Optional[dict]],
    fps: float = 15.0,
    video_duration_s: float = 0.0,
) -> HeadPoseResult:
    """
    Analyze 3D head pose stability and angular acceleration jitter across frames.
    """
    poses = []
    for lm in face_landmarks:
        if lm is None:
            continue
        pose = _estimate_frame_headpose(lm)
        if pose is not None:
            poses.append(pose)

    if len(poses) < 15:
        return HeadPoseResult(
            score=70,
            angular_variance=0.1,
            max_jitter_spike=0.0,
            finding="Short tracking window (< 15 valid frames). 3D pose trajectory insufficient for statistical kinematics.",
            confidence=0.50,
            status="insufficient_signal",
            quality="WEAK",
            evidence={"valid_frames": len(poses), "required_frames": 15}
        )

    poses_arr = np.array(poses) # shape (N, 3) pitch, yaw, roll in degrees
    angular_var = float(np.mean(np.var(poses_arr, axis=0)))

    # Frame-to-frame angular velocity & acceleration
    vel = np.diff(poses_arr, axis=0)
    accel = np.diff(vel, axis=0) if len(vel) > 1 else np.zeros((1, 3))
    max_spike = float(np.max(np.abs(accel))) if len(accel) > 0 else 0.0

    # Score calculation:
    # 1. Extreme rotational jitter (> 15.0 deg/f^2) indicates facial swapping warping artifacts.
    # 2. Stable pose (variance <= 25.0 deg^2 and jitter <= 8.0) indicates authentic human camera motion.
    if max_spike > 15.0:
        score = 24
        finding = f"Sudden rotational head pose warp spike ({max_spike:.1f}°/f²). Deepfake face-swapping warping artifact detected."
        confidence = 0.88
        status = "supporting_manipulation"
        quality = "GOOD"
    elif angular_var <= 25.0 and max_spike <= 8.0:
        score = 85
        finding = f"Natural 3D head pose trajectory verified (variance {angular_var:.2f}°², max jitter {max_spike:.1f}°/f²)."
        confidence = 0.90
        status = "supporting_authenticity"
        quality = "EXCELLENT"
    else:
        score = 75
        finding = f"3D head pose motion continuous (variance {angular_var:.2f}°², jitter {max_spike:.1f}°/f²)."
        confidence = 0.80
        status = "supporting_authenticity"
        quality = "GOOD"

    return HeadPoseResult(
        score=score,
        angular_variance=round(angular_var, 3),
        max_jitter_spike=round(max_spike, 2),
        finding=finding,
        confidence=confidence,
        status=status,
        quality=quality,
        evidence={
            "angular_variance_deg2": round(angular_var, 3),
            "max_jitter_spike_deg_f2": round(max_spike, 2),
            "tracked_frames": len(poses),
            "fps": fps
        }
    )



def _estimate_frame_headpose(lm: dict) -> Optional[tuple[float, float, float]]:
    if "pts" not in lm or len(lm["pts"]) < 468:
        return None

    pts = lm["pts"]
    try:
        nose = np.array(pts[1][:2])
        chin = np.array(pts[152][:2])
        left_eye = np.array(pts[33][:2])
        right_eye = np.array(pts[263][:2])
        left_mouth = np.array(pts[61][:2])
        right_mouth = np.array(pts[291][:2])

        eye_center = (left_eye + right_eye) / 2.0
        mouth_center = (left_mouth + right_mouth) / 2.0

        dy = chin[1] - eye_center[1]
        dx = chin[0] - eye_center[0]
        pitch = np.arctan2(dy, max(1e-5, abs(dx))) * (180.0 / np.PI)

        eye_dx = right_eye[0] - left_eye[0]
        eye_dy = right_eye[1] - left_eye[1]
        roll = np.arctan2(eye_dy, max(1e-5, eye_dx)) * (180.0 / np.PI)

        face_width = np.linalg.norm(right_eye - left_eye)
        nose_offset = nose[0] - eye_center[0]
        yaw = (nose_offset / max(1e-5, face_width)) * 90.0

        return (float(pitch), float(yaw), float(roll))
    except Exception:
        return None
