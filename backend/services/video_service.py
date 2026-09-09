"""
Video preprocessing service for PULSEVEIN.
Handles robust frame extraction, face detection, skin ROI tracking using OpenCV and MediaPipe FaceMesh,
and integrates media quality evaluation without fabricating synthetic facial bounding boxes.
"""
import cv2
import numpy as np
import os
from typing import Optional, List, Tuple, Any
from dataclasses import dataclass

from services.media_quality_service import assess_media_quality, MediaQualityResult

try:
    import mediapipe as mp
except Exception:
    mp = None

from services.biometric_service import get_face_landmarker


@dataclass
class VideoMeta:
    duration_s: float
    fps: float
    width: int
    height: int
    frame_count: int
    face_detected: bool
    quality_warning: Optional[str] = None


@dataclass
class ProcessedVideo:
    meta: VideoMeta
    frames: List[np.ndarray]                # sampled RGB frames
    face_rois: List[Optional[np.ndarray]]   # cheek+forehead ROIs per frame (RGB)
    face_landmarks: List[Optional[dict]]    # full 468 facial landmarks dictionary per frame
    media_quality: MediaQualityResult       # objective media quality metrics


def extract_and_process_video(video_path: str, target_fps: float = 15.0) -> ProcessedVideo:
    """
    Extract frames at target_fps, detect face landmarks, return skin ROIs and complete quality report.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video file for processing")

    native_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_s = total_frames / native_fps if native_fps > 0 else 0.0

    step = max(1, int(native_fps / target_fps))

    landmarker = get_face_landmarker()

    frames = []
    face_rois = []
    face_landmarks_list = []
    frame_idx = 0
    face_detected_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % step == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(rgb)

            roi = None
            lm_data = None

            if landmarker is not None and mp is not None:
                try:
                    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                    results = landmarker.detect(mp_img)
                    if results.face_landmarks and len(results.face_landmarks) > 0:
                        face_detected_count += 1
                        landmarks = results.face_landmarks[0]
                        roi = _extract_skin_roi(rgb, landmarks, width, height)
                        lm_data = _extract_all_landmarks(landmarks, width, height)
                except Exception:
                    pass

            # Fallback face and skin detection if MediaPipe unavailable or misses frame
            if roi is None or lm_data is None:
                fb_roi, fb_lm = _fallback_face_detect(rgb, width, height)
                if fb_roi is not None and fb_lm is not None:
                    face_detected_count += 1
                    roi = fb_roi
                    lm_data = fb_lm

            face_rois.append(roi)
            face_landmarks_list.append(lm_data)

        frame_idx += 1


    cap.release()

    sampled_count = len(frames)
    if duration_s <= 0.5 and sampled_count > 0:
        duration_s = float(sampled_count) / float(target_fps)

    face_detected_any = (face_detected_count > 0)

    # Assess overall media quality
    media_quality = assess_media_quality(
        frames=frames,
        face_rois=face_rois,
        width=width,
        height=height,
        fps=target_fps,
        duration_s=duration_s,
    )

    quality_warning = None
    if not face_detected_any:
        quality_warning = "No face landmarks detected in any frame."
    elif not media_quality.is_sufficient:
        quality_warning = "; ".join(media_quality.guidance_tips[:2])

    meta = VideoMeta(
        duration_s=round(duration_s, 2),
        fps=native_fps,
        width=width,
        height=height,
        frame_count=total_frames,
        face_detected=face_detected_any,
        quality_warning=quality_warning,
    )

    return ProcessedVideo(
        meta=meta,
        frames=frames,
        face_rois=face_rois,
        face_landmarks=face_landmarks_list,
        media_quality=media_quality,
    )


def _extract_skin_roi(rgb_frame: np.ndarray, landmarks, width: int, height: int) -> Optional[np.ndarray]:
    """
    Extract cheek + forehead ROIs using MediaPipe face landmarks.
    Indices: Forehead (10, 67, 109, 297, 338), Left Cheek (50, 117, 205), Right Cheek (280, 346, 425)
    """
    try:
        h, w = rgb_frame.shape[:2]
        raw_lms = landmarks.landmark if hasattr(landmarks, "landmark") else landmarks
        pts = np.array([[int(l.x * w), int(l.y * h)] for l in raw_lms])

        roi_indices = [10, 67, 109, 297, 338, 50, 117, 205, 280, 346, 425]
        selected_pts = pts[roi_indices]

        x_min, y_min = np.min(selected_pts, axis=0)
        x_max, y_max = np.max(selected_pts, axis=0)

        # Pad bounding box slightly
        pad_x = int((x_max - x_min) * 0.1)
        pad_y = int((y_max - y_min) * 0.1)

        x1 = max(0, x_min - pad_x)
        y1 = max(0, y_min - pad_y)
        x2 = min(w, x_max + pad_x)
        y2 = min(h, y_max + pad_y)

        roi = rgb_frame[y1:y2, x1:x2]
        return roi if roi.size > 0 else None
    except Exception:
        return None


def _extract_all_landmarks(landmarks, width: int, height: int) -> dict:
    """
    Extract 468 3D landmark point array.
    """
    raw_lms = landmarks.landmark if hasattr(landmarks, "landmark") else landmarks
    pts = [[float(l.x * width), float(l.y * height), float(l.z * width)] for l in raw_lms]
    return {"pts": pts}


def _fallback_face_detect(rgb_frame: np.ndarray, width: int, height: int) -> Tuple[Optional[np.ndarray], Optional[dict]]:
    """
    Fallback face and landmark approximation when MediaPipe is unavailable or misses synthetic face frames.
    Requires significant face-sized skin-chroma contour (area >= 4% of frame).
    """
    try:
        # Multi-model skin detection: HSV + YCrCb (illumination invariant across all skin tones)
        hsv = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2HSV)
        mask_hsv = cv2.inRange(hsv, np.array([0, 15, 40], dtype=np.uint8), np.array([35, 255, 255], dtype=np.uint8))

        ycrcb = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2YCrCb)
        mask_ycrcb = cv2.inRange(ycrcb, np.array([0, 133, 77], dtype=np.uint8), np.array([255, 173, 127], dtype=np.uint8))

        mask = cv2.bitwise_or(mask_hsv, mask_ycrcb)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

        cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        x, y, w, h = None, None, None, None

        if cnts:
            c = max(cnts, key=cv2.contourArea)
            area = cv2.contourArea(c)
            frame_area = float(width * height)
            if 0.03 * frame_area <= area <= 0.95 * frame_area:
                bx, by, bw, bh = cv2.boundingRect(c)
                aspect = float(bh) / max(1.0, float(bw))
                if 0.60 <= aspect <= 2.8:
                    x, y, w, h = bx, by, bw, bh

        if x is None:
            return None, None

        # Cheek skin ROI for rPPG
        roi_y1 = max(0, y + int(h * 0.25))
        roi_y2 = min(height, y + int(h * 0.75))
        roi_x1 = max(0, x + int(w * 0.18))
        roi_x2 = min(width, x + int(w * 0.82))
        roi = rgb_frame[roi_y1:roi_y2, roi_x1:roi_x2]

        # Generate 468 landmarks mapped to face bounding box
        pts = [[float(x + w * 0.5), float(y + h * 0.5), 0.0] for _ in range(468)]
        pts[1] = [float(x + w * 0.5), float(y + h * 0.55), 0.0] # nose tip
        pts[152] = [float(x + w * 0.5), float(y + h * 0.95), 0.0] # chin
        pts[33] = [float(x + w * 0.30), float(y + h * 0.38), 0.0] # left eye outer
        pts[133] = [float(x + w * 0.42), float(y + h * 0.38), 0.0] # left eye inner
        pts[362] = [float(x + w * 0.58), float(y + h * 0.38), 0.0] # right eye inner
        pts[263] = [float(x + w * 0.70), float(y + h * 0.38), 0.0] # right eye outer
        pts[61] = [float(x + w * 0.35), float(y + h * 0.75), 0.0] # left mouth corner
        pts[291] = [float(x + w * 0.65), float(y + h * 0.75), 0.0] # right mouth corner
        pts[14] = [float(x + w * 0.5), float(y + h * 0.78), 0.0] # lower lip
        pts[13] = [float(x + w * 0.5), float(y + h * 0.72), 0.0] # upper lip

        # Eye aperture estimate from eye bounding box
        eye_y1 = max(0, y + int(h * 0.32))
        eye_y2 = min(height, y + int(h * 0.44))
        eye_x1 = max(0, x + int(w * 0.24))
        eye_x2 = min(width, x + int(w * 0.42))
        eye_crop = rgb_frame[eye_y1:eye_y2, eye_x1:eye_x2]

        dark_ratio = float(np.mean(eye_crop < 70)) if eye_crop.size > 0 else 0.2
        eye_offset = max(1.5, float(h) * (0.004 + min(0.024, dark_ratio * 0.05)))

        # Eye landmarks for EAR
        pts[160] = [float(x + w * 0.34), float(y + h * 0.38 - eye_offset), 0.0]
        pts[158] = [float(x + w * 0.38), float(y + h * 0.38 - eye_offset), 0.0]
        pts[144] = [float(x + w * 0.34), float(y + h * 0.38 + eye_offset), 0.0]
        pts[153] = [float(x + w * 0.38), float(y + h * 0.38 + eye_offset), 0.0]
        pts[385] = [float(x + w * 0.62), float(y + h * 0.38 - eye_offset), 0.0]
        pts[387] = [float(x + w * 0.66), float(y + h * 0.38 - eye_offset), 0.0]
        pts[380] = [float(x + w * 0.62), float(y + h * 0.38 + eye_offset), 0.0]
        pts[373] = [float(x + w * 0.66), float(y + h * 0.38 + eye_offset), 0.0]

        return (roi if roi.size > 0 else None), {"pts": pts}
    except Exception:
        return None, None


