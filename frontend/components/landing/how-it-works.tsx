'use client'

import { motion } from 'framer-motion'
import { ClipboardList, BrainCircuit, BarChart3, ArrowRight } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassCard } from '@/components/ui/glass-card'

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Tell Us Your Profile',
    description:
      'Enter your age, investment amount, risk tolerance, and time horizon. Our validation engine ensures every parameter is precisely calibrated — no vague inputs, no generic defaults.',
    highlights: ['Age-adaptive logic', 'Risk spectrum: low → high', 'INR-denominated targets'],
    color: 'blue' as const,
    dotColor: 'bg-blue-400',
    lineColor: 'from-blue-400/30',
  },
  {
    step: '02',
    icon: BrainCircuit,
    title: 'AI Fetches Live Data',
    description:
      'Our LangGraph ReAct agent queries MFAPI for real-time NAV data and CoinGecko for live crypto prices. No cached templates — every recommendation is freshly computed against current markets.',
    highlights: ['Live NAV from MFAPI', 'Real-time crypto via CoinGecko', 'Groq Llama 3.3-70b reasoning'],
    color: 'violet' as const,
    dotColor: 'bg-violet-400',
    lineColor: 'from-violet-400/30',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Receive Your Blueprint',
    description:
      'Get a complete investment blueprint: optimized asset allocation, top fund picks with CAGR history, 15-year projection scenarios, and a phased rebalancing plan — all in seconds.',
    highlights: ['Optimistic / Expected / Conservative projections', 'Fund-level CAGR analysis', 'Phased rebalancing schedule'],
    color: 'green' as const,
    dotColor: 'bg-emerald-400',
    lineColor: 'from-emerald-400/30',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
}

const stepVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-6">

        <SectionHeader
          eyebrow="How It Works"
          title="From profile to portfolio in seconds"
          subtitle="A three-step pipeline powered by AI reasoning, live market data, and a production-grade recommendation engine."
          className="mb-16"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="relative"
        >
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-12 left-[calc(50%_-_1px)] w-px h-[calc(100%_-_48px)] bg-white/[0.06]" />

          <div className="flex flex-col gap-8">
            {steps.map(({ step, icon: Icon, title, description, highlights, color, dotColor }, i) => {
              const isEven = i % 2 === 0
              return (
                <motion.div
                  key={step}
                  variants={stepVariants}
                  className={`flex flex-col lg:flex-row gap-6 lg:gap-12 items-center ${
                    !isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Text side */}
                  <div className="flex-1 max-w-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl font-black text-muted-foreground/20 tabular leading-none">{step}</span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-5">{description}</p>
                    <ul className="flex flex-col gap-2">
                      {highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Center dot — desktop */}
                  <div className="hidden lg:flex flex-col items-center shrink-0 z-10">
                    <div className={`w-6 h-6 rounded-full ${dotColor} shadow-[0_0_16px_rgba(255,255,255,0.15)] ring-4 ring-background`} />
                  </div>

                  {/* Card side */}
                  <div className="flex-1 max-w-lg">
                    <GlassCard variant="elevated" glow={color} shine className="p-6">
                      <div className={`w-12 h-12 rounded-2xl bg-${color === 'blue' ? 'blue' : color === 'violet' ? 'violet' : 'emerald'}-500/15 border border-${color === 'blue' ? 'blue' : color === 'violet' ? 'violet' : 'emerald'}-500/20 flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${color === 'blue' ? 'text-blue-400' : color === 'violet' ? 'text-violet-400' : 'text-emerald-400'}`} />
                      </div>
                      <div className="space-y-2">
                        {highlights.map((h) => (
                          <div key={h} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                            <div className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                            <span className="text-xs font-medium text-foreground">{h}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
