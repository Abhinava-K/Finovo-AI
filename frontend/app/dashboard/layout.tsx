import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | FinovoAI',
  description: 'Your AI Investment Intelligence Dashboard. Portfolio overview, asset allocation, AI insights, and quick actions.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Added 10% zoom wrapper. Revert this by changing back to <>{children}</>
  return <div style={{ zoom: 1.1 }}>{children}</div>
}
