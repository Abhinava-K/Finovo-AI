import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mutual Fund Advisor | FinovoAI',
  description: 'Get AI-powered, personalized mutual fund portfolio recommendations based on your age, risk profile, and investment horizon. Live MFAPI data.',
}

export default function MFLayout({ children }: { children: React.ReactNode }) {
  // Added 10% zoom wrapper. Revert this by changing back to <>{children}</>
  return <div style={{ zoom: 1.1 }}>{children}</div>
}
