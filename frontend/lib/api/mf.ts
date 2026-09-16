import { apiClient } from './client'
import type { MFRecommendRequest, MFRecommendResponse } from '@/types/api'

/**
 * POST /api/mf/recommend
 *
 * Payload constraints (enforced by backend — match exactly):
 *   age: integer > 0
 *   amount: float >= 1000, multiple of 100
 *   risk: "low" | "medium" | "high" (lowercase)
 *   duration_years: integer > 0
 */
export async function recommendMF(payload: MFRecommendRequest): Promise<MFRecommendResponse> {
  const { data } = await apiClient.post<MFRecommendResponse>('/api/mf/recommend', payload)
  return data
}
