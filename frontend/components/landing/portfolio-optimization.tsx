'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight, Target, Layers } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassCard } from '@/components/ui/glass-card'

// Mock data illustrating the output — mirrors actual backend response shape
const SAMPLE_FUNDS = [
  { name: 'HDFC Top 100 Fund', category: 'Large Cap Equity', cagr: 14.2, risk: 'Medium', rating: 5, allocation: 35 },
  { name: 'Parag Parikh Flexi Cap', category: 'Flexi Cap', cagr: 17.1, risk: 'Medium-High', rating: 5, allocation: 25 },
  { name: 'Axis Midcap Fund', category: 'Mid Cap', cagr: 18.6, risk: 'High', rating: 4, allocation: 20 },
  { name: 'ICICI Pru Short Term', category: 'Short Duration Debt', cagr: 7.4, risk: 'Low', rating: 4, allocation: 20 },
]

const ALLOCATION_SEGMENTS = [
  { label: 'Equity (Large)', pct: 35, color: '#3B82F6' },
  { label: 'Flexi Cap', pct: 25, color: '#6366F1' },
  { label: 'Mid Cap', pct: 20, color: '#F59E0B' },
  { label: 'Debt', pct: 20, color: '#10B981' },
]

const REBALANCING = [
  { phase: 'Years 1–5', equity: 80, debt: 20, action: 'Growth phase — maximize equity exposure' },
  { phase: 'Years 6–10', equity: 65, debt: 35, action: 'Consolidation — systematic debt rotation begins' },
  { phase: 'Years 11–15', equity: 50, debt: 50, action: 'Preservation — capital protection priority' },
]

// Simple segmented bar using flex
function AllocationBar({ segments }: { segments: typeof ALLOCATION_SEGMENTS }) {
  return (
    <div className="flex h-2.5 rounded-full overflow-hidden gap-[2px]">
      {segments.map(({ label, pct, color }) => (
        <div
          key={label}
          className="rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 1s ease' }}
        />
      ))}
    </div>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function PortfolioOptimization() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-6">

        <SectionHeader
          eyebrow="Portfolio Optimization"
          title="Smart allocation. Top fund selection."
          subtitle="Personalized allocation across equity, midcap, and debt — then filtered to the top-performing funds in each category using live NAV and historical CAGR data."
          align="left"
          className="mb-12"
        />

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Left: Fund list */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Sample Fund Recommendations
            </p>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3"
            >
              {SAMPLE_FUNDS.map(({ name, category, cagr, risk, rating, allocation }) => (
                <motion.div key={name} variants={rowVariants}>
                  <GlassCard variant="default" shine className="p-4 hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-3 h-3 text-blue-400" />
                          </div>
                          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground ml-8">{category}</p>
                        <div className="flex items-center gap-3 mt-2 ml-8">
                          <span className="text-[11px] text-muted-foreground">
                            Risk: <span className="text-foreground font-medium">{risk}</span>
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Rating: <span className="text-amber-400">{'★'.repeat(rating)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-lg font-black text-emerald-400 tabular">{cagr}%</span>
                        <span className="text-[10px] text-muted-foreground">CAGR</span>
                        <span className="text-[11px] font-semibold text-blue-400">{allocation}% alloc.</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Allocation + Rebalancing */}
          <div className="space-y-6">

            {/* Allocation breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard variant="elevated" glow="blue" shine className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-foreground">Asset Allocation</span>
                  <span className="ml-auto text-xs text-muted-foreground">₹1,00,000 · High Risk · 15Y</span>
                </div>
                <AllocationBar segments={ALLOCATION_SEGMENTS} />
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  {ALLOCATION_SEGMENTS.map(({ label, pct, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs text-muted-foreground truncate">{label}</span>
                      <span className="ml-auto text-xs font-semibold text-foreground tabular">{pct}%</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Projection summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard variant="default" shine className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-foreground">15-Year Projection</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Optimistic', value: '₹13.7L', color: 'text-emerald-400' },
                    { label: 'Expected', value: '₹7.2L', color: 'text-blue-400' },
                    { label: 'Conservative', value: '₹3.4L', color: 'text-amber-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <p className={`text-xl font-black ${color} tabular`}>{value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
                  Based on ₹1L investment · Historical CAGR projections
                </p>
              </GlassCard>
            </motion.div>

            {/* Rebalancing plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard variant="subtle" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpRight className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-bold text-foreground">Phased Rebalancing Plan</span>
                </div>
                <div className="space-y-3">
                  {REBALANCING.map(({ phase, equity, debt, action }) => (
                    <div key={phase} className="flex gap-4 items-start">
                      <span className="text-[10px] font-bold text-violet-400 whitespace-nowrap mt-0.5 w-20 shrink-0">
                        {phase}
                      </span>
                      <div className="flex-1">
                        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden mb-1.5">
                          <div className="bg-blue-400 rounded-full" style={{ width: `${equity}%` }} />
                          <div className="bg-emerald-400 rounded-full" style={{ width: `${debt}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{action}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-blue-400 font-semibold">{equity}%E</span>
                        <span className="text-muted-foreground/40 mx-1 text-[10px]">/</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{debt}%D</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
