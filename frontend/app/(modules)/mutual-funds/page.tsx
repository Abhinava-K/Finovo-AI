'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, ArrowRight, RotateCcw, Star, RefreshCw, Info,
  ChevronRight, Layers, BarChart3, Download, Upload, Sparkles, ShieldCheck, CheckCircle2,
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { ReportWatermark } from '@/components/ui/report-watermark'
import { useMFRecommend } from '@/hooks/use-mf-recommend'
import { mfFormSchema as mfSchema, type MFFormValues } from '@/lib/validators/mf'
import { formatINR, formatINRCompact, interpolateProjection } from '@/lib/formatters'
import { exportMFCapsule } from '@/lib/capsule-export'
import type { MFRecommendResponse } from '@/types/api'

// ─── Colours ─────────────────────────────────────────────────────────────────

const ALLOC_COLORS = { equity: '#3B82F6', midcap: '#F59E0B', debt: '#10B981' }
const CATEGORY_COLOR: Record<string, string> = { equity: '#3B82F6', midcap: '#F59E0B', debt: '#10B981' }

// ─── Input Form ──────────────────────────────────────────────────────────────

interface FormProps {
  onSubmit: (v: MFFormValues) => void
  isLoading: boolean
  sessionData: Record<string, any> | null
  setSessionData: (v: Record<string, any> | null) => void
  isExecuted: boolean
  setIsExecuted: (v: boolean) => void
}

