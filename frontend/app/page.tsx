import { HeroSection } from '@/components/landing/hero-section'
import { TrustIndicators } from '@/components/landing/trust-indicators'
import { HowItWorks } from '@/components/landing/how-it-works'
import { AIIntelligence } from '@/components/landing/ai-intelligence'
import { PortfolioOptimization } from '@/components/landing/portfolio-optimization'
import { MarketIntelligence } from '@/components/landing/market-intelligence'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FaqSection } from '@/components/landing/faq-section'

export default function HomePage() {
  return (
    <main className="flex flex-col w-full" style={{ zoom: '1.1' }}>
      <HeroSection />
      <TrustIndicators />
      <HowItWorks />
      <AIIntelligence />
      <PortfolioOptimization />
      <MarketIntelligence />
      <TestimonialsSection />
      <FaqSection />
    </main>
  )
}
