/**
 * API type definitions — derived directly from backend source code.
 * DO NOT add fields that are not in the actual backend responses.
 *
 * Sources verified against:
 *   backend/app/api/mf_routes.py
 *   backend/app/api/crypto_routes.py
 *   backend/app/api/agent_routes.py
 *   backend/app/core/mf_engine.py
 *   backend/app/core/crypto_engine.py
 */

// ─── Mutual Fund Module ──────────────────────────────────────────────────────

/** Sent to POST /api/mf/recommend */
export interface MFRecommendRequest {
  age: number            // integer, strictly > 0
  amount: number         // float, >= 1000, multiple of 100
  risk: 'low' | 'medium' | 'high'
  duration_years: number // integer, strictly > 0
}

export interface MFAllocation {
  equity: number   // percentage, 0–100
  midcap: number
  debt: number
}

export interface TopFund {
  name: string
  fund_house: string
  category: 'equity' | 'midcap' | 'debt'
  cagr_inception: number  // e.g. 14.2 means 14.2%
}

export interface MFProjection {
  conservative: number  // absolute INR value
  expected: number
  optimistic: number
}

export interface RebalancingPhase {
  phase: string    // e.g. "Years 1-10"
  equity: number   // percentage for this phase
  midcap: number
  debt: number
}

/** Received from POST /api/mf/recommend */
export interface MFRecommendResponse {
  allocation: MFAllocation
  top_funds: TopFund[]
  projection: MFProjection
  rebalancing_plan: RebalancingPhase[]
}

// ─── Crypto Module ───────────────────────────────────────────────────────────

/** Sent to POST /api/crypto/recommend */
export interface CryptoRecommendRequest {
  amount: number                                              // >= 1000, multiple of 100
  investment_horizon: 'short-term' | 'medium-term' | 'long-term'
  max_drawdown: 20 | 50 | 80                                 // ONLY these three values
}

/** Dynamic coin → percentage map. Keys match exact coin names from backend. */
export type CryptoAllocation = Record<string, number>

export interface CryptoProjection {
  duration_years: number   // 1 | 2 | 5 depending on horizon
  conservative: number     // absolute value
  expected: number
  optimistic: number
}

export interface CryptoRiskAnalysis {
  volatility: 'Low' | 'Medium' | 'Very High'
  max_drawdown_limit: 20 | 50 | 80
  reasoning: string       // human-readable explanation from backend
}

/** Received from POST /api/crypto/recommend */
export interface CryptoRecommendResponse {
  allocation: CryptoAllocation
  projection: CryptoProjection
  risk_analysis: CryptoRiskAnalysis
}

// ─── AI Agent Module ─────────────────────────────────────────────────────────

/** Sent to POST /api/agent/chat */
export interface AgentChatRequest {
  query: string
}

/** Received from POST /api/agent/chat */
export interface AgentChatResponse {
  reply: string  // Markdown string — may contain GFM tables, bold, lists, disclaimers
}

// ─── API Error Types ─────────────────────────────────────────────────────────

/** FastAPI 422 validation error shape */
export interface FastAPIValidationError {
  detail: Array<{
    type: string
    loc: (string | number)[]
    msg: string
    input: unknown
  }>
}

/** FastAPI 500 error shape */
export interface FastAPIServerError {
  detail: string
}

// ─── Chat UI Types (not from backend — for frontend state) ───────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}
