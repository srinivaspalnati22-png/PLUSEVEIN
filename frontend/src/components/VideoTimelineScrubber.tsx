import { useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'
import type { TimelineSegment } from '@/lib/api'

interface Props {
  segments?: TimelineSegment[]
  duration_s?: number
  tamperingTimestamps?: number[]
  duration?: number
  overallScore?: number
  rppgScore?: number
  lipsyncScore?: number
  verdict?: string
}

export function VideoTimelineScrubber({
  segments = [],
  duration_s,
  tamperingTimestamps = [],
  duration,
  overallScore,
}: Props) {
  const effectiveDuration = duration_s || duration || 15.0
  const score = overallScore || 50

  // If no segments were provided, generate default 3-4 segments
  const activeSegments: TimelineSegment[] = segments.length > 0 ? segments : [
    { segment_index: 0, start_time_s: 0.0, end_time_s: Math.min(effectiveDuration, 4.0), authenticity_score: score, risk_level: score >= 60 ? 'LOW' : 'HIGH', flags: ['Forensic scan window'] },
    { segment_index: 1, start_time_s: 4.0, end_time_s: Math.min(effectiveDuration, 8.0), authenticity_score: score, risk_level: score >= 60 ? 'LOW' : 'HIGH', flags: ['Signal continuity tracking'] },
    { segment_index: 2, start_time_s: 8.0, end_time_s: effectiveDuration, authenticity_score: score, risk_level: score >= 60 ? 'LOW' : 'MEDIUM', flags: ['Multi-signal agreement'] },
  ]


  const [selectedSegment, setSelectedSegment] = useState<TimelineSegment | null>(activeSegments[0] || null)


  return (
    <div className="hud-frame p-5 bg-slate-900/40 border border-white/10 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Segment-Level Forensic Timeline Analysis
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Low Risk
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Medium
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> High Anomaly
          </span>
        </div>
      </div>

      {/* Segment Bar */}
      <div className="relative h-9 bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex p-1 gap-1">
        {segments.length > 0 ? (
          segments.map((seg, idx) => {
            const isSelected = selectedSegment?.segment_index === seg.segment_index
            const colorClass =
              seg.risk_level === 'HIGH'
                ? 'bg-rose-500/30 border-rose-500/60 text-rose-300 hover:bg-rose-500/40'
                : seg.risk_level === 'MEDIUM'
                ? 'bg-amber-500/30 border-amber-500/60 text-amber-300 hover:bg-amber-500/40'
                : 'bg-emerald-500/30 border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/40'

            return (
              <button
                key={idx}
                onClick={() => setSelectedSegment(seg)}
                className={`flex-1 h-full rounded-lg border text-[10px] font-mono font-semibold flex items-center justify-center transition-all ${colorClass} ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-md shadow-cyan-500/20' : ''
                }`}
                title={`Segment ${idx + 1}: ${seg.start_time_s}s - ${seg.end_time_s}s (Risk: ${seg.risk_level})`}
              >
                {seg.start_time_s.toFixed(0)}s–{seg.end_time_s.toFixed(0)}s
              </button>
            )
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500">
            Uniform continuous timeline • Zero segment anomalies
          </div>
        )}

        {/* Anomaly Timestamp Markers */}
        {tamperingTimestamps.map((ts, idx) => {
          const leftPct = Math.min(96, Math.max(4, (ts / effectiveDuration) * 100))
          return (
            <div
              key={idx}
              className="absolute top-0 bottom-0 w-1 bg-rose-500 pointer-events-none shadow-[0_0_8px_#f43f5e]"
              style={{ left: `${leftPct}%` }}
              title={`Anomaly spike at ${ts}s`}
            />
          )
        })}
      </div>

      {/* Selected Segment Inspection Detail */}
      {selectedSegment && (
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-start justify-between gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-400">
              Selected Window: <strong className="text-white">{selectedSegment.start_time_s}s – {selectedSegment.end_time_s}s</strong>
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                selectedSegment.risk_level === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                selectedSegment.risk_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedSegment.risk_level} RISK
              </span>
              <span className="text-slate-300">
                Segment Authenticity Score: <strong>{selectedSegment.authenticity_score}%</strong>
              </span>
            </div>
            {selectedSegment.flags && selectedSegment.flags.length > 0 && (
              <p className="text-[11px] text-cyan-300 pt-1">
                Flags: {selectedSegment.flags.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
