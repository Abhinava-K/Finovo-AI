'use client'

import { motion } from 'framer-motion'
import {
  BrainCircuit, Network, Zap, Database, RefreshCw, Shield,
} from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassCard } from '@/components/ui/glass-card'

const capabilities = [
  {
    icon: BrainCircuit,
    title: 'ReAct Agent Architecture',
    description:
      'Our LangGraph-powered agent Reasons and Acts in a loop — forming a hypothesis, fetching real data, and refining its answer before responding. No guessing.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
  },
  {
    icon: Database,
    title: 'Live Market Data Pipeline',
    description:
      'Every recommendation triggers a fresh API call to MFAPI (5,000+ mutual funds) and CoinGecko (100+ cryptocurrencies). NAV data is never older than your request.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    icon: Zap,
    title: 'High-Performance Inference',
    description:
      'Engineered for low-latency financial reasoning even on complex multi-tool queries. Fast intelligence, not slow processing.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  {
    icon: Network,
    title: 'Tool-Use Reasoning',
    description:
      'The agent selects from specialized tools at inference time — mutual fund analyzer, crypto portfolio builder, and freeform Q&A — routing your query to the right intelligence.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    icon: RefreshCw,
    title: 'Adaptive Rebalancing',
    description:
      'Beyond recommendations, the engine generates phased rebalancing schedules. It knows that equity-heavy portfolios need systematic debt rotation as your horizon shortens.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    icon: Shield,
    title: 'Validated Against Risk Tolerance',
    description:
      'Max drawdown limits for crypto (20% / 50% / 80%) and risk bands for mutual funds are enforced at the recommendation level — not just surface-level UX validation.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
  },
]

// Simplified node graph for illustration
const agentNodes = [
  { label: 'Your Query', x: '5%', y: '42%', color: '#3B82F6' },
  { label: 'ReAct Agent', x: '35%', y: '42%', color: '#A78BFA', big: true },
  { label: 'MFAPI Tool', x: '65%', y: '15%', color: '#10B981' },
  { label: 'CoinGecko Tool', x: '65%', y: '68%', color: '#F59E0B' },
  { label: 'Answer', x: '87%', y: '42%', color: '#3B82F6' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function AIIntelligence() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">

        <SectionHeader
          eyebrow="AI Intelligence Layer"
          title="Not just an LLM. A reasoning agent."
          subtitle="Most AI investment tools wrap ChatGPT around static templates. Ours runs a LangGraph ReAct agent that actually thinks, fetches live data, and constructs your recommendation from scratch."
          accent="violet"
          className="mb-16"
        />

        {/* Agent flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <GlassCard variant="elevated" shine className="p-8 relative overflow-hidden">
            <div className="relative h-36 w-full">
              {/* SVG connections */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Query → ReAct */}
                <line x1="12" y1="50" x2="33" y2="50" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" strokeDasharray="2 1" />
                {/* ReAct → MFAPI */}
                <line x1="47" y1="46" x2="63" y2="23" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" strokeDasharray="2 1" />
                {/* ReAct → CoinGecko */}
                <line x1="47" y1="54" x2="63" y2="72" stroke="rgba(245,158,11,0.3)" strokeWidth="0.5" strokeDasharray="2 1" />
                {/* MFAPI → Answer */}
                <line x1="72" y1="20" x2="86" y2="47" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" strokeDasharray="2 1" />
                {/* CoinGecko → Answer */}
                <line x1="72" y1="71" x2="86" y2="52" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" strokeDasharray="2 1" />
              </svg>

              {/* Nodes */}
              {agentNodes.map(({ label, x, y, color, big }) => (
                <div
                  key={label}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                  style={{ left: x, top: y }}
                >
                  <div
                    className={`${big ? 'w-12 h-12' : 'w-9 h-9'} rounded-xl border flex items-center justify-center`}
                    style={{
                      backgroundColor: color + '18',
                      borderColor: color + '40',
                      boxShadow: `0 0 12px ${color}22`,
                    }}
                  >
                    <BrainCircuit className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground/60">
                LangGraph ReAct loop · Multi-Asset Telemetry · MFAPI + CoinGecko tools
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Capability grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {capabilities.map(({ icon: Icon, title, description, color, bg, border }) => (
            <motion.div key={title} variants={cardVariants}>
              <GlassCard variant="default" shine className="p-5 h-full hover:bg-white/[0.05] transition-colors">
                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
