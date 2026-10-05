'use client'

import { motion } from 'framer-motion'
import { Bitcoin, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassCard } from '@/components/ui/glass-card'

// Mock data — mirrors CryptoRecommendResponse allocation shape from types/api.ts
const MOCK_CRYPTO_ALLOC = [
  { coin: 'Bitcoin',   symbol: 'BTC', pct: 40, amount: '₹40,000', color: '#F7931A', change: +2.4, price: '$67,842' },
  { coin: 'Ethereum',  symbol: 'ETH', pct: 30, color: '#627EEA', change: -0.8, price: '$3,421', amount: '₹30,000' },
  { coin: 'Solana',    symbol: 'SOL', pct: 15, color: '#9945FF', change: +5.1, price: '$182', amount: '₹15,000' },
  { coin: 'Polygon',   symbol: 'MATIC', pct: 15, color: '#8247E5', change: +1.2, price: '$0.74', amount: '₹15,000' },
]

const RISK_METRICS = [
  { label: 'Max Drawdown Limit', value: '50%', color: 'text-amber-400', desc: 'Medium risk tolerance' },
  { label: 'Investment Horizon', value: 'Medium-term', color: 'text-blue-400', desc: '1–3 years' },
  { label: 'Volatility Grade', value: 'Moderate', color: 'text-violet-400', desc: 'Balanced portfolio' },
  { label: 'Expected Return', value: '+180%', color: 'text-emerald-400', desc: '3-year projection' },
]

const COIN_GRADIENT = 'conic-gradient(#F7931A 0deg 144deg, #627EEA 144deg 252deg, #9945FF 252deg 306deg, #8247E5 306deg 360deg)'

function CryptoDonut() {
  return (
    <div className="relative w-[80px] h-[80px] shrink-0">
      <div className="w-full h-full rounded-full" style={{ background: COIN_GRADIENT }} />
      <div className="absolute inset-[11px] rounded-full bg-[#0c1422] flex items-center justify-center">
        <Bitcoin className="w-4 h-4 text-amber-400" />
      </div>
    </div>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function MarketIntelligence() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Violet ambient */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">

        <SectionHeader
          eyebrow="Crypto Intelligence"
          title="Crypto portfolios built for real drawdowns."
          subtitle="Not every crypto investor can stomach -80%. Our risk engine asks the hard question first — then builds your portfolio around your real risk capacity, not your optimistic one."
          accent="violet"
          align="left"
          className="mb-12"
        />

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Left: Crypto allocation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard variant="elevated" glow="violet" shine className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <CryptoDonut />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Crypto Allocation
                  </p>
                  <p className="text-2xl font-black text-foreground tabular">₹1,00,000</p>
                  <p className="text-xs text-violet-400 font-semibold">Medium risk · 50% max drawdown</p>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {MOCK_CRYPTO_ALLOC.map(({ coin, symbol, pct, amount, color, change, price }) => (
                  <motion.div key={symbol} variants={rowVariants}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                      {/* Color dot */}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border" style={{ backgroundColor: color + '18', borderColor: color + '40' }}>
                        <span className="text-[9px] font-black" style={{ color }}>{symbol.slice(0, 3)}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{coin}</span>
                          <span className="text-xs font-bold tabular text-foreground">{pct}%</span>
                        </div>
                        {/* Mini allocation bar */}
                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <p className="text-[11px] font-semibold text-foreground tabular">{amount}</p>
                        <p className="text-[10px] text-muted-foreground">{price}</p>
                        <p className={`text-[10px] font-bold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'} flex items-center justify-end gap-0.5`}>
                          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {change >= 0 ? '+' : ''}{change}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* Right: Risk metrics + insight */}
          <div className="space-y-6">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard variant="default" shine className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-bold text-foreground">Risk Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {RISK_METRICS.map(({ label, value, color, desc }) => (
                    <div key={label} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <p className={`text-base font-black ${color} tabular leading-tight`}>{value}</p>
                      <p className="text-[11px] font-semibold text-foreground mt-1">{label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard variant="subtle" className="p-5 border-l-2 border-l-violet-400/50">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bitcoin className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">Why max drawdown matters</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      BTC has historically dropped 80%+ multiple times. A portfolio sized for 50% drawdown
                      limits exposure so you can <span className="text-foreground font-medium">hold through volatility</span> rather
                      than panic-sell at the bottom — which is where most retail investors lose money.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
