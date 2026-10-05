import { apiClient } from './client'
import type { AgentChatRequest, AgentChatResponse } from '@/types/api'

/**
 * POST /api/agent/chat
 *
 * The backend uses a LangGraph ReAct agent with two tools:
 *   - search_mutual_funds_tool: queries MFAPI live, computes inception CAGR
 *   - get_crypto_price_tool: fetches live prices from CoinGecko
 *
 * Response.reply is a markdown string containing GFM tables and formatted text.
 * Always render using react-markdown + remark-gfm.
 *
 * This endpoint is SLOW (5–30s) due to LLM + tool calling. Handle accordingly.
 */
export async function chatWithAgent(payload: AgentChatRequest): Promise<AgentChatResponse> {
  const { data } = await apiClient.post<AgentChatResponse>('/api/agent/chat', payload)
  return data
}
