import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/components/providers/app-providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'FinovoAI — Investment Advice That Thinks Before It Recommends',
    template: '%s | FinovoAI',
  },
  description:
    'AI-powered personalized investment advisor for mutual funds and crypto portfolios. Get data-driven, risk-calibrated recommendations tailored to your unique profile.',
  keywords: [
    'investment advisor',
    'mutual funds',
    'crypto portfolio',
    'AI investing',
    'portfolio optimization',
    'SIP recommendation',
    'risk analysis',
  ],
  authors: [{ name: 'FinovoAI' }],
  creator: 'FinovoAI',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'FinovoAI — Investment Advice That Thinks Before It Recommends',
    description: 'AI-powered personalized investment advisor for mutual funds and crypto.',
    siteName: 'FinovoAI',
  },
}

export const viewport: Viewport = {
  themeColor: '#05091a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>
          {/* Layered background — mesh + glow orbs */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-mesh-dark" />
            <div className="absolute inset-0 bg-glow-blue" />
            <div className="absolute inset-0 bg-glow-violet" />
            <div className="absolute inset-0 bg-glow-indigo" />
            {/* Subtle dot grid */}
            <div className="absolute inset-0 bg-dot-grid opacity-40" />
          </div>

          <div className="relative flex min-h-dvh flex-col">
            {/* Skip to main content — accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-sm focus:font-semibold focus:shadow-glow-blue"
            >
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
