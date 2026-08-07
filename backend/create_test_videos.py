"""
Generates synthetic known_real.mp4 and known_fake.mp4 test video clips
for deterministic automated regression testing of the forensic pipeline.
"""
import os
import cv2
import numpy as np
import wave
import struct
import subprocess

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "test_videos")
os.makedirs(OUTPUT_DIR, exist_ok=True)

REAL_PATH = os.path.join(OUTPUT_DIR, "known_real.mp4")
FAKE_PATH = os.path.join(OUTPUT_DIR, "known_fake.mp4")


def generate_test_videos():
    width, height = 640, 480
    fps = 15.0
    duration_s = 6.0
    n_frames = int(fps * duration_s)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")

    # 1. GENERATE KNOWN REAL VIDEO (Organic rPPG Green Pulse @ 72 BPM + Natural Lip Movement)
    out_real = cv2.VideoWriter(REAL_PATH, fourcc, fps, (width, height))

    for i in range(n_frames):
        t = i / fps
        # Pulse signal @ 1.2 Hz (72 BPM)
        pulse = float(np.sin(t * 1.2 * 2 * np.pi)) * 14.0

        # Organic skin texture base
        frame = np.ones((height, width, 3), dtype=np.uint8) * 160
        r_val = int(np.clip(210, 0, 255))
        g_val = int(np.clip(150 + pulse, 0, 255))
        b_val = int(np.clip(140, 0, 255))

        # Face Oval
        cv2.ellipse(frame, (320, 240), (130, 170), 0, 0, 360, (b_val, g_val, r_val), -1)

        # Eyes (Natural blink at frame 30..33)
        eye_open = 10 if not (30 <= i <= 33) else 2
        cv2.ellipse(frame, (270, 200), (22, eye_open), 0, 0, 360, (40, 40, 40), -1)
        cv2.ellipse(frame, (370, 200), (22, eye_open), 0, 0, 360, (40, 40, 40), -1)

        # Mouth Lip Movement
        mouth_open = int(10 + np.abs(np.sin(t * 3.0)) * 14)
        cv2.ellipse(frame, (320, 320), (32, mouth_open), 0, 0, 360, (50, 50, 180), -1)

        out_real.write(frame)

    out_real.release()
    print(f"[OK] Created: {REAL_PATH}")

    # 2. GENERATE KNOWN FAKE VIDEO (Zero Blood Pulse, Static Eyes, 2D FFT Upsampling Grid Noise)
    out_fake = cv2.VideoWriter(FAKE_PATH, fourcc, fps, (width, height))

    # High frequency checkerboard grid noise pattern common in generative upsampling
    grid = np.zeros((height, width, 3), dtype=np.uint8)
    grid[::4, ::4] = 120
    grid[2::4, 2::4] = 120

    for i in range(n_frames):
        frame = np.ones((height, width, 3), dtype=np.uint8) * 160
        # Synthetic static skin (R=210, G=150, B=140 with zero pulse variation)
        cv2.ellipse(frame, (320, 240), (130, 170), 0, 0, 360, (140, 150, 210), -1)

        # Add generative checkerboard grid noise
        frame = cv2.addWeighted(frame, 0.70, grid, 0.30, 0)

        # Static Frozen Eyes (Zero Blinks over 6.0s)
        cv2.ellipse(frame, (270, 200), (22, 10), 0, 0, 360, (40, 40, 40), -1)
        cv2.ellipse(frame, (370, 200), (22, 10), 0, 0, 360, (40, 40, 40), -1)

        # Static Lip (Zero Motion)
        cv2.ellipse(frame, (320, 320), (32, 8), 0, 0, 360, (50, 50, 180), -1)

        out_fake.write(frame)

    out_fake.release()
    print(f"[OK] Created: {FAKE_PATH}")


if __name__ == "__main__":
    generate_test_videos()
