'use client'

import { useState, useEffect } from 'react'
import { Printer, ShieldCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PrintWatermarkProps {
  moduleTitle: string
  investorDetails?: string
}

export function ReportWatermark({ moduleTitle, investorDetails }: PrintWatermarkProps) {
  const [printTimestamp, setPrintTimestamp] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')

  function updateTimestampAndPrint() {
    const now = new Date()
    // Exact timestamp with Date, Hours, Minutes, Seconds, and Timezone
    const fullDateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const fullTimeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    const code = 'FNV-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + now.getSeconds()

    setPrintTimestamp(`${fullDateStr} at ${fullTimeStr}`)
    setVerificationCode(code)

    // Trigger native browser Print-to-PDF after state updates
    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Pre-populate timestamp on mount
  useEffect(() => {
    const now = new Date()
    setPrintTimestamp(
      now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' at ' +
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    )
    setVerificationCode('FNV-' + Math.random().toString(36).substring(2, 8).toUpperCase())
  }, [])

  return (
    <>
      {/* ─── Printable Document Header (Appears only on Print-to-PDF) ───────── */}
      <div className="print-only-watermark mb-6 pb-4 border-b-2 border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">FINOVO AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                Verified Intelligence
              </span>
            </div>
            <p className="text-sm font-bold text-slate-700 mt-1">{moduleTitle}</p>
            {investorDetails && (
              <p className="text-xs text-slate-500 mt-0.5">{investorDetails}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-600 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Generated: <span className="font-mono font-bold text-slate-900">{printTimestamp}</span>
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Cert ID: {verificationCode}
            </p>
            <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">
              ✓ Zero-Knowledge Local Architecture
            </p>
          </div>
        </div>
      </div>

      {/* ─── Printable Document Footer & Watermark (Appears at bottom on Print) ── */}
      <div className="print-only-watermark mt-8 pt-4 border-t-2 border-slate-300 text-slate-600">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            FINOVOAI VERIFIED ADVISORY • ZERO-KNOWLEDGE ARCHITECTURE
          </div>
          <div className="font-mono text-slate-500">
            Timestamp: {printTimestamp}
          </div>
        </div>
        <p className="text-[9px] text-slate-500 leading-relaxed mt-2">
          Regulatory Disclaimer: This advisory summary is mathematically synthesized for educational and personal portfolio planning purposes only.
          FinovoAI is not a SEBI-registered investment advisor. Live data sourced from MFAPI.in and CoinGecko. Past historical returns do not guarantee future performance.
        </p>
      </div>

      {/* ─── Action Button for UI (Hidden during Print) ─────────────────────── */}
      <Button
        onClick={updateTimestampAndPrint}
        variant="glass"
        size="sm"
        className="no-print gap-2 text-foreground/90 hover:text-foreground border-white/10 hover:border-white/20"
        title="Download high-resolution printable PDF with FinovoAI watermark and exact timestamp"
      >
        <Printer className="w-3.5 h-3.5 text-blue-400" />
        Print to PDF
      </Button>
    </>
  )
}
