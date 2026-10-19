import { apiClient } from './client'
import type { AgentChatRequest, AgentChatResponse, SessionContextUploadResponse } from '@/types/api'

/**
 * POST /api/agent/chat
 *
 * The backend uses a LangGraph ReAct agent with dynamic tools:
 *   - search_mutual_funds_tool: queries MFAPI live, computes inception CAGR
 *   - get_crypto_price_tool: fetches live prices from CoinGecko
 *   - scrape_live_financial_news_and_sentiment_tool: real-time news RAG
 */
export async function chatWithAgent(payload: AgentChatRequest): Promise<AgentChatResponse> {
  const { data } = await apiClient.post<AgentChatResponse>('/api/agent/chat', payload)
  return data
}

/**
 * POST /api/agent/upload-session
 *
 * Ephemerally parses user-uploaded previous conversation transcript or portfolio capsule.
 * Runs Deep Learning sequence evaluation and returns personalization profile.
 */
export async function uploadSessionContext(sessionData: Record<string, any>): Promise<SessionContextUploadResponse> {
  const { data } = await apiClient.post<SessionContextUploadResponse>('/api/agent/upload-session', sessionData)
  return data
}
