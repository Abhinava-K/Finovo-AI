import Link from 'next/link'
import { Sparkles, TrendingUp, ShieldCheck, Cpu, ArrowRight, Zap, LineChart, Lock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-16 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center my-12 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 1 Architecture Active</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
          Investment Advice That <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Thinks Before It Recommends</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          AI-powered personalized financial recommendations for mutual funds and cryptocurrency portfolios. Risk-calibrated algorithms tailored to your unique financial profile.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Launch AI Advisor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-800/80 hover:border-slate-700 transition-all"
          >
            <span>View Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm flex flex-col justify-between hover:border-blue-500/40 transition-colors">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Mutual Fund Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time integration with Indian mutual funds API for risk-adjusted returns calculation, Sharpe ratio analysis, and SIP modeling.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-blue-400 font-medium">
            <span>MFAPI Data Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Crypto Market Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Live CoinGecko market telemetry, volatility assessment, and market cycle timing for crypto allocation strategies.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-indigo-400 font-medium">
            <span>CoinGecko Feeds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm flex flex-col justify-between hover:border-purple-500/40 transition-colors">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Gemini Pro Reasoning</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Chain-of-thought AI investment reasoning engine evaluating goal horizons, risk tolerance, and tax optimization.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-medium">
            <span>AI Agent Core</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>

      {/* System Status Banner */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/50 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">System Architecture & Clean Imports</h4>
            <p className="text-xs text-slate-400">Phase 1 root layout, providers, and component stubs verified.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            Next.js 15 App Router
          </span>
          <span className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
            FastAPI Backend Ready
          </span>
        </div>
      </section>
    </div>
  )
}
