import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Advisor | FinovoAI',
  description: 'Chat with an AI investment advisor powered by live market data from MFAPI and CoinGecko.',
}

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
