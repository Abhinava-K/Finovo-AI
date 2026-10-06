import { apiClient } from './client'
import type { UnifiedPortfolioRequest, UnifiedPortfolioResponse } from '@/types/api'

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
