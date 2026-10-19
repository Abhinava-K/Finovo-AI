import { apiClient } from './client'
import type { UnifiedPortfolioRequest, UnifiedPortfolioResponse, PersonalizePortfolioRequest } from '@/types/api'

/**
 * POST /api/portfolio/recommend
 *
 * Calculates a unified Modern Portfolio Theory allocation across
 * Equity Mutual Funds, Debt, Gold, and Crypto assets.
 */
export async function getUnifiedPortfolio(payload: UnifiedPortfolioRequest): Promise<UnifiedPortfolioResponse> {
  const { data } = await apiClient.post<UnifiedPortfolioResponse>('/api/portfolio/recommend', payload)
  return data
}

/**
 * POST /api/portfolio/personalize
 *
 * Ephemeral Deep Learning Personalization via Azure ML / Sequence Encoder.
 * Ingests past session data (transcript or capsule) to compute Adaptive Merton Gamma and Risk Drift.
 */
export async function personalizePortfolio(payload: PersonalizePortfolioRequest): Promise<UnifiedPortfolioResponse> {
  const { data } = await apiClient.post<UnifiedPortfolioResponse>('/api/portfolio/personalize', payload)
  return data
}
