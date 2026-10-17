import type { MFRecommendResponse, CryptoRecommendResponse, ChatMessage } from '@/types/api'
import type { MFFormValues } from '@/lib/validators/mf'
import type { CryptoFormValues } from '@/lib/validators/crypto'

/**
 * Triggers a client-side download of a formatted JSON file
 */
export function downloadJSON(filename: string, data: object) {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generates and downloads a Mutual Fund Portfolio Capsule
 */
export function exportMFCapsule(request: MFFormValues, data: MFRecommendResponse) {
  const now = new Date()
  const timestampIso = now.toISOString()
  const timestampFile = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)

  const capsule = {
    capsule_type: 'MUTUAL_FUND_TRADFI',
    schema_version: '1.0',
    app_name: 'FinovoAI',
    timestamp: timestampIso,
    investor_profile: {
      age: request.age,
      investment_capital_inr: request.amount,
      horizon_years: request.duration_years,
      risk_appetite: request.risk,
    },
    market_regime_snapshot: {
      rbi_repo_rate_pct: 6.5,
      benchmark_index: 'NIFTY 50',
      data_source: 'MFAPI.in (Live Indian Mutual Funds Registry)',
    },
    portfolio_allocation: {
      equity_pct: data.allocation.equity,
      midcap_pct: data.allocation.midcap,
      debt_pct: data.allocation.debt,
      total_allocation_pct: data.allocation.equity + data.allocation.midcap + data.allocation.debt,
      equity_amount_inr: (data.allocation.equity / 100) * request.amount,
      midcap_amount_inr: (data.allocation.midcap / 100) * request.amount,
      debt_amount_inr: (data.allocation.debt / 100) * request.amount,
    },
    growth_projections: {
      tenure_years: request.duration_years,
      conservative_projection_inr: data.projection.conservative,
      expected_projection_inr: data.projection.expected,
      optimistic_projection_inr: data.projection.optimistic,
      expected_cagr_pct: Number(((Math.pow(data.projection.expected / request.amount, 1 / request.duration_years) - 1) * 100).toFixed(2)),
    },
    recommended_schemes: data.top_funds.map((fund) => ({
      name: fund.name,
      fund_house: fund.fund_house,
      category: fund.category,
      cagr_inception_pct: fund.cagr_inception,
    })),
    rebalancing_plan: data.rebalancing_plan,
    fiduciary_compliance: {
      disclaimer: 'Educational advisory only. Not SEBI-registered financial advice. Zero-knowledge local capsule.',
      data_policy: 'Zero-Database Architecture: FinovoAI stores zero user records on cloud servers.',
    },
  }

  downloadJSON(`finovo_mf_capsule_${timestampFile}.json`, capsule)
}

/**
 * Generates and downloads a Crypto Portfolio Capsule
 */
export function exportCryptoCapsule(request: CryptoFormValues, data: CryptoRecommendResponse) {
  const now = new Date()
  const timestampIso = now.toISOString()
  const timestampFile = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)

  const capsule = {
    capsule_type: 'CRYPTO_DEFI',
    schema_version: '1.0',
    app_name: 'FinovoAI',
    timestamp: timestampIso,
    investor_profile: {
      investment_capital_inr: request.amount,
      investment_horizon: request.investment_horizon,
      max_drawdown_tolerance_pct: request.max_drawdown,
      fiduciary_guardrail: 'Crypto capped at conservative risk bounds with volatility-adjusted sizing.',
    },
    market_regime_snapshot: {
      data_source: 'CoinGecko API (Live Global Crypto Feeds)',
      macro_sentiment: 'Real-Time Dynamic Market Feeds',
    },
    portfolio_allocation: Object.entries(data.allocation).map(([coin, pct]) => ({
      coin_name: coin,
      allocation_pct: pct,
      allocated_amount_inr: (pct / 100) * request.amount,
    })),
    risk_analysis: data.risk_analysis,
    growth_projections: {
      duration_years: data.projection.duration_years,
      conservative_inr: data.projection.conservative,
      expected_inr: data.projection.expected,
      optimistic_inr: data.projection.optimistic,
      expected_cagr_pct: Number(((Math.pow(data.projection.expected / request.amount, 1 / data.projection.duration_years) - 1) * 100).toFixed(2)),
    },
    fiduciary_compliance: {
      disclaimer: 'Educational advisory only. Not SEBI-registered financial advice. Highly volatile digital assets.',
      data_policy: 'Zero-Database Architecture: FinovoAI stores zero user records on cloud servers.',
    },
  }

  downloadJSON(`finovo_crypto_capsule_${timestampFile}.json`, capsule)
}

/**
 * Generates and downloads the Chat Conversation transcript as JSON
 */
export function exportChatTranscript(messages: ChatMessage[]) {
  const now = new Date()
  const timestampIso = now.toISOString()
  const timestampFile = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)

  const transcript = {
    export_type: 'AGENT_CHAT_TRANSCRIPT',
    schema_version: '1.0',
    app_name: 'FinovoAI Intelligence',
    exported_at: timestampIso,
    total_messages: messages.length,
    conversation: messages.map((m, index) => ({
      turn: index + 1,
      sender: m.role === 'user' ? 'Investor' : 'FinovoAI Advisor Agent',
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
    })),
    compliance_footer: {
      disclaimer: 'All AI responses are generated for educational purposes and do not constitute SEBI-registered financial advice.',
      privacy_notice: 'Zero-Database Architecture: This conversation was never stored on our cloud database.',
    },
  }

  downloadJSON(`finovo_chat_transcript_${timestampFile}.json`, transcript)
}
