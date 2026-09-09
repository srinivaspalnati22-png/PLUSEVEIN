"""
Temporal Frame Continuity & Flickering Analysis Service.

Evaluates frame-to-frame pixel continuity (Structural Similarity Index SSIM & Mean Squared Error MSE).

Deepfakes and AI face swaps produce:
  - Temporal flickering between adjacent frames
  - Unnatural skin boundary boundary warping gaps
  - Inconsistent facial illumination shifts across frames

Returns score (0–100), SSIM variance, max frame discontinuity MSE, and finding.
"""
import numpy as np
from dataclasses import dataclass
from typing import Optional


from dataclasses import dataclass, field
from typing import Optional, Dict, Any


@dataclass
class TemporalResult:
    score: int                  # 0–100 (higher = more likely real)
    ssim_avg: float             # Average frame-to-frame structural similarity
    max_discontinuity_mse: float# Max frame-to-frame pixel delta MSE
    finding: str
    confidence: float           # Detector confidence 0–1
    status: str = "supporting_authenticity"  # supporting_authenticity | supporting_manipulation | insufficient_signal
    quality: str = "GOOD"                    # EXCELLENT | GOOD | WEAK | POOR
    evidence: Dict[str, Any] = field(default_factory=dict)


def analyze_temporal_continuity(
    face_rois: list,
    fps: float = 15.0,
) -> TemporalResult:
    """
    Analyze frame-to-frame temporal structural continuity and flickering.
    """
    valid_rois = [r for r in face_rois if r is not None and r.size > 0]
    if len(valid_rois) < 10:
        return TemporalResult(
            score=65,
            ssim_avg=0.85,
            max_discontinuity_mse=0.0,
            finding="Insufficient face frames (< 10) to evaluate temporal structural continuity.",
            confidence=0.40,
            status="insufficient_signal",
            quality="POOR",
            evidence={"valid_face_frames": len(valid_rois), "min_required": 10}
        )

    mses = []
    ssims = []

    for i in range(len(valid_rois) - 1):
        roi1 = valid_rois[i]
        roi2 = valid_rois[i + 1]

        mse, ssim = _compute_pair_continuity(roi1, roi2)
        if mse is not None:
            mses.append(mse)
            ssims.append(ssim)

    if not mses:
        return TemporalResult(
            score=65,
            ssim_avg=0.85,
            max_discontinuity_mse=0.0,
            finding="Could not process frame pairs for temporal continuity analysis.",
            confidence=0.40,
            status="insufficient_signal",
            quality="POOR",
            evidence={"error": "Frame pair computation yielded empty results"}
        )

    avg_ssim = float(np.mean(ssims))
    max_mse = float(np.max(mses))
    mse_std = float(np.std(mses))

    # Score calculation
    # High frame-to-frame MSE variance with low SSIM indicates temporal flickering / boundary warping
    if avg_ssim < 0.65 or (max_mse > 45.0 and avg_ssim < 0.78):
        score = 25
        finding = f"Severe temporal frame discontinuity detected (max MSE {max_mse:.1f}, SSIM {avg_ssim:.2f}). High boundary flickering indicative of AI video synthesis."
        confidence = 0.85
        status = "supporting_manipulation"
        quality = "GOOD"
    elif max_mse > 25.0 and avg_ssim < 0.82:
        score = 48
        finding = f"Moderate temporal flickering detected (max MSE {max_mse:.1f}). Inconsistent illumination or face boundary warping present."
        confidence = 0.70
        status = "insufficient_signal"
        quality = "GOOD"
    else:
        score = 89
        finding = f"Smooth temporal frame continuity verified (SSIM {avg_ssim:.2f}, max MSE {max_mse:.1f}). Zero artificial frame boundary flickering detected."
        confidence = 0.88
        status = "supporting_authenticity"
        quality = "EXCELLENT" if len(valid_rois) >= 30 else "GOOD"


    return TemporalResult(
        score=score,
        ssim_avg=round(avg_ssim, 3),
        max_discontinuity_mse=round(max_mse, 2),
        finding=finding,
        confidence=confidence,
        status=status,
        quality=quality,
        evidence={
            "avg_ssim": round(avg_ssim, 3),
            "max_discontinuity_mse": round(max_mse, 2),
            "mse_std": round(mse_std, 2),
            "frame_pairs_analyzed": len(mses),
        }
    )



def _compute_pair_continuity(roi1: np.ndarray, roi2: np.ndarray) -> tuple[Optional[float], Optional[float]]:
    """Compute Mean Squared Error and structural similarity approximation between adjacent face ROIs."""
    try:
        g1 = np.mean(roi1, axis=2) if len(roi1.shape) == 3 else roi1
        g2 = np.mean(roi2, axis=2) if len(roi2.shape) == 3 else roi2

        # Resize roi2 to match roi1 shape if slightly different
        if g1.shape != g2.shape:
            h, w = g1.shape
            import cv2
            g2 = cv2.resize(g2, (w, h))

        mse = float(np.mean((g1.astype(float) - g2.astype(float)) ** 2))

        # Approximate SSIM
        c1 = (0.01 * 255) ** 2
        c2 = (0.03 * 255) ** 2
        m1, m2 = np.mean(g1), np.mean(g2)
        v1, v2 = np.var(g1), np.var(g2)
        cov = np.mean((g1 - m1) * (g2 - m2))

        ssim = float(((2 * m1 * m2 + c1) * (2 * cov + c2)) / ((m1**2 + m2**2 + c1) * (v1 + v2 + c2)))
        return mse, ssim
    except Exception:
        return None, None
