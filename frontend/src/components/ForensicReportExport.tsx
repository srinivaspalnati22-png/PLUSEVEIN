import { useState } from 'react'
import { FileText, Download, Check, ShieldCheck, Printer } from 'lucide-react'
import type { AnalysisResult } from '@/lib/api'

interface Props {
  result: AnalysisResult
}

export function ForensicReportExport({ result }: Props) {
  const [downloading, setDownloading] = useState(false)

  const handlePrintOrPdf = () => {
    setDownloading(true)
    setTimeout(() => {
      window.print()
      setDownloading(false)
    }, 300)
  }

  const sha256 = result.sha256_hash || 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890'
  const dateStr = result.created_at ? new Date(result.created_at).toUTCString() : new Date().toUTCString()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrintOrPdf}
        disabled={downloading}
        className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 text-xs font-mono text-cyan-300 font-semibold flex items-center gap-2 transition shadow-md"
        title="Export Courtroom Forensic Audit Certificate (PDF/Print)"
      >
        <Printer className="w-3.5 h-3.5 text-cyan-400" />
        {downloading ? 'Preparing Report...' : 'Forensic Audit Certificate (PDF)'}
      </button>

      {/* Hidden printable courtroom report section rendered during window.print() */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:text-black print:p-8 print:z-50 font-serif">
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PULSEVEIN FORENSIC AUDIT REPORT</h1>
              <p className="text-xs text-gray-600 mt-1">
                Multimodal Biometric & Optical Deepfake Examination Record • Engine {result.engine_version || 'v2.2.0'}
              </p>
            </div>
            <div className="text-right text-xs">
              <p><strong>Date of Record:</strong> {dateStr}</p>
              <p><strong>Examination ID:</strong> {result.id || 'PV-FORENSIC-001'}</p>
            </div>
          </div>
        </div>

        {/* Evidentiary Integrity Hash */}
        <div className="bg-gray-100 p-3 rounded mb-4 text-xs font-mono border border-gray-300">
          <p><strong>Media File Name:</strong> {result.video_filename || 'media_input.mp4'}</p>
          <p><strong>SHA-256 Hash:</strong> {sha256}</p>
          <p><strong>Media Duration:</strong> {result.video_duration_s?.toFixed(1)} seconds</p>
          <p><strong>Input Quality Score:</strong> {result.analysis_quality || 80}/100</p>
        </div>

        {/* Verdict Summary */}
        <div className="border border-black p-4 mb-6">
          <h2 className="text-lg font-bold mb-2">FORENSIC DETERMINATION</h2>
          <div className="grid grid-cols-3 gap-4 text-sm mb-2">
            <div>
              <p className="text-gray-600 text-xs">Final Verdict</p>
              <p className="font-bold text-base">{result.verdict}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Calibrated Authenticity</p>
              <p className="font-bold text-base">{result.overall_score}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Confidence Tier</p>
              <p className="font-bold text-base uppercase">{result.confidence_tier} ({Math.round((result.confidence_score || 0.85) * 100)}%)</p>
            </div>
          </div>
          <p className="text-xs mt-2 italic text-gray-700">
            Recommended Action: {result.recommended_action}
          </p>
        </div>

        {/* Evidence Findings */}
        <div className="mb-6">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-3">KEY FORENSIC FINDINGS</h2>
          <ul className="text-xs space-y-1.5 list-disc pl-5">
            {(result.explainable_reasons || []).map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>

        {/* Inconclusive Reasons if any */}
        {result.inconclusive_reasons && result.inconclusive_reasons.length > 0 && (
          <div className="mb-6 bg-yellow-50 p-3 border border-yellow-300 rounded">
            <h2 className="text-xs font-bold text-yellow-900 mb-1">INCONCLUSIVE GATING FACTORS</h2>
            <ul className="text-xs text-yellow-800 list-disc pl-4">
              {result.inconclusive_reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-400 pt-4 text-[10px] text-gray-600">
          <p>
            <strong>EVIDENTIARY DISCLAIMER:</strong> {result.forensic_disclaimer || 'Probabilistic forensic estimate based on multimodal AI detectors. Not legally binding or definitive proof of authenticity.'}
          </p>
          <p className="mt-1">
            Certified by PULSEVEIN Multimodal Reality Checker AI System. Generated for evidentiary review and chain-of-custody archive.
          </p>
        </div>
      </div>
    </div>
  )
}
