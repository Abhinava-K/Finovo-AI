// Re-export all API types
export * from './api'

// ─── Shared UI Types ─────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high'

export type InvestmentHorizon = 'short-term' | 'medium-term' | 'long-term'

export type MaxDrawdown = 20 | 50 | 80

export type Module = 'mutual-funds' | 'crypto' | 'advisor'

// ─── Chart Data Shapes ───────────────────────────────────────────────────────

export interface PieSlice {
  name: string
  value: number
  color: string
}

export interface ProjectionDataPoint {
  year: number
  conservative: number
  expected: number
  optimistic: number
  label?: string
}

export interface RebalancingChartPoint {
  phase: string
  equity: number
  midcap: number
  debt: number
}
