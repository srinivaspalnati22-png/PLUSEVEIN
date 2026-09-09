"""
Probability Calibration and Confidence Estimation Layer for PULSEVEIN.

Implements:
1. Platt Scaling / Sigmoid Calibration: Maps raw detector ensemble scores (0–100)
   to calibrated posterior probabilities of authentic human biology P(Authentic | Evidence).
2. Detector Agreement Index: Measures cross-detector consensus (0.0 to 1.0).
3. Calibrated Confidence Estimator: Penalizes confidence when:
   - Data quality is low
   - Temporal duration is short
   - Detectors contradict one another
   - Key modalities (e.g. face/audio) are missing or degraded.
"""
import numpy as np
from typing import List, Dict, Tuple


class ForensicCalibrator:
    """
    Sigmoid / Platt scaling model fitted for multimodal deepfake detection.
    Maps raw ensemble score [0, 100] to posterior probability P(Authentic) in [0, 1].
    """
    # Calibration coefficients (A, B) calibrated to avoid forced binary decisions:
    # P(authentic) = 1 / (1 + exp(A * raw_score + B))
    # Tuned with a gradual slope around threshold 50 to prevent overconfident jumps.
    A: float = -0.065
    B: float = 3.25

    @classmethod
    def calibrate_probability(cls, raw_score: float) -> float:
        """
        Compute calibrated authenticity probability from 0.00 to 1.00.
        """
        # Linear shift into logit space
        z = cls.A * raw_score + cls.B
        # Sigmoid function
        prob = 1.0 / (1.0 + np.exp(z))
        return float(np.clip(prob, 0.02, 0.98))

    @classmethod
    def compute_detector_agreement(cls, detector_scores: Dict[str, int]) -> Tuple[float, int, int, str]:
        """
        Calculates consensus among active detectors.
        Returns:
            agreement_ratio: float (0.0–1.0)
            authentic_count: int
            manipulated_count: int
            consensus_status: 'STRONG_CONSENSUS' | 'MODERATE_CONSENSUS' | 'CONTRADICTORY'
        """
        if not detector_scores:
            return 0.5, 0, 0, "CONTRADICTORY"

        # Thresholds:
        # Score >= 55: supports authenticity
        # Score <= 45: supports manipulation
        # 46–54: neutral/inconclusive
        auth_votes = 0
        manip_votes = 0
        neutral_votes = 0

        for score in detector_scores.values():
            if score >= 55:
                auth_votes += 1
            elif score <= 45:
                manip_votes += 1
            else:
                neutral_votes += 1

        total_decisive = auth_votes + manip_votes
        if total_decisive == 0:
            return 0.5, 0, 0, "CONTRADICTORY"

        majority_votes = max(auth_votes, manip_votes)
        agreement_ratio = majority_votes / float(len(detector_scores))

        if agreement_ratio >= 0.75:
            consensus_status = "STRONG_CONSENSUS"
        elif agreement_ratio >= 0.55:
            consensus_status = "MODERATE_CONSENSUS"
        else:
            consensus_status = "CONTRADICTORY"

        return round(agreement_ratio, 2), auth_votes, manip_votes, consensus_status

    @classmethod
    def estimate_confidence(
        cls,
        authenticity_prob: float,
        detector_agreement: float,
        analysis_quality: int,
        duration_s: float,
        num_valid_detectors: int,
    ) -> Tuple[float, str, List[str]]:
        """
        Calculates calibrated confidence score (0.0 to 1.0) and tier ('high' | 'medium' | 'low').
        Applies explicit anti-overconfidence penalties.
        """
        penalties = []
        base_confidence = 0.88

        # 1. Detector Disagreement Penalty
        if detector_agreement < 0.55:
            penalty = (0.55 - detector_agreement) * 0.70
            base_confidence -= penalty
            penalties.append(f"Detectors disagree on authenticity (consensus: {detector_agreement:.0%})")
        elif detector_agreement < 0.70:
            base_confidence -= 0.08

        # 2. Input Media Quality Penalty
        if analysis_quality < 45:
            base_confidence -= 0.28
            penalties.append(f"Low input media quality ({analysis_quality}%) impedes signal precision")
        elif analysis_quality < 65:
            base_confidence -= 0.12

        # 3. Short Duration Penalty
        if duration_s < 3.0:
            base_confidence -= 0.22
            penalties.append(f"Short video duration ({duration_s:.1f}s) limits temporal signal convergence")
        elif duration_s < 6.0:
            base_confidence -= 0.08

        # 4. Limited Available Detectors Penalty
        if num_valid_detectors < 4:
            base_confidence -= 0.25
            penalties.append(f"Only {num_valid_detectors} forensic detectors produced valid measurements")
        elif num_valid_detectors < 6:
            base_confidence -= 0.10

        # 5. Borderline Probabilities (close to 0.50 are inherently less certain)
        uncertainty_distance = abs(authenticity_prob - 0.50) # 0.0 to 0.50
        if uncertainty_distance < 0.15:
            base_confidence -= 0.15
            penalties.append("Authenticity evidence is near the decision boundary")

        final_conf = float(np.clip(base_confidence, 0.15, 0.96))

        if final_conf >= 0.75:
            tier = "high"
        elif final_conf >= 0.50:
            tier = "medium"
        else:
            tier = "low"

        return round(final_conf, 2), tier, penalties
