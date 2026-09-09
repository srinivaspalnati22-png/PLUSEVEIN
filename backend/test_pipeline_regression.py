"""
Automated Pipeline Regression Test Suite.

Asserts:
  1. Known fake sample video scores measurably LOWER (higher confidence_fake) than known real video.
  2. Known fake sample video triggers FAKE / LIKELY FAKE verdict.
  3. Preprocessing, rPPG color channels, 2D FFT, and Biological Veto rules remain lock-step calibrated.
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.rppg_service import analyze_rppg, RPPGResult
from services.lipsync_service import analyze_lipsync, LipSyncResult
from services.blink_service import analyze_blinks, BlinkResult
from services.headpose_service import analyze_headpose, HeadPoseResult
from services.expression_service import analyze_expressions, ExpressionResult
from services.audio_fake_service import analyze_audio_fake, AudioFakeResult
from services.frequency_artifact_service import analyze_frequency_artifacts, FrequencyArtifactResult
from services.temporal_service import analyze_temporal_continuity, TemporalResult
from services.ensemble_service import fuse_ensemble_predictions, EnsembleResult
from services.video_service import extract_and_process_video
from services.ai_service import _extract_audio


class TestPipelineRegression(unittest.TestCase):

    def setUp(self):
        self.real_path = os.path.join(os.path.dirname(__file__), "test_videos", "known_real.mp4")
        self.fake_path = os.path.join(os.path.dirname(__file__), "test_videos", "known_fake.mp4")
        self.assertTrue(os.path.exists(self.real_path), f"Missing test file: {self.real_path}")
        self.assertTrue(os.path.exists(self.fake_path), f"Missing test file: {self.fake_path}")

    def test_known_fake_scores_lower_than_known_real(self):
        # 1. Process Known Real Clip
        real_proc = extract_and_process_video(self.real_path, target_fps=15.0)
        real_audio = _extract_audio(self.real_path)

        rppg_real = analyze_rppg(real_proc.face_rois, fps=15.0)
        lipsync_real = analyze_lipsync(real_audio, real_proc.face_landmarks, fps=15.0, video_duration_s=real_proc.meta.duration_s)
        blink_real = analyze_blinks(real_proc.face_landmarks, fps=15.0, video_duration_s=real_proc.meta.duration_s)
        headpose_real = analyze_headpose(real_proc.face_landmarks, fps=15.0, video_duration_s=real_proc.meta.duration_s)
        expr_real = analyze_expressions(real_proc.face_landmarks, fps=15.0, video_duration_s=real_proc.meta.duration_s)
        audio_fake_real = analyze_audio_fake(real_audio, video_duration_s=real_proc.meta.duration_s)
        freq_real = analyze_frequency_artifacts(real_proc.face_rois, fps=15.0)
        temp_real = analyze_temporal_continuity(real_proc.face_rois, fps=15.0)

        real_ens = fuse_ensemble_predictions(
            rppg_real, lipsync_real, blink_real, headpose_real,
            expr_real, audio_fake_real, freq_real, temp_real
        )

        # 2. Process Known Fake Clip
        fake_proc = extract_and_process_video(self.fake_path, target_fps=15.0)
        fake_audio = _extract_audio(self.fake_path)

        rppg_fake = analyze_rppg(fake_proc.face_rois, fps=15.0)
        lipsync_fake = analyze_lipsync(fake_audio, fake_proc.face_landmarks, fps=15.0, video_duration_s=fake_proc.meta.duration_s)
        blink_fake = analyze_blinks(fake_proc.face_landmarks, fps=15.0, video_duration_s=fake_proc.meta.duration_s)
        headpose_fake = analyze_headpose(fake_proc.face_landmarks, fps=15.0, video_duration_s=fake_proc.meta.duration_s)
        expr_fake = analyze_expressions(fake_proc.face_landmarks, fps=15.0, video_duration_s=fake_proc.meta.duration_s)
        audio_fake_fake = analyze_audio_fake(fake_audio, video_duration_s=fake_proc.meta.duration_s)
        freq_fake = analyze_frequency_artifacts(fake_proc.face_rois, fps=15.0)
        temp_fake = analyze_temporal_continuity(fake_proc.face_rois, fps=15.0)

        fake_ens = fuse_ensemble_predictions(
            rppg_fake, lipsync_fake, blink_fake, headpose_fake,
            expr_fake, audio_fake_fake, freq_fake, temp_fake
        )

        # Cleanup audio files
        for p in [real_audio, fake_audio]:
            try:
                os.remove(p)
            except Exception:
                pass

        # REGRESSION ASSERTIONS
        self.assertLess(fake_ens.overall_score, real_ens.overall_score,
                        f"Fake video score ({fake_ens.overall_score}) is not lower than Real video score ({real_ens.overall_score})!")

        self.assertIn(fake_ens.verdict, ["FAKE", "LIKELY FAKE", "LIKELY MANIPULATED"],
                      f"Fake video failed to trigger fake verdict: {fake_ens.verdict}")


        self.assertLessEqual(fake_ens.overall_score, 35,
                             f"Fake video failed biological veto rule: {fake_ens.overall_score}")

        self.assertGreater(rppg_real.score, rppg_fake.score,
                           f"rPPG failed to differentiate real pulse ({rppg_real.score}) from fake ({rppg_fake.score})!")


if __name__ == "__main__":
    unittest.main()
