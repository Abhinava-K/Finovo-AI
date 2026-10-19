/**
 * API type definitions — derived directly from backend source code.
 *
 * Sources verified against:
 *   backend/app/api/portfolio_routes.py
 *   backend/app/api/mf_routes.py
 *   backend/app/api/crypto_routes.py
 *   backend/app/api/agent_routes.py
 *   backend/app/core/portfolio_engine.py
 *   backend/app/core/mf_engine.py
 *   backend/app/core/crypto_engine.py
 */

// ─── Unified TradFi + DeFi Portfolio Module ─────────────────────────────────

export interface UnifiedPortfolioRequest {
  age: number
  capital: number
  risk: 'low' | 'medium' | 'high'
  duration_years: number
  inflation_pct?: number
}

export interface UnifiedAllocationMatrix {
  equity_largecap: number
  equity_midcap: number
  equity_total: number
  debt_and_liquid: number
  gold_commodities: number
  crypto_assets: number
  sum_verification: number
}

export interface UnifiedProjection {
  initial_investment: number
  conservative_future_value: number
  expected_future_value: number
  optimistic_future_value: number
  real_purchasing_power: number
  assumed_inflation_pct: number
}

export interface UnifiedRebalancingPhase {
  phase: string
  equity_largecap: number
  equity_midcap: number
  debt: number
  gold: number
  crypto: number
  total_weight: number
}

export interface UnifiedPortfolioResponse {
  summary: {
    investor_age: number
    capital_amount: number
    risk_profile: string
    duration_years: number
    expected_blended_cagr: number
  }
  allocation_matrix: UnifiedAllocationMatrix
  financial_projections: UnifiedProjection
  lifecycle_rebalancing: UnifiedRebalancingPhase[]
  fiduciary_compliance: {
    crypto_capped_at_15_pct: boolean
    senior_capital_protected: boolean
    regulatory_disclaimer: string
  }
}

// ─── Mutual Fund Module ──────────────────────────────────────────────────────

/** Sent to POST /api/mf/recommend */
export interface MFRecommendRequest {
  age: number            // integer, strictly > 0
  amount: number         // float, >= 1000, multiple of 100
  risk: 'low' | 'medium' | 'high'
  duration_years: number // integer, strictly > 0
  session_data?: Record<string, any>
  is_executed?: boolean
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

export interface MarginalContext {
  is_personalized: boolean
  summary: {
    investor_current_age: number
    past_investment_age: number
    elapsed_years: number
    fresh_capital_deployed: number
    past_capital_initial: number
    past_capital_current_estimated: number
    total_consolidated_net_worth: number
    risk_profile: string
    duration_years: number
    is_executed: boolean
    marginal_expected_cagr: number
  }
  consolidated_allocation: {
    equity_largecap: number
    equity_midcap: number
    equity_total: number
    debt_and_liquid: number
    gold_commodities: number
    crypto_assets: number
    total_rupees_largecap: number
    total_rupees_midcap: number
    total_rupees_debt: number
    total_rupees_gold: number
    total_rupees_crypto: number
  }
  target_lifecycle_equilibrium: {
    equity_largecap: number
    equity_midcap: number
    equity_total: number
    debt_and_liquid: number
    gold_commodities: number
    crypto_assets: number
  }
  rebalance_alerts?: Array<{
    asset: string
    action: string
    excess_rupees: number
    reason: string
  }>
  adaptive_gamma?: number
  risk_drift_index?: number
  drift_classification?: string
}

/** Received from POST /api/mf/recommend */
export interface MFRecommendResponse {
  allocation: MFAllocation
  top_funds: TopFund[]
  projection: MFProjection
  rebalancing_plan: RebalancingPhase[]
  marginal_context?: MarginalContext
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

export interface HistoryTurn {
  role: 'user' | 'assistant'
  content: string
}

/** Sent to POST /api/agent/chat */
export interface AgentChatRequest {
  query: string
  history?: HistoryTurn[]
  session_context?: Record<string, any>
}

/** Received from POST /api/agent/chat */
export interface AgentChatResponse {
  reply: string  // Markdown string — may contain GFM tables, bold, lists, disclaimers
  structured_allocation?: Record<string, number>
  sum_invariant_verified?: boolean
  disclaimer_verified?: boolean
  latency_ms?: number
}

export interface SessionContextUploadResponse {
  status: string
  summary: string
  capital: number
  risk_profile: string
  adaptive_gamma: number
  risk_drift_index: number
  drift_classification: string
  previous_allocations: Record<string, number>
  rebalance_recommendations?: Array<{
    asset: string
    action: string
    target_pct: number
    reason: string
  }>
  source: string
}

export interface PersonalizePortfolioRequest {
  age?: number
  capital?: number
  risk?: 'low' | 'medium' | 'high'
  duration_years?: number
  inflation_pct?: number
  session_data?: Record<string, any>
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
