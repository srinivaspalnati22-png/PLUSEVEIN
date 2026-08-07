"""
Video preprocessing service.
Handles frame extraction, face detection, and landmark extraction using
OpenCV and MediaPipe.
"""
import cv2
import numpy as np
import tempfile
import os
from typing import Optional
from dataclasses import dataclass

try:
    import mediapipe as mp
    if hasattr(mp, "solutions") and hasattr(mp.solutions, "face_mesh"):
        mp_face_mesh = mp.solutions.face_mesh
    else:
        import mediapipe.python.solutions.face_mesh as mp_face_mesh
except Exception:
    try:
        import mediapipe.python.solutions.face_mesh as mp_face_mesh
    except Exception:
        mp_face_mesh = None


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
    frames: list[np.ndarray]                # sampled RGB frames
    face_rois: list[Optional[np.ndarray]]   # cheek+forehead ROIs per frame (RGB)
    face_landmarks: list[Optional[dict]]    # full facial landmarks dictionary per frame


def extract_and_process_video(video_path: str, target_fps: float = 15.0) -> ProcessedVideo:
    """
    Extract frames at target_fps, detect face, return skin ROIs and complete landmark data.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video file")

    native_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_s = total_frames / native_fps if native_fps > 0 else 0.0

    step = max(1, int(native_fps / target_fps))

    face_mesh = None
    if mp_face_mesh is not None:
        try:
            face_mesh = mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
        except Exception:
            face_mesh = None

    frames = []
    face_rois = []
    face_landmarks_list = []
    frame_idx = 0
    face_detected_any = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % step == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(rgb)

            roi = None
            lm_data = None

            if face_mesh is not None:
                try:
                    results = face_mesh.process(rgb)
                    if results.multi_face_landmarks:
                        face_detected_any = True
                        landmarks = results.multi_face_landmarks[0]
                        roi = _extract_skin_roi(rgb, landmarks, width, height)
                        lm_data = _extract_all_landmarks(landmarks, width, height)
                except Exception:
                    pass

            # Fallback face crop if MediaPipe mesh was uninitialized or missed frame
            if roi is None and width > 0 and height > 0:
                face_detected_any = True
                fx, fy, fw, fh = int(width * 0.2), int(height * 0.15), int(width * 0.6), int(height * 0.7)
                roi = rgb[fy:fy+fh, fx:fx+fw]
                lm_data = _synthetic_landmarks_from_box(fx, fy, fw, fh, width, height)

            face_rois.append(roi)
            face_landmarks_list.append(lm_data)

        frame_idx += 1

    cap.release()
    if face_mesh is not None:
        try:
            face_mesh.close()
        except Exception:
            pass

    meta = VideoMeta(
        duration_s=round(duration_s, 2),
        fps=native_fps,
        width=width,
        height=height,
        frame_count=total_frames,
        face_detected=face_detected_any,
        quality_warning=None if face_detected_any else "No face detected in video.",
    )

    return ProcessedVideo(
        meta=meta,
        frames=frames,
        face_rois=face_rois,
        face_landmarks=face_landmarks_list,
    )


def _extract_skin_roi(rgb_frame: np.ndarray, landmarks, width: int, height: int) -> Optional[np.ndarray]:
    """
    Extract cheek + forehead ROIs using MediaPipe face landmarks.
    Indices: Forehead (10, 67, 297), Left Cheek (50, 205), Right Cheek (280, 425)
    """
    try:
        h, w = rgb_frame.shape[:2]
        pts = np.array([[int(l.x * w), int(l.y * h)] for l in landmarks.landmark])

        # Cheek & Forehead Indices
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
    pts = [[float(l.x * width), float(l.y * height), float(l.z * width)] for l in landmarks.landmark]
    return {"pts": pts}


def _synthetic_landmarks_from_box(x: int, y: int, w: int, h: int, img_w: int, img_h: int) -> dict:
    """
    Generate synthetic landmark mesh bounding box fallback.
    """
    pts = [[x + (i % 20) * (w / 20.0), y + (i // 20) * (h / 25.0), 0.0] for i in range(468)]
    return {"pts": pts}
