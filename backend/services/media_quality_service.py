"""
Media Quality Assessment Service for PULSEVEIN.

Evaluates raw input media characteristics prior to deepfake forensic inference:
- Video resolution & aspect ratio
- Frame rate stability
- Total duration
- Face visibility & coverage ratio
- Illumination & brightness distribution
- Motion vectors & inter-frame camera stability
- Overall analysis quality index (0–100)

Provides actionable user guidance if quality is insufficient.
"""
import cv2
import numpy as np
from typing import List, Optional, Tuple, Dict, Any
from dataclasses import dataclass


@dataclass
class MediaQualityResult:
    resolution_w: int = 1280
    resolution_h: int = 720
    fps: float = 30.0
    duration_s: float = 10.0
    face_coverage_pct: float = 30.0     # Percentage of frame covered by face (0–100)
    lighting_score: float = 80.0        # 0–100 (sub-optimal lighting penalty)
    motion_stability: float = 85.0      # 0–100 (high = stable, low = heavy blur/motion)
    overall_quality_score: int = 80     # 0–100 composite analysis quality
    quality_tier: str = "GOOD"          # 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'
    is_sufficient: bool = True          # True if quality meets minimum threshold for reliable analysis
    guidance_tips: List[str] = None     # Actionable instructions to improve analysis quality

    def __init__(self, **kwargs):
        self.resolution_w = kwargs.get("resolution_w", kwargs.get("width", 1280))
        self.resolution_h = kwargs.get("resolution_h", kwargs.get("height", 720))
        self.fps = float(kwargs.get("fps", 30.0))
        self.duration_s = float(kwargs.get("duration_s", 10.0))
        
        coverage = kwargs.get("face_coverage_pct", None)
        if coverage is None:
            coverage = kwargs.get("face_coverage_ratio", 0.30) * 100.0
        self.face_coverage_pct = float(coverage)
        
        lighting = kwargs.get("lighting_score", kwargs.get("illumination_brightness", 80.0))
        self.lighting_score = float(lighting)
        
        motion = kwargs.get("motion_stability", None)
        if motion is None:
            motion = kwargs.get("motion_stability_score", 0.85) * 100.0
        self.motion_stability = float(motion)
        
        self.overall_quality_score = int(kwargs.get("overall_quality_score", kwargs.get("composite_score", 80)))
        self.quality_tier = str(kwargs.get("quality_tier", "GOOD"))
        self.is_sufficient = bool(kwargs.get("is_sufficient", self.overall_quality_score >= 40))
        
        guidance = kwargs.get("guidance_tips", kwargs.get("guidance", []))
        self.guidance_tips = list(guidance) if guidance else []

    @property
    def composite_score(self) -> int:
        return self.overall_quality_score

    @property
    def resolution_label(self) -> str:
        return f"{self.resolution_w}x{self.resolution_h}"

    @property
    def width(self) -> int:
        return self.resolution_w

    @property
    def height(self) -> int:
        return self.resolution_h

    @property
    def face_coverage_ratio(self) -> float:
        return self.face_coverage_pct / 100.0

    @property
    def face_detected_ratio(self) -> float:
        return 1.0 if self.is_sufficient else 0.5

    @property
    def illumination_brightness(self) -> float:
        return self.lighting_score

    @property
    def illumination_contrast(self) -> float:
        return 45.0

    @property
    def motion_stability_score(self) -> float:
        return self.motion_stability / 100.0

    @property
    def guidance(self) -> List[str]:
        return self.guidance_tips


MediaQualityAssessment = MediaQualityResult


