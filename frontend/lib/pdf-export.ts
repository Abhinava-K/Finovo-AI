export interface PDFExportOptions {
  filename?: string
  title?: string
  investorDetails?: string
}

/**
 * Captures an HTML element using the browser's native SVG foreignObject rendering engine (html-to-image)
 * and exports it into a high-DPI, pixel-perfect PDF document with 0 text baseline shift and 0 CSS distortion.
 */
export async function exportElementToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`)
  }

  // 1. Wait for custom web fonts (Inter, etc.) to be 100% loaded and measured
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready
  }

  const now = new Date()
  const fileTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)

  // 2. High-DPI Capture using native browser engine via html-to-image
  let dataUrl: string
  try {
    const { toPng } = await import('html-to-image')
    dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2, // 2x retina clarity
      backgroundColor: '#05091a',
      filter: (node) => {
        if (node instanceof HTMLElement) {
          if (node.classList?.contains('no-print') || node.tagName === 'BUTTON') {
            return false
          }
        }
        return true
      },
    })
  } catch (primaryErr) {
    console.warn('html-to-image failed, falling back to html2canvas:', primaryErr)
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#05091a',
      logging: false,
    })
    dataUrl = canvas.toDataURL('image/png')
  }

  // 3. Render into jsPDF preserving exact proportions
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load generated report image'))
    img.src = dataUrl
  })

  const imgWidth = 210 // A4 width in mm
  const imgHeight = (img.height * imgWidth) / img.width

  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF('p', 'mm', [imgWidth, Math.max(imgHeight, 297)])
  pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')

  const downloadName = options.filename || `finovo_portfolio_report_${fileTimestamp}.pdf`
  pdf.save(downloadName)
}
