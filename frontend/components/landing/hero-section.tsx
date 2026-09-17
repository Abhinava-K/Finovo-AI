'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, Sparkles, TrendingUp, Bitcoin,
  Shield, Zap, BrainCircuit, CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

// ─── Mock data for hero product preview ─────────────────────────────────────

const MOCK_ALLOCATION = [
  { label: 'Equity',  pct: 50, color: '#3B82F6', amount: '₹50,000' },
  { label: 'Midcap',  pct: 30, color: '#F59E0B', amount: '₹30,000' },
  { label: 'Debt',    pct: 20, color: '#10B981', amount: '₹20,000' },
]

const DONUT_GRADIENT =
  'conic-gradient(#3B82F6 0deg 180deg, #F59E0B 180deg 288deg, #10B981 288deg 360deg)'

// ─── Sub-components ──────────────────────────────────────────────────────────

function CSSDonut() {
  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <div className="w-[88px] h-[88px] rounded-full" style={{ background: DONUT_GRADIENT }} />
      <div className="absolute inset-[12px] rounded-full bg-[#0c1422] flex flex-col items-center justify-center">
        <span className="text-[9px] font-semibold text-muted-foreground leading-tight text-center">
          YOUR<br />PLAN
        </span>
      </div>
    </div>
  )
}

/** Main portfolio card — largest floating element */
function PortfolioCard() {
  return (
    <GlassCard
      variant="elevated"
      glow="blue"
      shine
      className="w-[320px] p-5 border-glow-blue"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Portfolio Analysis
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Age 28 · High Risk · 15 years
          </p>
        </div>
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
      </div>

      {/* Donut + breakdown */}
      <div className="flex items-center gap-5 mb-5">
        <CSSDonut />
        <div className="flex flex-col gap-2 flex-1">
          {MOCK_ALLOCATION.map(({ label, pct, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium text-foreground">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-1 rounded-full"
                  style={{ width: `${pct * 0.6}px`, backgroundColor: color, opacity: 0.7 }}
                />
                <span className="text-xs font-semibold text-foreground tabular w-8 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-white/[0.06] mb-4" />

      {/* Projection */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Expected in 15 years
          </p>
          <p className="text-2xl font-bold text-foreground tabular tracking-tight mt-0.5">
            ₹7.2L
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">↑ +621% · 14.2% p.a.</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[10px] text-amber-400 font-medium">Opt ₹13.7L</span>
          <span className="text-[10px] text-blue-400 font-medium">Exp ₹7.2L</span>
          <span className="text-[10px] text-muted-foreground font-medium">Con ₹3.4L</span>
        </div>
      </div>
    </GlassCard>
  )
}

/** Fund card — floating top-right */
function FundCard() {
  return (
    <GlassCard
      variant="subtle"
      shine
      className="w-[220px] p-3.5 border border-white/[0.07]"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              Top Equity Pick
            </span>
          </div>
          <p className="text-xs font-semibold text-foreground leading-snug">
            HDFC Top 100 Fund
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Direct · Growth</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-emerald-400">14.2% CAGR</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Consistent
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

/** AI chat card — floating bottom-right */
function AIChatCard() {
  return (
    <GlassCard
      variant="subtle"
      shine
      className="w-[260px] p-3.5 border border-white/[0.07]"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <BrainCircuit className="w-3 h-3 text-white" />
        </div>
        <span className="text-[11px] font-semibold text-foreground">AI Advisor</span>
        <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      {/* User query bubble */}
      <div className="ml-auto w-fit max-w-[160px] bg-blue-500/15 border border-blue-500/20 rounded-xl rounded-tr-sm px-2.5 py-1.5 mb-2">
        <p className="text-[10px] text-blue-300 leading-relaxed">
          &ldquo;Best SIP for 10 years, medium risk?&rdquo;
        </p>
      </div>
      {/* AI response */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-tl-sm px-2.5 py-1.5">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Based on live MFAPI data — here are your top picks:
        </p>
        <div className="mt-1.5 space-y-1">
          {[
            { name: 'SBI Bluechip', cagr: '12.8%' },
            { name: 'Axis Midcap', cagr: '16.1%' },
          ].map((f) => (
            <div key={f.name} className="flex items-center justify-between">
              <span className="text-[9px] text-foreground/70">{f.name}</span>
              <span className="text-[9px] text-emerald-400 font-semibold">{f.cagr}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

// ─── Framer Motion variants ──────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const visualVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.96 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 },
  },
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-dvh items-center overflow-hidden pt-16"
    >
      {/* Ambient focal glow — blue center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/[0.07] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

          {/* ── Left: Text Content ─────────────────────────────────────── */}
          <motion.div
            style={{ y, opacity }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 max-w-2xl"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                AI-Powered Investment Intelligence
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-black leading-[1.05] tracking-[-0.04em]">
                <span className="text-foreground block">Investment Advice</span>
                <span className="text-foreground block">That{' '}
                  <span className="text-gradient-hero">Thinks First.</span>
                </span>
              </h1>
            </motion.div>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              Most platforms give everyone the same portfolio.{' '}
              <span className="text-foreground font-medium">FinovoAI calibrates to your exact age,
              risk capacity, and time horizon</span>{' '}— then fetches live market data before making
              a single recommendation.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 shadow-glow-blue">
                <Link href="/mutual-funds">
                  <TrendingUp className="w-4 h-4" />
                  Plan My Mutual Fund Portfolio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass" className="gap-2">
                <Link href="/crypto">
                  <Bitcoin className="w-4 h-4" />
                  Build Crypto Portfolio
                </Link>
              </Button>
            </motion.div>

            {/* Trust bullets */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                { icon: Zap, text: 'Live market data — MFAPI & CoinGecko' },
                { icon: Shield, text: 'No generic templates. Ever.' },
                { icon: CheckCircle, text: 'Age-adaptive allocation model' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* Mobile: single card preview */}
            <motion.div variants={itemVariants} className="lg:hidden mt-2">
              <PortfolioCard />
            </motion.div>
          </motion.div>

          {/* ── Right: Product Preview ─────────────────────────────────── */}
          <motion.div
            variants={visualVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col items-center relative"
          >
            {/* Fund card — floats top-left of main card */}
            <motion.div
              className="absolute -top-8 -left-16 z-10"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <FundCard />
            </motion.div>

            {/* Main portfolio card */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PortfolioCard />
            </motion.div>

            {/* AI chat card — floats bottom-right of main card */}
            <motion.div
              className="absolute -bottom-10 -right-12 z-10"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <AIChatCard />
            </motion.div>

            {/* Subtle glow behind cards */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-blue-500/[0.04] blur-2xl scale-110" />
          </motion.div>
        </div>

        {/* ── Scroll indicator ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[11px] text-muted-foreground/50 font-medium tracking-widest uppercase">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent rounded-full"
          />
        </motion.div>
      </div>
    </section>
  )
}
