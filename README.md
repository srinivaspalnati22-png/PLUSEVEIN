# Pulsevein — Multimodal Deepfake Reality Checker 🫀🔊

> **2026 AI Forensics Platform**: Detecting generative diffusion deepfakes via biological remote photoplethysmography (rPPG) and 3D lip-sync kinematic desynchronization analysis.

[![Live Deployment](https://img.shields.io/badge/Vercel-Live_Deployment-00f2fe?style=for-the-badge&logo=vercel)](https://frontend-ochre-kappa-13.vercel.app)
[![API Status](https://img.shields.io/badge/FastAPI-Backend_Active-00c896?style=for-the-badge&logo=fastapi)](http://127.0.0.1:8000)

---

## 🔗 Live Deployment & Links

* 🌐 **Live Web Application (Vercel)**: [https://frontend-ochre-kappa-13.vercel.app](https://frontend-ochre-kappa-13.vercel.app)
* ⚡ **Interactive API Documentation (FastAPI Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* 📖 **Demo Guide**: [DEMO_GUIDE.md](file:///c:/Users/srini/OneDrive/Desktop/PULSEVEIN/DEMO_GUIDE.md)
* 📄 **Technical Documentation**: [DOCUMENTATION.md](file:///c:/Users/srini/OneDrive/Desktop/PULSEVEIN/DOCUMENTATION.md)

---

## 🎯 The 2026 Problem & Innovation

In 2026, state-of-the-art diffusion models produce synthetic video without traditional pixel-level compression artifacts. Pulsevein solves this by inspecting **human biological signals that diffusion models fail to simulate**:

1. **rPPG Optical Pulse Extraction**: Sub-surface blood volume color oscillations in cheek/forehead skin (CHROM algorithm + FFT, 40–150 BPM).
2. **3D Lip-Sync Kinematics DSP**: Cross-correlation between MediaPipe 3D mouth aperture landmarks and librosa audio energy envelopes ($>120\text{ms}$ phase shift detection).
3. **8-Detector Multimodal Ensemble**: Combines cardiac coherence, eye blink dynamics, head pose, action unit facial movement, and 2D FFT spatial-frequency analysis.
4. **Mobile & Forensic Ready**: Fully responsive mobile UI, instant preloaded demo scenarios, and downloadable SHA-256 PDF forensic audit certificates.

---

## 🏗️ Technical Architecture

```
[User Browser / Mobile Device] 
         │
         ├──► React + Vite + Tailwind CSS (Responsive Frontend)
         │       └──► 3D Wireframe Canvas & Live Scan Overlay
         │
         └──► FastAPI Backend (Port 8000)
                 ├──► video_service.py (MediaPipe 3D FaceMesh + OpenCV)
                 ├──► rppg_service.py (CHROM Optical Filter + FFT)
                 ├──► lipsync_service.py (librosa RMS + Cross-Correlation)
                 └──► ai_service.py (Multimodal Score Fusion Engine)
```

---

## 🚀 Local Development Quickstart

### 1. Frontend Setup (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup (Port 8000)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

---

## 📱 Mobile Responsiveness Features

- Responsive navigation bar with mobile hamburger drawer and touch-friendly controls.
- Flexible auto-fit grid containers preventing horizontal scrolling on mobile viewports.
- Touch-enabled 3D forensic lab visualizer for touchscreens.
- Responsive mobile QR code sync modal for forensic report sharing across devices.
