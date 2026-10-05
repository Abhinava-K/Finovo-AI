import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crypto Portfolio Advisor | FinovoAI',
  description: 'Build a risk-adjusted crypto portfolio powered by live CoinGecko data. Choose your drawdown tolerance and investment horizon.',
}

export default function CryptoLayout({ children }: { children: React.ReactNode }) {
  // Added 10% zoom wrapper. Revert this by changing back to <>{children}</>
  return <div style={{ zoom: 1.1 }}>{children}</div>
}
