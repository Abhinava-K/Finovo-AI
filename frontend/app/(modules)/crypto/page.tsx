'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bitcoin, ArrowRight, RotateCcw, Shield, AlertTriangle,
  Info, BarChart3, Zap,
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useCryptoRecommend } from '@/hooks/use-crypto-recommend'
import { cryptoFormSchema as cryptoSchema, type CryptoFormValues } from '@/lib/validators/crypto'
import { formatINR, formatINRCompact, interpolateProjection } from '@/lib/formatters'
import type { CryptoRecommendResponse } from '@/types/api'

// ─── Coin colour map ──────────────────────────────────────────────────────────

const COIN_COLORS: Record<string, string> = {
  bitcoin:    '#F7931A',
  ethereum:   '#627EEA',
  solana:     '#9945FF',
  matic:      '#8247E5',
  polygon:    '#8247E5',
  cardano:    '#0033AD',
  chainlink:  '#375BD2',
  avalanche:  '#E84142',
  polkadot:   '#E6007A',
  ripple:     '#00AAE4',
  default:    '#6366F1',
}

function coinColor(name: string): string {
  return COIN_COLORS[name.toLowerCase()] ?? COIN_COLORS.default
}

function coinLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function CryptoForm({ onSubmit, isLoading }: { onSubmit: (v: CryptoFormValues) => void; isLoading: boolean }) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<CryptoFormValues>({
    resolver: zodResolver(cryptoSchema),
    defaultValues: { amount: 100000, investment_horizon: 'medium-term', max_drawdown: 50 },
  })

  const horizon = watch('investment_horizon')
  const drawdown = watch('max_drawdown')

  const HORIZONS = [
    { value: 'short-term',  label: 'Short-term',  desc: '~1 year',  color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { value: 'medium-term', label: 'Medium-term', desc: '~2 years', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { value: 'long-term',   label: 'Long-term',   desc: '~5 years', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  ]

  const DRAWDOWNS = [
    { value: 20, label: 'Conservative', desc: 'Max 20% loss', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', risk: 'Low' },
    { value: 50, label: 'Moderate',     desc: 'Max 50% loss', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',   risk: 'Medium' },
    { value: 80, label: 'Aggressive',   desc: 'Max 80% loss', color: 'border-red-500/40 text-red-400 bg-red-500/10',         risk: 'High' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <GlassCard variant="elevated" glow="violet" shine className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Bitcoin className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Build Your Crypto Portfolio</h2>
            <p className="text-xs text-muted-foreground">Live allocations from CoinGecko — built for real drawdowns</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Investment Amount (₹)
            </label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="w-full h-11 px-4 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              placeholder="Min ₹1,000 · Multiple of 100"
              min={1000}
              step={100}
            />
            {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
          </div>

          {/* Investment horizon */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Investment Horizon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HORIZONS.map(({ value, label, desc, color }) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" value={value} {...register('investment_horizon')} className="sr-only" />
                  <div className={`p-3 rounded-xl border-2 text-center transition-all ${horizon === value ? color : 'border-white/[0.08] text-muted-foreground hover:border-white/[0.15]'}`}>
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Max drawdown */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Max Drawdown Tolerance
              </label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-muted-foreground/40" />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block w-52 p-2.5 rounded-lg glass-elevated border border-white/10 text-[10px] text-muted-foreground leading-relaxed z-10">
                  How much of your investment can you watch disappear without selling? BTC has dropped 80%+ historically.
                </div>
              </div>
            </div>
            <Controller
              name="max_drawdown"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {DRAWDOWNS.map(({ value, label, desc, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${field.value === value ? color : 'border-white/[0.08] text-muted-foreground hover:border-white/[0.15]'}`}
                    >
                      <p className="text-xs font-bold">{label}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.max_drawdown && <p className="text-xs text-red-400 mt-1">{errors.max_drawdown.message}</p>}
          </div>

          {/* Warning for 80% */}
          <AnimatePresence>
            {drawdown === 80 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-red-400 font-semibold">High risk mode selected.</span> An 80% drawdown means your ₹{((Number(watch('amount')) || 0) * 0.8 / 1000).toFixed(0)}K could temporarily become ₹{((Number(watch('amount')) || 0) * 0.2 / 1000).toFixed(0)}K. Only choose this if you can hold for 5+ years.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" size="lg" variant="gradient-violet" className="w-full gap-2" disabled={isLoading}>
            <Bitcoin className="w-4 h-4" />
            Generate Crypto Portfolio
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-[11px] text-center text-muted-foreground/60">
            Powered by live CoinGecko data · For educational purposes only
          </p>
        </form>
      </GlassCard>
    </motion.div>
  )
}

// ─── Results ─────────────────────────────────────────────────────────────────

interface ResultsProps {
  data: CryptoRecommendResponse
  request: CryptoFormValues
  onReset: () => void
}

function CryptoResults({ data, request, onReset }: ResultsProps) {
  const { allocation, projection, risk_analysis } = data

  const coins = Object.entries(allocation)
  const allocSlices = coins.map(([name, pct]) => ({
    name: coinLabel(name),
    value: pct,
    color: coinColor(name),
    amount: (pct / 100) * request.amount,
  }))

  const projData = interpolateProjection(request.amount, projection, projection.duration_years)

  const volatilityColor = risk_analysis.volatility === 'Low' ? 'text-emerald-400'
    : risk_analysis.volatility === 'Medium' ? 'text-amber-400' : 'text-red-400'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Your Crypto Portfolio Blueprint</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatINR(request.amount, true)} · {request.investment_horizon} · max {request.max_drawdown}% drawdown
          </p>
        </div>
        <Button onClick={onReset} variant="glass" size="sm" className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> New Analysis
        </Button>
      </div>

      {/* Projection summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Best Case',   value: formatINR(projection.optimistic, true),   cagr: ((Math.pow(projection.optimistic / request.amount, 1 / projection.duration_years) - 1) * 100).toFixed(1), color: 'text-emerald-400' },
          { label: 'Most Likely',     value: formatINR(projection.expected, true),     cagr: ((Math.pow(projection.expected / request.amount, 1 / projection.duration_years) - 1) * 100).toFixed(1), color: 'text-blue-400' },
          { label: 'Worst Case', value: formatINR(projection.conservative, true), cagr: ((Math.pow(projection.conservative / request.amount, 1 / projection.duration_years) - 1) * 100).toFixed(1), color: 'text-amber-400' },
        ].map(({ label, value, cagr, color }) => (
          <GlassCard key={label} variant="default" shine className="p-4 text-center">
            <p className={`text-2xl font-black ${color} tabular`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label} in {projection.duration_years}Y</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">(~{cagr}% p.a.)</p>
          </GlassCard>
        ))}
      </div>

      {/* Allocation + Risk */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Allocation donut */}
        <GlassCard variant="elevated" glow="violet" shine className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bitcoin className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-foreground">Coin Allocation</h3>
            <span className="ml-auto text-[10px] text-muted-foreground">Live from CoinGecko</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocSlices} cx="50%" cy="50%" innerRadius={58} outerRadius={82} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270} strokeWidth={0}>
                    {allocSlices.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="glass-elevated border border-white/10 rounded-xl px-3 py-2">
                        <p className="text-xs font-bold text-foreground" style={{ color: (payload[0].payload as typeof allocSlices[0]).color }}>
                          {(payload[0].payload as typeof allocSlices[0]).name}
                        </p>
                        <p className="text-sm font-black text-foreground">{payload[0].value}%</p>
                        <p className="text-xs text-muted-foreground">{formatINR((payload[0].payload as typeof allocSlices[0]).amount)}</p>
                      </div>
                    ) : null
                  } />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-foreground tabular">{formatINR(request.amount, true)}</span>
                <span className="text-[9px] text-muted-foreground font-semibold">INVESTED</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 mt-4 w-full">
              {allocSlices.map(({ name, value, color, amount }) => (
                <div key={name} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center border" style={{ backgroundColor: color + '18', borderColor: color + '40' }}>
                      <span className="text-[8px] font-black" style={{ color }}>{name.slice(0, 3).toUpperCase()}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-foreground tabular">{value}%</span>
                    <p className="text-[10px] text-muted-foreground">{formatINR(amount, true)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Risk analysis */}
        <GlassCard variant="default" shine className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">Risk Analysis</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Volatility', value: risk_analysis.volatility, color: volatilityColor },
              { label: 'Max Drawdown', value: `${risk_analysis.max_drawdown_limit}%`, color: 'text-amber-400' },
              { label: 'Horizon', value: request.investment_horizon.replace('-', ' '), color: 'text-blue-400' },
              { label: 'Coins', value: `${coins.length} assets`, color: 'text-violet-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className={`text-sm font-black ${color} tabular leading-tight`}>{value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Reasoning from backend */}
          <div className="p-3.5 rounded-xl bg-violet-500/[0.06] border border-violet-500/[0.12]">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">AI Reasoning</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{risk_analysis.reasoning}</p>
          </div>

          {/* Drawdown visual */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground">Portfolio if drawdown hits</span>
              <span className="text-[11px] font-bold text-red-400">-{risk_analysis.max_drawdown_limit}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400" style={{ width: `${risk_analysis.max_drawdown_limit}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground/50">Worst case</span>
              <span className="text-[10px] text-muted-foreground/50">
                {formatINR(request.amount * (1 - risk_analysis.max_drawdown_limit / 100), true)} remaining
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Projection chart */}
      <GlassCard variant="elevated" shine className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-foreground">{projection.duration_years}-Year Projection</h3>
          <span className="ml-auto flex items-center gap-3 text-[10px]">
            {[{ label: 'Best Case', color: '#34d399' }, { label: 'Most Likely', color: '#3b82f6' }, { label: 'Worst Case', color: '#f59e0b' }].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />{label}
              </span>
            ))}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={projData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              {[{ id: 'opt', color: '#34d399' }, { id: 'exp', color: '#3b82f6' }, { id: 'con', color: '#f59e0b' }].map(({ id, color }) => (
                <linearGradient key={id} id={`cg-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tickFormatter={(v: number) => `Y${v}`} tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatINRCompact} tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="glass-elevated border border-white/10 rounded-xl px-3 py-2.5 min-w-[150px]">
                  <p className="text-xs text-muted-foreground mb-2">Year {label}</p>
                  {payload.map((p) => (
                    <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-xs capitalize text-muted-foreground">{p.name === 'optimistic' ? 'Best Case' : p.name === 'expected' ? 'Most Likely' : p.name === 'conservative' ? 'Worst Case' : p.name}</span>
                      <span className="text-xs font-bold text-foreground tabular">{formatINR(p.value as number, true)}</span>
                    </div>
                  ))}
                </div>
              ) : null
            } />
            <Area type="monotone" dataKey="optimistic"   stroke="#34d399" strokeWidth={2}   fill="url(#cg-opt)" dot={false} />
            <Area type="monotone" dataKey="expected"     stroke="#3b82f6" strokeWidth={2.5} fill="url(#cg-exp)" dot={false} />
            <Area type="monotone" dataKey="conservative" stroke="#f59e0b" strokeWidth={2}   fill="url(#cg-con)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1]">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-amber-400 font-semibold">High volatility asset class.</span> Crypto markets operate 24/7 and can move ±20% in a day. These projections are illustrative and not guarantees. Never invest money you cannot afford to lose.
        </p>
      </div>

      <p className="text-[11px] text-center text-muted-foreground/50 pb-4">
        AI-generated recommendations for educational purposes only. Not financial advice.
      </p>
    </motion.div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center py-16">
      <GlassCard variant="default" className="p-8">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-foreground mb-2">Recommendation Failed</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {error.message || 'Unable to connect to backend. Ensure it is running at localhost:8000.'}
        </p>
        <Button onClick={onRetry} size="sm" variant="glass" className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Try Again
        </Button>
      </GlassCard>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CryptoPage() {
  const [lastRequest, setLastRequest] = useState<CryptoFormValues | null>(null)
  const { mutate, data, isPending, error, reset } = useCryptoRecommend()

  function handleSubmit(values: CryptoFormValues) {
    setLastRequest(values)
    mutate(values)
  }

  function handleReset() {
    reset()
    setLastRequest(null)
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Bitcoin className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Crypto Advisor</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">AI Crypto Portfolio Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Risk-adjusted allocations from live CoinGecko data — built around your real drawdown tolerance.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingScreen type="crypto" />
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorState error={error} onRetry={handleReset} />
          </motion.div>
        ) : data && lastRequest ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CryptoResults data={data} request={lastRequest} onReset={handleReset} />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CryptoForm onSubmit={handleSubmit} isLoading={isPending} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
