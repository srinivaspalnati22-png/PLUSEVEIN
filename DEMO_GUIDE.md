# Pulsevein — Demo Guide (3–4 Minute Script)

---

## 0:00–0:20 — The Problem (20 seconds)

> "In 2026, AI-generated video is indistinguishable from reality at the pixel level. Every major deepfake detector built on visual artifacts has been defeated by modern diffusion models. Journalists, moderators, and everyday users have no reliable way to know what's real. Pulsevein solves this differently."

---

## 0:20–0:40 — Why Existing Solutions Fall Short (20 seconds)

> "Tools like Deepware and Microsoft Video Authenticator look at visual glitches — compression artifacts, face-stitching edges. Modern deepfakes have been specifically trained to eliminate those. SyncNet-based tools only look at one signal: lip sync. We need something harder to fake."

---

## 0:40–2:10 — Flagship Feature: Live Analysis (90 seconds)

**[Open browser to /analyze]**

> "Pulsevein cross-references two biometric signals that require simulating real human biology."

**[Drag-drop a video OR click a demo scenario]**

> "First, rPPG — remote photoplethysmography. Real human skin shows color oscillations driven by each heartbeat. MediaPipe finds the facial skin regions, we extract mean RGB values per frame, apply the CHROM algorithm — a peer-reviewed signal processing method — and run an FFT to find the dominant frequency. If it's in the 40–150 BPM range with high spectral coherence, the signal looks real."

> "Second, lip-sync coherence. We extract lip aperture time series from MediaPipe landmarks, compare it frame-by-frame against the audio energy envelope from librosa, and flag any frame where the deviation is more than 2 standard deviations above the mean."

**[Result appears]**

> "Here's the result: a 0–100 Reality Score, the verdict — in this case FAKE — and separate signal cards for each analysis. The rPPG score is 12 out of 100 — no consistent pulse detected. The lip-sync score is 26 — 31% sync rate with 7 deviations. We see the worst timestamp at 14.3 seconds."

> "Critically, we always show a confidence tier. If lighting is poor or the video is short, we say the signal quality is degraded — we never round up to a fake verdict we're not sure about."

---

## 2:10–3:10 — AI/ML Pipeline Explanation (60 seconds)

**[Point to the How It Works section on landing page, or explain verbally]**

> "No neural network was trained for this. The rPPG analysis is deterministic signal processing. The CHROM algorithm has been published and peer-reviewed since 2013. We're not asking judges to trust a black-box model — we're applying known physics of human biology."

> "The face and lip detection uses MediaPipe — Google's pre-trained landmark model. The audio analysis is librosa, the industry standard for Python audio DSP. The innovation is putting these together and making the output actually readable by a non-technical user."

---

## 3:10–3:40 — Dashboard (30 seconds)

**[Navigate to /dashboard]**

> "Every analysis is stored in Supabase with full RLS — users can only see their own data. The dashboard shows live stats: fakes detected, real verified, uncertain, average score. Each row links to the full forensic report."

---

## 3:40–4:00 — Close: Impact and Next Steps (20 seconds)

> "Pulsevein gives journalists, moderators, and everyday users a credible forensic tool — not a toy. It's honest about uncertainty, explains why in plain language, and gives you a recommended action. Next steps: training a lightweight neural classifier on top of the signal features, adding batch processing for news organizations, and a browser extension for inline checking of social media video."

---

## Demo Tips

- **Have a test video ready** (15–30 seconds, clear face, good lighting)
- **Use Demo scenarios** as backup — they load instantly and show all three verdict types
- **Emphasize the two-signal approach** — this is the differentiator judges will remember
- **Point to the confidence tier** — it shows intellectual honesty, not overconfidence

## Emergency: If Backend is Down

1. Click any Demo Mode button on the Analyze page
2. The demo result appears instantly with a clear orange "DEMO MODE" banner
3. Explain: "This is our preloaded fallback scenario — the signals and findings are realistic examples of what the live system produces"
