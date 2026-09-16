import { apiClient } from './client'
import type { CryptoRecommendRequest, CryptoRecommendResponse } from '@/types/api'

/**
 * POST /api/crypto/recommend
 *
 * Payload constraints (enforced by backend — match exactly):
 *   amount: float >= 1000, multiple of 100
 *   investment_horizon: "short-term" | "medium-term" | "long-term" (lowercase)
 *   max_drawdown: 20 | 50 | 80  — ONLY these three integer values
 *
 * NOTE: The frontend_guidelines.md incorrectly documents this as
 *       { amount, risk }. The actual backend uses investment_horizon + max_drawdown.
 */
export async function recommendCrypto(
  payload: CryptoRecommendRequest
): Promise<CryptoRecommendResponse> {
  const { data } = await apiClient.post<CryptoRecommendResponse>('/api/crypto/recommend', payload)
  return data
}
