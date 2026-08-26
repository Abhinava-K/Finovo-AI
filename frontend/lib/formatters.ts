/**
 * Currency, percentage, and number formatters for Indian financial data.
 */

// ─── Currency ────────────────────────────────────────────────────────────────

/** Format INR with Indian number system (lakhs/crores) */
export function formatINR(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_00_00_000) {
      return `₹${(value / 1_00_00_000).toFixed(2)}Cr`
    }
    if (value >= 1_00_000) {
      return `₹${(value / 1_00_000).toFixed(2)}L`
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`
    }
    return `₹${value.toFixed(0)}`
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format compact currency for chart labels */
export function formatINRCompact(value: number): string {
  return formatINR(value, true)
}

// ─── Percentages ─────────────────────────────────────────────────────────────

/** Format percentage with sign prefix when positive */
export function formatPercent(value: number, decimals = 1, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/** Format CAGR with consistent decimals */
export function formatCAGR(value: number): string {
  return `${value.toFixed(1)}% p.a.`
}

// ─── Numbers ─────────────────────────────────────────────────────────────────

/** Format large numbers with Indian suffix */
export function formatNumber(value: number): string {
  if (value >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(2)} Cr`
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(2)} L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

// ─── Projection ──────────────────────────────────────────────────────────────

/**
 * Generate year-by-year projection data for the area chart.
 * Uses compound growth formula with three scenarios.
 */
export function generateProjectionData(
  principal: number,
  expectedCAGR: number,
  durationYears: number,
  scenarios: { conservative: number; expected: number; optimistic: number }
) {
  const points = []
  const steps = Math.min(durationYears, 30)

  for (let year = 0; year <= steps; year++) {
    points.push({
      year,
      conservative: Math.round(principal * Math.pow(1 + scenarios.conservative / 100 / 100, year * 100)),
      expected: Math.round(principal * Math.pow(1 + scenarios.expected / 100 / 100, year * 100)),
      optimistic: Math.round(principal * Math.pow(1 + scenarios.optimistic / 100 / 100, year * 100)),
    })
  }
  return points
}

/**
 * Interpolate projection from only final values (what the backend returns).
 * Assumes compound growth backwards to generate intermediate points.
 */
export function interpolateProjection(
  principal: number,
  projection: { conservative: number; expected: number; optimistic: number },
  durationYears: number
): Array<{ year: number; conservative: number; expected: number; optimistic: number }> {
  const points = []
  const n = durationYears

  for (let year = 0; year <= n; year++) {
    const t = year / n
    points.push({
      year,
      conservative: Math.round(principal + (projection.conservative - principal) * (Math.pow(t, 0.9))),
      expected: Math.round(principal + (projection.expected - principal) * (Math.pow(t, 0.88))),
      optimistic: Math.round(principal + (projection.optimistic - principal) * (Math.pow(t, 0.85))),
    })
  }
  return points
}

// ─── Date/Time ───────────────────────────────────────────────────────────────

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return date.toLocaleDateString('en-IN')
}

// ─── Investment horizon labels ────────────────────────────────────────────────

export const horizonLabels: Record<string, string> = {
  'short-term': 'Short-term (~1 year)',
  'medium-term': 'Medium-term (~2 years)',
  'long-term': 'Long-term (~5 years)',
}

export const drawdownLabels: Record<number, string> = {
  20: 'Conservative (max 20% loss)',
  50: 'Moderate (max 50% loss)',
  80: 'Aggressive (max 80% loss)',
}
