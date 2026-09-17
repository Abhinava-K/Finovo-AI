'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Bitcoin, BrainCircuit, Database, Zap, Shield } from 'lucide-react'

const stats = [
  {
    label: 'Live Mutual Funds Tracked',
    value: '5,000+',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    label: 'Crypto Assets Analyzed',
    value: '100+',
    icon: Bitcoin,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/20',
  },
  {
    label: 'AI Model Accuracy',
    value: 'LLM-grade',
    icon: BrainCircuit,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    label: 'Data Freshness',
    value: 'Real-time',
    icon: Database,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
]

const partners = [
  { name: 'MFAPI.in', desc: 'Mutual Fund NAV & Historical Data', icon: TrendingUp, color: 'text-blue-400' },
  { name: 'CoinGecko', desc: 'Cryptocurrency Market Data', icon: Bitcoin, color: 'text-violet-400' },
  { name: 'Groq AI', desc: 'Ultra-fast LLM Inference', icon: Zap, color: 'text-amber-400' },
  { name: 'FastAPI', desc: 'Production-grade Backend', icon: Shield, color: 'text-emerald-400' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function TrustIndicators() {
  return (
    <section className="py-16 border-y border-white/[0.05] bg-white/[0.01]">
      <div className="container mx-auto px-4 lg:px-6">

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
            <motion.div
              key={label}
              variants={cardVariants}
              className="flex flex-col items-center text-center p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`text-2xl font-black ${color} tracking-tight tabular`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Data partners */}
        <div className="flex flex-col items-center">
          <p className="text-xs text-muted-foreground/50 uppercase tracking-widest font-semibold mb-5">
            Powered by trusted data sources
          </p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3"
          >
            {partners.map(({ name, desc, icon: Icon, color }) => (
              <motion.div
                key={name}
                variants={cardVariants}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors cursor-default"
              >
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <span className="text-sm font-semibold text-foreground">{name}</span>
                <span className="hidden sm:inline text-xs text-muted-foreground">· {desc}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
