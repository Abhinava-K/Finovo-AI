'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp, Bitcoin, BrainCircuit, ArrowUpRight, ArrowDownRight,
  Sparkles, Activity, BarChart3, Zap, Shield, Clock, Wallet,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { formatINR, formatINRCompact, formatPercent } from '@/lib/formatters'

// ─── Mock portfolio data ──────────────────────────────────────────────────────

const PORTFOLIO_GROWTH = [
  { month: 'Jul', value: 420000 },
  { month: 'Aug', value: 428000 },
  { month: 'Sep', value: 415000 },
  { month: 'Oct', value: 438000 },
  { month: 'Nov', value: 452000 },
  { month: 'Dec', value: 447000 },
  { month: 'Jan', value: 461000 },
  { month: 'Feb', value: 469000 },
  { month: 'Mar', value: 458000 },
  { month: 'Apr', value: 472000 },
  { month: 'May', value: 481000 },
  { month: 'Jun', value: 485000 },
]

const ALLOCATION_DATA = [
  { name: 'Equity MF', value: 40, color: '#3B82F6', amount: 194000 },
  { name: 'Mid Cap MF', value: 25, color: '#F59E0B', amount: 121250 },
  { name: 'Debt MF',    value: 15, color: '#10B981', amount: 72750 },
  { name: 'Bitcoin',    value: 12, color: '#F7931A', amount: 58200 },
  { name: 'Ethereum',   value: 5,  color: '#627EEA', amount: 24250 },
  { name: 'Altcoins',   value: 3,  color: '#9945FF', amount: 14550 },
]

const MODULE_PERF = [
  { module: 'MF', returns: 14.2 },
  { module: 'Crypto', returns: 28.6 },
]

const AI_INSIGHTS = [
  {
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    title: 'Rebalancing Opportunity',
    body: 'Your equity allocation has grown to 40% (target: 35%). Consider shifting ₹24,000 to debt funds to maintain risk profile.',
  },
  {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    title: 'Crypto Volatility Alert',
    body: 'BTC has moved +18% this month. If this exceeds your max drawdown threshold, consider partial profit-booking.',
  },
  {
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    title: 'SIP on Track',
    body: 'Your ₹5,000 monthly SIP is performing at 14.2% CAGR — 2.1% above the category average. No action required.',
  },
]

const WATCHLIST = [
  { name: 'Parag Parikh Flexi Cap', type: 'Mutual Fund', cagr: 17.1, change: +0.8, color: '#3B82F6' },
  { name: 'Axis Midcap Fund',        type: 'Mutual Fund', cagr: 18.6, change: +1.2, color: '#F59E0B' },
  { name: 'Bitcoin (BTC)',            type: 'Crypto',      cagr: 42.0, change: +2.4, color: '#F7931A' },
  { name: 'Ethereum (ETH)',           type: 'Crypto',      cagr: 38.2, change: -0.8, color: '#627EEA' },
]

const ACTIVITY = [
  { action: 'SIP Executed',     detail: 'HDFC Top 100 — ₹2,500',    time: '2h ago',  icon: TrendingUp,   positive: true  },
  { action: 'AI Recommendation', detail: 'High risk MF portfolio',   time: '1d ago',  icon: BrainCircuit, positive: null  },
  { action: 'Crypto Rebalance', detail: 'ETH → BTC shift (5%)',      time: '3d ago',  icon: Bitcoin,      positive: true  },
  { action: 'Projection Updated', detail: 'Expected: ₹7.2L by 2039', time: '5d ago',  icon: BarChart3,    positive: null  },
]

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string; value: string; change: string; changePositive: boolean
  icon: React.ElementType; iconColor: string; delay?: number
}

