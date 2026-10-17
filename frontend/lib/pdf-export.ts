import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export interface PDFExportOptions {
  filename?: string
  title?: string
  investorDetails?: string
}

/**
 * Captures an HTML element and exports it as a high-resolution, pixel-perfect PDF
 * with FinovoAI watermark, exact timestamp down to the second, and compliance footer.
 */
export async function exportElementToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`)
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  const exactTimestamp = `${dateStr} at ${timeStr}`
  const fileTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const certId = 'FNV-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + now.getSeconds()

  // 1. Create temporary wrapper to inject high-res header & watermark banner
  const clonedElement = element.cloneNode(true) as HTMLElement

  // Remove any buttons or interactive elements from the clone
  clonedElement.querySelectorAll('button, .no-print').forEach((node) => node.remove())

  // Create official certified header
  const headerDiv = document.createElement('div')
  headerDiv.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  `
  headerDiv.innerHTML = `
    <div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1;">FINOVO AI</span>
        <span style="display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; font-size: 10px; font-weight: 800; background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1; vertical-align: middle;">
          <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #38bdf8;"></span>
          VERIFIED ADVISOR
        </span>
      </div>
      <p style="font-size: 13px; font-weight: 700; color: #94a3b8; margin: 4px 0 0 0;">
        ${options.title || 'Portfolio Blueprint & Quantitative Wealth Projections'}
      </p>
      ${options.investorDetails ? `<p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">${options.investorDetails}</p>` : ''}
    </div>
    <div style="text-align: right;">
      <p style="font-size: 11px; font-weight: 600; color: #cbd5e1; margin: 0;">
        Generated: <span style="font-family: monospace; font-weight: 700; color: #38bdf8;">${exactTimestamp}</span>
      </p>
      <p style="font-size: 10px; font-family: monospace; color: #64748b; margin: 2px 0 0 0;">
        Cert ID: ${certId}
      </p>
      <p style="font-size: 9px; color: #34d399; font-weight: 600; margin: 2px 0 0 0;">
        ✓ Zero-Knowledge Architecture (0-Database Cloud Retention)
      </p>
    </div>
  `

  // Create watermark & compliance footer
  const footerDiv = document.createElement('div')
  footerDiv.style.cssText = `
    margin-top: 24px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
  `
  footerDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 700; color: #cbd5e1; letter-spacing: 0.5px;">
      <span>🔒 FINOVOAI VERIFIED ADVISORY • ZERO-KNOWLEDGE ARCHITECTURE</span>
      <span style="font-family: monospace; color: #94a3b8;">STAMP: ${exactTimestamp}</span>
    </div>
    <p style="font-size: 9px; color: #64748b; line-height: 1.4; margin: 6px 0 0 0;">
      Regulatory Disclaimer: This investment advisory summary is generated strictly for educational and portfolio planning purposes.
      FinovoAI is not a SEBI-registered investment advisor. Recommendations are calculated from live quantitative feeds (MFAPI.in / CoinGecko). Past performance does not guarantee future returns.
    </p>
  `

  // Offscreen container with precise styling to ensure 100% fidelity
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1050px;
    background: #05091a;
    color: #dde4f1;
    padding: 32px;
    border-radius: 16px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  `

  // Embedded reset styles for high-fidelity canvas capture
  const styleTag = document.createElement('style')
  styleTag.textContent = `
    * { box-sizing: border-box !important; }
    .tabular { font-variant-numeric: tabular-nums !important; font-feature-settings: "tnum" !important; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important; }
    p, span, h1, h2, h3, div { -webkit-font-smoothing: antialiased; }
  `
  container.appendChild(styleTag)
  container.appendChild(headerDiv)
  container.appendChild(clonedElement)
  container.appendChild(footerDiv)
  document.body.appendChild(container)

  try {
    // 2. High-DPI Canvas Capture (scale: 2 for ultra-sharp vector-like rendering)
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#05091a',
      logging: false,
      windowWidth: 1200,
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // 3. Create PDF with exact dimensions
    const orientation = imgHeight > pageHeight ? 'p' : 'p'
    const pdf = new jsPDF(orientation, 'mm', [imgWidth, Math.max(imgHeight, pageHeight)])

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')

    const downloadName = options.filename || `finovo_portfolio_report_${fileTimestamp}.pdf`
    pdf.save(downloadName)
  } finally {
    document.body.removeChild(container)
  }
}
