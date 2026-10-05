import type { Metadata } from 'next'
import { BrainCircuit, Database, Zap, Shield, TrendingUp, Bitcoin, Code2, GitBranch } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About | FinovoAI',
  description: 'How FinovoAI works — methodology, data sources, AI architecture, and the team behind the recommendations.',
}

const TECH_STACK = [
  { name: 'Next.js 15', desc: 'App Router · TypeScript · React 18', icon: Code2, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { name: 'FastAPI',    desc: 'Python · Production-grade REST API', icon: Zap,       color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { name: 'LangGraph',  desc: 'ReAct Agent · Tool-use reasoning',   icon: GitBranch, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  { name: 'AI Core',    desc: 'LangGraph · ReAct Agent Loop',      icon: BrainCircuit, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { name: 'MFAPI.in',  desc: '5,000+ mutual funds · Live NAV',      icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { name: 'CoinGecko', desc: '100+ crypto assets · Real-time',      icon: Bitcoin,   color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
]

const PRINCIPLES = [
  { title: 'Live data, not templates', body: 'Every recommendation triggers a fresh API call. We never serve pre-computed portfolios — your results reflect today\'s NAV and market prices.' },
  { title: 'Transparent reasoning', body: 'The AI explains why each fund or coin was selected, not just what. You see the logic, not just the output.' },
  { title: 'Risk-first design', body: 'We ask hard questions about drawdown tolerance before building any portfolio. A portfolio you can\'t hold through volatility isn\'t a good portfolio.' },
  { title: 'Educational purpose', body: 'FinovoAI is a demonstration of AI-powered investment intelligence. Always verify recommendations with a SEBI-registered financial advisor.' },
]

export default function AboutPage() {
  return (
    <div style={{ zoom: 1.1 }}>
      <div className="page-content container mx-auto px-4 lg:px-6 max-w-4xl">

      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Methodology
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
          How FinovoAI works
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A LangGraph ReAct agent integrated with live financial data APIs and wrapped in a production-grade FastAPI backend.
        </p>
      </div>

      {/* Architecture overview */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-foreground mb-6">System Architecture</h2>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
            {['Your Request', '→', 'FastAPI Backend', '→', 'LangGraph ReAct Agent', '→', 'Live Data APIs', '→', 'AI Response'].map((item, i) => (
              item === '→'
                ? <span key={i} className="text-muted-foreground/30 text-lg font-bold hidden sm:block">→</span>
                : (
                  <div key={i} className="flex-1 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                    <span className="text-xs font-semibold text-foreground">{item}</span>
                  </div>
                )
            ))}
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/[0.1]">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-foreground">Data Pipeline</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The ReAct agent has access to two tools: a Mutual Fund tool (queries MFAPI for live NAV data across 5,000+ funds) and a Crypto tool (queries CoinGecko for real-time prices and market caps). The agent selects which tool to call based on your query.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-violet-500/[0.05] border border-violet-500/[0.1]">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-foreground">AI Reasoning</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our AI inference engine runs with high-performance response times. The LangGraph ReAct loop lets the model Reason (form a hypothesis), Act (call a tool), Observe (process the result), and repeat — until it&apos;s confident in its recommendation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech stack */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-foreground mb-6">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH_STACK.map(({ name, desc, icon: Icon, color, bg, border }) => (
            <div key={name} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
              <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <p className="text-sm font-bold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Design principles */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-foreground mb-6">Design Principles</h2>
        <div className="space-y-3">
          {PRINCIPLES.map(({ title, body }, i) => (
            <div key={title} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[11px] font-black text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/[0.15] mb-8">
        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Educational Platform Disclaimer</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            FinovoAI is an AI-powered educational demonstration platform. All recommendations are generated for illustrative purposes only and do not constitute financial advice. Past performance is not indicative of future results.
            Before making any investment decision, please consult a SEBI-registered investment advisor who can assess your complete financial situation.
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}