function StatCard({ label, value, change, changePositive, icon: Icon, iconColor, delay = 0 }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <GlassCard variant="elevated" shine className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.06] border border-white/[0.08]`}>
            <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
          </div>
          <span className={`flex items-center gap-0.5 text-xs font-bold ${changePositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {changePositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        </div>
        <p className="text-[22px] font-black text-foreground tabular tracking-tight leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </GlassCard>
    </motion.div>
  )
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function GrowthTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-elevated border border-white/10 rounded-xl px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-black text-foreground tabular">{formatINR(payload[0].value, true)}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [isDemoMode, setIsDemoMode] = useState(false)

  return (
    <div className="page-content container mx-auto px-4 lg:px-6">

      {/* Demo Banner */}
      {isDemoMode && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-100">You are viewing a Sample Portfolio</p>
                <p className="text-xs text-blue-300/70">Explore the dashboard's capabilities with mock data.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsDemoMode(false)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 shrink-0">
              Exit Demo
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Portfolio</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Investment Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Portfolio intelligence powered by live MFAPI &amp; CoinGecko data.
        </p>
      </motion.div>

      {!isDemoMode ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
          <GlassCard variant="elevated" shine className="p-12 text-center flex flex-col items-center justify-center min-h-[400px] border-blue-500/20 relative overflow-hidden">
            {/* Background glow for sleekness */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-xl">
              <BrainCircuit className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight relative z-10">Welcome to FinovoAI</h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed relative z-10">
              Discover how our intelligent engine unifies your assets, analyzes risk, and accelerates your path to financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Button size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8" onClick={() => setIsDemoMode(true)}>
                <Sparkles className="w-4 h-4 mr-2 text-blue-200" />
                See How It Works
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Portfolio"  value="₹4.85L"  change="+15.5%"  changePositive iconColor="text-blue-400"    icon={BarChart3}    delay={0}    />
        <StatCard label="This Month"       value="+₹4,000" change="+0.83%"  changePositive iconColor="text-violet-400" icon={Activity}     delay={0.05} />
        <StatCard label="Total Returns"    value="₹65,000" change="+15.5%"  changePositive iconColor="text-emerald-400" icon={TrendingUp}   delay={0.1}  />
        <StatCard label="AI Health Score"  value="87/100"  change="Excellent" changePositive iconColor="text-amber-400"  icon={Sparkles}    delay={0.15} />
      </div>

      {/* Growth chart + Allocation */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
          <GlassCard variant="elevated" shine className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Portfolio Growth</p>
                <p className="text-xl font-black text-foreground tabular">₹4,85,000</p>
                <p className="text-xs text-emerald-400 font-semibold">+15.5% since inception</p>
              </div>
              <div className="flex gap-1.5">
                {['1M', '3M', '6M', '1Y'].map((l, i) => (
                  <button key={l} className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${i === 3 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-muted-foreground/60 hover:text-foreground'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={PORTFOLIO_GROWTH} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatINRCompact} tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} width={46} />
                <Tooltip content={<GrowthTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <GlassCard variant="elevated" shine className="p-5 h-full">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Asset Allocation</p>
            <div className="flex justify-center mb-3">
              <div className="relative w-[148px] h-[148px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ALLOCATION_DATA} cx="50%" cy="50%" innerRadius={46} outerRadius={68} dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270} strokeWidth={0}>
                      {ALLOCATION_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="glass-elevated border border-white/10 rounded-lg px-2.5 py-1.5 text-xs">
                          <span style={{ color: (payload[0].payload as typeof ALLOCATION_DATA[0]).color }}>{(payload[0].payload as typeof ALLOCATION_DATA[0]).name}</span>
                          <span className="ml-2 font-bold text-foreground">{payload[0].value}%</span>
                        </div>
                      ) : null
                    } />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-black text-foreground tabular">₹4.85L</span>
                  <span className="text-[9px] text-muted-foreground font-semibold">TOTAL</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {ALLOCATION_DATA.map(({ name, color, value, amount }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[11px] text-muted-foreground truncate max-w-[90px]">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-foreground tabular">{value}%</span>
                    <span className="text-[10px] text-muted-foreground tabular">{formatINR(amount, true)}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Module performance + Watchlist */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}>
          <GlassCard variant="default" shine className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Module Returns</p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={MODULE_PERF} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="module" tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="glass-elevated border border-white/10 rounded-lg px-2.5 py-1.5">
                      <p className="text-xs text-muted-foreground">{payload[0].payload.module}</p>
                      <p className="text-sm font-bold text-emerald-400">{payload[0].value}% CAGR</p>
                    </div>
                  ) : null
                } />
                <Bar dataKey="returns" radius={[4, 4, 0, 0]}>
                  {MODULE_PERF.map((_, i) => <Cell key={i} fill={i === 0 ? '#3B82F6' : '#9945FF'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[{ label: 'Mutual Funds', val: '14.2%', color: 'text-blue-400' }, { label: 'Crypto', val: '28.6%', color: 'text-violet-400' }].map(({ label, val, color }) => (
                <div key={label} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                  <p className={`text-sm font-black ${color}`}>{val}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }} className="lg:col-span-2">
          <GlassCard variant="default" shine className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Watchlist</p>
              <span className="text-[10px] text-muted-foreground/50">Live from MFAPI &amp; CoinGecko</span>
            </div>
            <div className="space-y-2">
              {WATCHLIST.map(({ name, type, cagr, change, color }) => (
                <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0" style={{ backgroundColor: color + '18', borderColor: color + '40' }}>
                    <span className="text-[8px] font-black" style={{ color }}>{name.slice(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{name}</p>
                    <p className="text-[10px] text-muted-foreground">{type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground tabular">{formatPercent(cagr)}% CAGR</p>
                    <p className={`text-[10px] font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {change >= 0 ? '+' : ''}{change}% today
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* AI Insights + Activity + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="lg:col-span-2">
          <GlassCard variant="default" shine className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Portfolio Insights</p>
              <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-3">
              {AI_INSIGHTS.map(({ icon: Icon, color, bg, border, title, body }) => (
                <div key={title} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className={`w-8 h-8 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground mb-0.5">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38 }}>
            <GlassCard variant="subtle" className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</p>
              </div>
              <div className="space-y-3">
                {ACTIVITY.map(({ action, detail, time, icon: Icon, positive }) => (
                  <div key={action} className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${positive === true ? 'bg-emerald-400/10' : positive === false ? 'bg-red-400/10' : 'bg-blue-400/10'}`}>
                      <Icon className={`w-3 h-3 ${positive === true ? 'text-emerald-400' : positive === false ? 'text-red-400' : 'text-blue-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{action}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{detail}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0">{time}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.42 }}>
            <GlassCard variant="subtle" className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="flex flex-col gap-2">
                <Button asChild size="sm" className="w-full justify-start gap-2 text-xs">
                  <Link href="/mutual-funds"><TrendingUp className="w-3.5 h-3.5" />New MF Recommendation</Link>
                </Button>
                <Button asChild size="sm" variant="gradient-violet" className="w-full justify-start gap-2 text-xs">
                  <Link href="/crypto"><Bitcoin className="w-3.5 h-3.5" />New Crypto Portfolio</Link>
                </Button>
                <Button asChild size="sm" variant="glass" className="w-full justify-start gap-2 text-xs">
                  <Link href="/advisor"><BrainCircuit className="w-3.5 h-3.5" />Ask AI Advisor</Link>
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