function MFForm({ onSubmit, isLoading, sessionData, setSessionData, isExecuted, setIsExecuted }: FormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MFFormValues>({
    resolver: zodResolver(mfSchema),
    defaultValues: { age: 28, amount: 100000, risk: 'high', duration_years: 15 },
  })

  const risk = watch('risk')

  const RISK_OPTIONS = [
    { value: 'low',    label: 'Conservative', desc: 'Capital preservation', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { value: 'medium', label: 'Balanced',      desc: 'Growth + stability',  color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { value: 'high',   label: 'Aggressive',    desc: 'Maximum growth',      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  ]

  async function handleCapsuleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      setSessionData(json)
      const inputs = json.investor_profile || json.inputs || json
      if (inputs.amount || inputs.capital || inputs.investment_capital_inr) {
        setValue('amount', Number(inputs.amount || inputs.capital || inputs.investment_capital_inr))
      }
      if (inputs.tenure_years || inputs.duration_years || inputs.horizon_years) {
        setValue('duration_years', Number(inputs.tenure_years || inputs.duration_years || inputs.horizon_years))
      }
      const rawRisk = (inputs.stated_risk_appetite || inputs.risk_appetite || inputs.risk || 'high').toLowerCase()
      if (['low', 'medium', 'high'].includes(rawRisk)) {
        setValue('risk', rawRisk as 'low' | 'medium' | 'high')
      }
    } catch (err) {
      console.error('Failed to parse capsule JSON', err)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <GlassCard variant="elevated" glow="blue" shine className="p-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Build Your MF Portfolio</h2>
              <p className="text-xs text-muted-foreground">Live recommendations from MFAPI · Smart Personalization</p>
            </div>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCapsuleUpload}
              accept=".json"
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="glass"
              size="sm"
              className="gap-1.5 text-xs text-blue-400 hover:text-blue-300 border-blue-500/30 hover:border-blue-500/50"
              title="Upload previous portfolio capsule to tailor your new investment"
            >
              <Upload className="w-3.5 h-3.5" /> Import Past Capsule (.json)
            </Button>
          </div>
        </div>

        {sessionData && (() => {
          const prof = sessionData.investor_profile || sessionData.inputs || sessionData
          const badgeAge = prof.age || 25
          const badgeCap = Number(prof.investment_capital_inr || prof.capital || prof.amount || 100000)
          const badgeRisk = String(prof.risk_appetite || prof.stated_risk_appetite || prof.risk || 'High')

          return (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Past Portfolio Loaded:</span>
                  <span className="truncate text-slate-300">
                    Age {badgeAge} · ₹{badgeCap.toLocaleString('en-IN')} Capital · {badgeRisk.charAt(0).toUpperCase() + badgeRisk.slice(1)} Risk
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSessionData(null)}
                  className="text-emerald-400/80 hover:text-white font-bold px-1.5 py-0.5 rounded hover:bg-white/10"
                  title="Remove loaded capsule"
                >
                  ×
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isExecuted}
                  onChange={(e) => setIsExecuted(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30"
                />
                <span>I already invested in this past portfolio (Tailor my fresh funds to complement past investments)</span>
              </label>
            </div>
          )
        })()}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Age + Amount */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Your Age
              </label>
              <input
                type="number"
                {...register('age', { valueAsNumber: true })}
                className="w-full h-11 px-4 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                placeholder="18–100"
                min={1}
                max={100}
              />
              {errors.age && <p className="text-xs text-red-400 mt-1">{errors.age.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Investment Amount (₹)
              </label>
              <input
                type="number"
                {...register('amount', { valueAsNumber: true })}
                className="w-full h-11 px-4 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                placeholder="Min ₹1,000 · Multiple of 100"
                min={1000}
                step={100}
              />
              {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Risk selector */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {RISK_OPTIONS.map(({ value, label, desc, color }) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" value={value} {...register('risk')} className="sr-only" />
                  <div className={`p-3 rounded-xl border-2 text-center transition-all ${risk === value ? color + ' shadow-sm' : 'border-white/[0.08] text-muted-foreground hover:border-white/[0.15]'}`}>
                    <p className="text-xs font-bold">{label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Investment Duration (years)
            </label>
            <input
              type="number"
              {...register('duration_years', { valueAsNumber: true })}
              className="w-full h-11 px-4 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              placeholder="1–40 years"
              min={1}
              max={40}
            />
            {errors.duration_years && <p className="text-xs text-red-400 mt-1">{errors.duration_years.message}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full gap-2 shadow-glow-blue" disabled={isLoading}>
            <TrendingUp className="w-4 h-4" />
            Generate My Portfolio Recommendation
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-[11px] text-center text-muted-foreground/60">
            Powered by live MFAPI data · Results reflect today&apos;s NAV · Not financial advice
          </p>
        </form>
      </GlassCard>
    </motion.div>
  )
}

// ─── Results ─────────────────────────────────────────────────────────────────

interface ResultsProps {
  data: MFRecommendResponse
  request: MFFormValues
  onReset: () => void
}

function MFResults({ data, request, onReset }: ResultsProps) {
  const { allocation, top_funds, projection, rebalancing_plan } = data

  const allocSlices = [
    { name: 'Equity',  value: allocation?.equity ?? 0,  color: ALLOC_COLORS.equity  },
    { name: 'Midcap',  value: allocation?.midcap ?? 0,  color: ALLOC_COLORS.midcap  },
    { name: 'Debt',    value: allocation?.debt ?? 0,    color: ALLOC_COLORS.debt    },
  ].filter(s => s.value > 0)

  const projData = projection
    ? interpolateProjection(request.amount, projection, request.duration_years)
    : []

  const totalRebPhases = rebalancing_plan?.length ?? 0

  const [reportMeta] = useState(() => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const timeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    return {
      timestamp: `${dateStr} at ${timeStr}`,
      certId: 'FNV-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + now.getSeconds(),
    }
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Your MF Portfolio Blueprint</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Based on age {request.age} · ₹{(request.amount / 1000).toFixed(0)}K · {request.risk} risk · {request.duration_years}Y
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReportWatermark
            moduleTitle="Mutual Fund Portfolio Blueprint & Projections"
            investorDetails={`Investor Profile: Age ${request.age} · ₹${(request.amount / 1000).toFixed(0)}K Capital · ${request.risk.toUpperCase()} Risk · ${request.duration_years}-Year Horizon`}
            targetElementId="mf-portfolio-report-content"
            filenamePrefix="finovo_mf_portfolio"
          />
          <Button
            onClick={() => exportMFCapsule(request, data)}
            variant="glass"
            size="sm"
            className="no-print gap-2 text-blue-400 hover:text-blue-300 border-blue-500/30 hover:border-blue-500/50"
            title="Download full JSON portfolio metadata for offline privacy or future AI rebalancing"
          >
            <Download className="w-3.5 h-3.5" /> Save Capsule (.json)
          </Button>
          <Button onClick={onReset} variant="glass" size="sm" className="no-print gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> New Analysis
          </Button>
        </div>
      </div>

      {/* ─── Printable / Downloadable PDF Report Target Container ─── */}
      <div id="mf-portfolio-report-content" className="space-y-6 bg-[#05091a] p-5 sm:p-7 rounded-2xl border border-white/[0.08]">
        {/* Certified Report Header (visible on web & captured in PDF) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.1]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-white tracking-tight leading-none">FINOVO AI</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-400/30 text-blue-400 text-[10px] font-bold tracking-wider uppercase leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                VERIFIED ADVISOR
              </div>
            </div>
            <p className="text-sm font-bold text-slate-300 mt-2 leading-normal">
              Mutual Fund Portfolio Blueprint & Projections
            </p>
            <p className="text-xs text-slate-400 mt-0.5 leading-normal">
              Investor Profile: Age {request.age} · ₹{(request.amount / 1000).toFixed(0)}K Capital · {request.risk.toUpperCase()} Risk · {request.duration_years}-Year Horizon
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-slate-300 leading-normal">
              Generated: <span className="font-mono font-bold text-sky-400">{reportMeta.timestamp}</span>
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-1 leading-normal">
              Cert ID: {reportMeta.certId}
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1 leading-normal">
              ✓ Zero-Knowledge Architecture (0-Database Cloud Retention)
            </p>
          </div>
        </div>

        {/* Personalized Investment Strategy Card */}
        {data.marginal_context && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {data.marginal_context?.summary?.is_executed
                    ? 'Tailored Portfolio Strategy Active'
                    : 'Personalized Profile Active'}
                </h3>
              </div>
              <div className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 w-fit">
                {data.marginal_context?.summary?.is_executed ? 'Tailored to Past Holdings' : 'Goal-Aligned Plan'}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {data.marginal_context?.summary?.is_executed ? (
                <>
                  <strong>Personalized Growth Strategy:</strong> Based on your previous investments from{' '}
                  <strong className="text-white">Age {data.marginal_context?.summary?.past_investment_age || 28}</strong>, your stable Large-Cap foundation is already established. For your new{' '}
                  <strong className="text-emerald-300">₹{Number(data.marginal_context?.summary?.fresh_capital_deployed || request.amount).toLocaleString()}</strong> investment, we&apos;ve allocated more into Mid-Cap funds to capture higher returns while maintaining a steady risk balance for your current Age {request.age}. Your past investments continue running independently and are not added to this capital.
                </>
              ) : (
                <>
                  <strong>Personalized Allocation:</strong> Considering your previous investment goals from{' '}
                  <strong className="text-white">Age {data.marginal_context?.summary?.past_investment_age || 28}</strong>, 100% of your fresh{' '}
                  <strong className="text-emerald-300">₹{Number(data.marginal_context?.summary?.fresh_capital_deployed || request.amount).toLocaleString()}</strong> is deployed directly into an optimal growth mix tailored for your current age and goals.
                </>
              )}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Fresh ₹{(request.amount / 1000).toFixed(0)}K Investment Breakdown
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Large-Cap (Core Stability):</span>
                    <span className="font-semibold text-white">{data.allocation.equity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mid-Cap (Higher Growth):</span>
                    <span className="font-semibold text-emerald-300">{data.allocation.midcap}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Debt & Liquid (Safety Buffer):</span>
                    <span className="font-semibold text-white">{data.allocation.debt}%</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2">
                  Why This Allocation?
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Past Reference:</span>
                    <span className="font-semibold text-white">Age {data.marginal_context?.summary?.past_investment_age || 28} Portfolio</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strategy:</span>
                    <span className="font-semibold text-sky-300">
                      {data.marginal_context?.summary?.is_executed ? 'Higher Growth Tilt' : 'Standard Equilibrium'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Investment Scope:</span>
                    <span className="font-semibold text-white">Fresh Capital Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Allocation + Projection summary */}
        <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Best Case',   value: formatINR(projection.optimistic, true),   cagr: ((Math.pow(projection.optimistic / request.amount, 1 / request.duration_years) - 1) * 100).toFixed(1), color: 'text-emerald-400' },
          { label: 'Most Likely',     value: formatINR(projection.expected, true),     cagr: ((Math.pow(projection.expected / request.amount, 1 / request.duration_years) - 1) * 100).toFixed(1), color: 'text-blue-400' },
          { label: 'Worst Case', value: formatINR(projection.conservative, true), cagr: ((Math.pow(projection.conservative / request.amount, 1 / request.duration_years) - 1) * 100).toFixed(1), color: 'text-amber-400' },
        ].map(({ label, value, cagr, color }) => (
          <GlassCard key={label} variant="default" shine className="p-4 text-center">
            <p className={`text-2xl font-black ${color} font-mono tracking-tight leading-tight`}>{value}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1.5 leading-snug">{label} in {request.duration_years}Y</p>
            <p className="text-[10px] font-mono text-muted-foreground/75 mt-0.5 leading-snug">(~{cagr}% p.a.)</p>
          </GlassCard>
        ))}
      </div>

      {/* Allocation donut + Fund list */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard variant="elevated" glow="blue" shine className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-foreground">Asset Allocation</h3>
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
                        <p className="text-xs font-bold text-foreground">{(payload[0].payload as typeof allocSlices[0]).name}: {payload[0].value}%</p>
                        <p className="text-xs text-muted-foreground">{formatINR((payload[0].value as number) / 100 * request.amount)}</p>
                      </div>
                    ) : null
                  } />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-foreground font-mono tracking-tight">{formatINR(request.amount, true)}</span>
                <span className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase mt-0.5">INVESTED</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              {allocSlices.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-muted-foreground">{name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-xs font-bold text-foreground font-mono w-8 text-right">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Fund list */}
        <GlassCard variant="default" shine className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">Top Fund Picks</h3>
            <span className="ml-auto text-[10px] text-muted-foreground">Live CAGR from MFAPI</span>
          </div>
          <div className="space-y-3">
            {(top_funds ?? []).map((fund, i) => (
              <div key={fund.name} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] min-h-[60px]">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0" style={{ backgroundColor: (CATEGORY_COLOR[fund.category] || '#3B82F6') + '18', borderColor: (CATEGORY_COLOR[fund.category] || '#3B82F6') + '40' }}>
                    <span className="text-xs font-bold font-mono" style={{ color: CATEGORY_COLOR[fund.category] || '#3B82F6' }}>{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground leading-normal">{fund.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">{fund.fund_house} · {fund.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center shrink-0 pl-3">
                  <span className="text-sm font-bold text-emerald-400 font-mono tracking-tight leading-normal">
                    {fund.cagr_inception.toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-wider leading-normal mt-0.5">
                    CAGR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Projection chart */}
      <GlassCard variant="elevated" shine className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-foreground">{request.duration_years}-Year Wealth Projection</h3>
          <span className="ml-auto flex items-center gap-3 text-[10px]">
            {[{ label: 'Best Case', color: '#34d399' }, { label: 'Most Likely', color: '#3b82f6' }, { label: 'Worst Case', color: '#f59e0b' }].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1 text-muted-foreground"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>
            ))}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={projData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              {[{ id: 'opt', color: '#34d399' }, { id: 'exp', color: '#3b82f6' }, { id: 'con', color: '#f59e0b' }].map(({ id, color }) => (
                <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
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
                <div className="glass-elevated border border-white/10 rounded-xl px-3 py-2.5 min-w-[160px]">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Year {label}</p>
                  {payload.map((p) => (
                    <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-xs capitalize text-muted-foreground">{p.name === 'optimistic' ? 'Best Case' : p.name === 'expected' ? 'Most Likely' : p.name === 'conservative' ? 'Worst Case' : p.name}</span>
                      <span className="text-xs font-bold text-foreground tabular">{formatINR(p.value as number, true)}</span>
                    </div>
                  ))}
                </div>
              ) : null
            } />
            <Area type="monotone" dataKey="optimistic"   stroke="#34d399" strokeWidth={2}   fill="url(#grad-opt)" dot={false} activeDot={{ r: 3, fill: '#34d399' }} />
            <Area type="monotone" dataKey="expected"     stroke="#3b82f6" strokeWidth={2.5} fill="url(#grad-exp)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
            <Area type="monotone" dataKey="conservative" stroke="#f59e0b" strokeWidth={2}   fill="url(#grad-con)" dot={false} activeDot={{ r: 3, fill: '#f59e0b' }} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Rebalancing plan */}
      {(rebalancing_plan ?? []).length > 0 && (
        <GlassCard variant="subtle" className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <RefreshCw className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-foreground">Phased Rebalancing Plan</h3>
            <span className="ml-auto text-[10px] text-muted-foreground">{totalRebPhases} phases</span>
          </div>
          <div className="space-y-3">
            {(rebalancing_plan ?? []).map((phase, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold font-mono text-violet-400 leading-none">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground leading-normal">{phase.phase}</p>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden mt-1.5 bg-white/[0.06]">
                    <div className="bg-blue-400 rounded-full" style={{ width: `${phase.equity}%` }} />
                    <div className="bg-amber-400 rounded-full" style={{ width: `${phase.midcap}%` }} />
                    <div className="bg-emerald-400 rounded-full" style={{ width: `${phase.debt}%` }} />
                  </div>
                </div>
                <div className="text-right text-[10px] shrink-0 font-mono leading-normal space-y-0.5">
                  <p className="text-blue-400 font-bold leading-normal">E:{phase.equity}%</p>
                  <p className="text-amber-400 font-bold leading-normal">M:{phase.midcap}%</p>
                  <p className="text-emerald-400 font-bold leading-normal">D:{phase.debt}%</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-blue-500/[0.05] border border-blue-500/[0.1]">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Rebalancing schedule designed to reduce equity exposure as you approach your goal — protecting accumulated wealth while maintaining growth potential.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Compliance and Watermark Footer */}
      <div className="pt-5 border-t border-white/[0.1] space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-300 gap-2">
          <span>🔒 FINOVOAI VERIFIED ADVISORY • ZERO-KNOWLEDGE ARCHITECTURE</span>
          <span className="font-mono text-[11px] text-slate-400">STAMP: {reportMeta.timestamp}</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Regulatory Disclaimer: This investment advisory summary is generated strictly for educational and portfolio planning purposes.
          FinovoAI is not a SEBI-registered investment advisor. Recommendations are calculated from live quantitative feeds (MFAPI.in). Past performance does not guarantee future returns.
        </p>
      </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-center text-muted-foreground/50 pb-4">
        AI-generated recommendations are for educational purposes only. Past performance is not indicative of future results.
        Always consult a SEBI-registered investment advisor before making financial decisions.
      </p>
    </motion.div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center py-16">
      <GlassCard variant="default" className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4">
          <ChevronRight className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-2">Recommendation Failed</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {error.message || 'Unable to fetch recommendation. Make sure the backend service is reachable.'}
        </p>
        <Button onClick={onRetry} size="sm" variant="glass" className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" /> Try Again
        </Button>
      </GlassCard>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MutualFundsPage() {
  const [lastRequest, setLastRequest] = useState<MFFormValues | null>(null)
  const [sessionData, setSessionData] = useState<Record<string, any> | null>(null)
  const [isExecuted, setIsExecuted] = useState<boolean>(true)
  const { mutate, data, isPending, error, reset } = useMFRecommend()

  function handleSubmit(values: MFFormValues) {
    setLastRequest(values)
    mutate({
      ...values,
      session_data: sessionData || undefined,
      is_executed: isExecuted,
    })
  }

  function handleReset() {
    reset()
    setLastRequest(null)
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Mutual Fund Advisor</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">AI-Powered Fund Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real recommendations from live MFAPI data — personalized to your exact profile.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingScreen type="mf" />
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorState error={error} onRetry={handleReset} />
          </motion.div>
        ) : data && lastRequest ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MFResults data={data} request={lastRequest} onReset={handleReset} />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MFForm
              onSubmit={handleSubmit}
              isLoading={isPending}
              sessionData={sessionData}
              setSessionData={setSessionData}
              isExecuted={isExecuted}
              setIsExecuted={setIsExecuted}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