def assess_media_quality(
    frames: List[np.ndarray],
    face_rois: List[Optional[np.ndarray]],
    width: int,
    height: int,
    fps: float,
    duration_s: float,
) -> MediaQualityResult:
    """
    Perform rigorous media quality assessment on decoded frames and face regions.
    """
    guidance = []
    num_frames = len(frames)

    if num_frames == 0 or width <= 0 or height <= 0:
        return MediaQualityResult(
            resolution_w=width,
            resolution_h=height,
            fps=fps,
            duration_s=duration_s,
            face_coverage_pct=0.0,
            lighting_score=0.0,
            motion_stability=0.0,
            overall_quality_score=0,
            quality_tier="POOR",
            is_sufficient=False,
            guidance_tips=["Video could not be decoded. Ensure the file contains a valid video stream."],
        )

    # 1. Face Coverage & Visibility
    valid_rois = [roi for roi in face_rois if roi is not None and roi.size > 0]
    face_detection_ratio = len(valid_rois) / float(num_frames) if num_frames > 0 else 0.0

    if valid_rois:
        avg_face_pixels = np.mean([roi.shape[0] * roi.shape[1] for roi in valid_rois])
        frame_pixels = max(1, width * height)
        face_coverage_pct = min(100.0, (avg_face_pixels / frame_pixels) * 100.0 * 2.5) # scaled for ROI
    else:
        face_coverage_pct = 0.0

    if face_detection_ratio < 0.40:
        guidance.append("Face detected in less than 40% of frames. Keep your face centered in frame.")
    elif face_coverage_pct < 12.0:
        guidance.append("Face is too small in the frame. Move closer to the camera for higher rPPG resolution.")

    # 2. Illumination & Lighting
    brightness_scores = []
    contrast_scores = []
    for f in frames[::max(1, num_frames // 15)]:
        if f is not None and f.size > 0:
            gray = cv2.cvtColor(f, cv2.COLOR_RGB2GRAY)
            mean_b = float(np.mean(gray))
            std_b = float(np.std(gray))
            brightness_scores.append(mean_b)
            contrast_scores.append(std_b)

    avg_brightness = np.mean(brightness_scores) if brightness_scores else 128.0
    avg_contrast = np.mean(contrast_scores) if contrast_scores else 45.0

    # Optimal brightness: 80–190. Penalize if too dark (<60) or overexposed (>220)
    if avg_brightness < 60:
        lighting_score = max(10.0, (avg_brightness / 60.0) * 50.0)
        guidance.append("Lighting is too dark. Increase ambient or front-facing illumination.")
    elif avg_brightness > 220:
        lighting_score = max(20.0, 100.0 - (avg_brightness - 220.0) * 2.5)
        guidance.append("Frame is overexposed. Reduce harsh backlighting or glare.")
    else:
        # Ideal range
        lighting_score = min(100.0, 70.0 + (avg_contrast / 64.0) * 30.0)

    # 3. Inter-frame Motion & Stability
    motion_diffs = []
    for i in range(1, min(20, num_frames)):
        f1 = cv2.cvtColor(frames[i - 1], cv2.COLOR_RGB2GRAY)
        f2 = cv2.cvtColor(frames[i], cv2.COLOR_RGB2GRAY)
        diff = float(np.mean(cv2.absdiff(f1, f2)))
        motion_diffs.append(diff)

    avg_motion = np.mean(motion_diffs) if motion_diffs else 5.0
    # Stability: lower motion is better for optical blood flow analysis
    motion_stability = max(10.0, min(100.0, 100.0 - avg_motion * 2.2))
    if motion_stability < 45.0:
        guidance.append("High camera or subject motion detected. Stabilize device to improve signal accuracy.")

    # 4. Duration & Frame Rate Checks
    if duration_s < 2.5:
        guidance.append(f"Duration ({duration_s:.1f}s) is too short. Record at least 3 to 10 seconds for reliable rPPG FFT analysis.")
    if fps < 10.0:
        guidance.append(f"Frame rate ({fps:.1f} FPS) is below minimum recommended 15 FPS.")

    # 5. Composite Quality Score
    coverage_weight = 0.35
    lighting_weight = 0.25
    motion_weight = 0.20
    duration_factor = min(1.0, duration_s / 5.0) * 0.20

    raw_quality = (
        (face_detection_ratio * 100.0) * coverage_weight
        + lighting_score * lighting_weight
        + motion_stability * motion_weight
        + (duration_factor * 100.0)
    )

    overall_quality_score = int(np.clip(raw_quality, 0, 100))

    if overall_quality_score >= 80:
        quality_tier = "EXCELLENT"
        is_sufficient = True
    elif overall_quality_score >= 60:
        quality_tier = "GOOD"
        is_sufficient = True
    elif overall_quality_score >= 40:
        quality_tier = "FAIR"
        is_sufficient = True
    else:
        quality_tier = "POOR"
        is_sufficient = False

    return MediaQualityResult(
        resolution_w=width,
        resolution_h=height,
        fps=round(fps, 1),
        duration_s=round(duration_s, 2),
        face_coverage_pct=round(face_coverage_pct, 1),
        lighting_score=round(lighting_score, 1),
        motion_stability=round(motion_stability, 1),
        overall_quality_score=overall_quality_score,
        quality_tier=quality_tier,
        is_sufficient=is_sufficient,
        guidance_tips=guidance,
    )
