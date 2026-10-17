'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportElementToPDF } from '@/lib/pdf-export'
import toast from 'react-hot-toast'

interface PrintWatermarkProps {
  moduleTitle: string
  investorDetails?: string
  targetElementId: string
  filenamePrefix?: string
}

export function ReportWatermark({
  moduleTitle,
  investorDetails,
  targetElementId,
  filenamePrefix = 'finovo_portfolio',
}: PrintWatermarkProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleDownloadPDF() {
    setIsGenerating(true)
    const toastId = toast.loading('Generating high-resolution PDF with FinovoAI watermark...')
    try {
      const now = new Date()
      const fileTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const filename = `${filenamePrefix}_report_${fileTimestamp}.pdf`

      await exportElementToPDF(targetElementId, {
        title: moduleTitle,
        investorDetails,
        filename,
      })

      toast.success('Portfolio PDF Report downloaded successfully!', { id: toastId })
    } catch (err: unknown) {
      console.error('PDF export error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to generate PDF: ${errorMsg}. Falling back to browser print.`, { id: toastId })
      // Fallback
      window.print()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      variant="glass"
      size="sm"
      className="no-print gap-2 text-foreground/90 hover:text-foreground border-white/10 hover:border-white/20 transition-all shadow-sm"
      title="Download high-resolution dark-mode PDF with FinovoAI watermark and exact timestamp"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span>Generating PDF…</span>
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5 text-blue-400" />
          <span>Download PDF Report</span>
        </>
      )}
    </Button>
  )
}
