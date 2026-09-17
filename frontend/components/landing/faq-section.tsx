'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Is the data actually live, or cached from weeks ago?',
    a: 'Every recommendation triggers a fresh API call. Mutual fund NAV data comes from MFAPI.in in real time, and crypto prices from CoinGecko. The only caching is a short-lived server-side cache to prevent rate limiting — your recommendation reflects today\'s market, not last week\'s.',
  },
  {
    q: 'How does the AI generate my portfolio — is it just ChatGPT with a prompt?',
    a: 'No. We use a LangGraph ReAct (Reason + Act) agent running Groq\'s Llama 3.3-70b. The agent uses specialized tools: a mutual fund analyzer tool and a crypto portfolio builder tool. It fetches real data, reasons about your specific profile, and constructs a recommendation — not just fills in a template.',
  },
  {
    q: 'What do the three projection scenarios (Optimistic / Expected / Conservative) mean?',
    a: 'They represent different return assumptions based on the asset class\'s historical performance range. Optimistic assumes returns in the top third of historical performance. Expected uses long-term median CAGR. Conservative uses the lower third. All three use the same allocation — only the assumed growth rate changes.',
  },
  {
    q: 'Why does the crypto module ask about max drawdown instead of just "risk tolerance"?',
    a: '"Risk tolerance" is too vague for crypto. BTC has dropped 80%+ multiple times. Max drawdown is a concrete question: how much of your investment can you watch disappear without panic-selling? 20% = very conservative, 50% = moderate, 80% = high conviction with a long horizon. The allocation is built around this limit.',
  },
  {
    q: 'Can I trust this for actual investment decisions?',
    a: 'FinovoAI is an educational AI platform — not a SEBI-registered financial advisor. The recommendations reflect sound investment principles and live market data, but you should treat them as a starting point for research, not a directive. Always verify with a qualified financial advisor before making real investment decisions.',
  },
  {
    q: 'What is the rebalancing plan, and do I need to follow it exactly?',
    a: 'The rebalancing plan is a phased schedule that shifts your equity/debt ratio as you approach your goal date — reducing volatility as your horizon shortens. It\'s a guideline informed by modern portfolio theory, not a strict prescription. You can adapt it to tax events, market conditions, or changes in your situation.',
  },
  {
    q: 'Can the AI advisor answer general investment questions, not just give me a portfolio?',
    a: 'Yes. The AI advisor chat (powered by the same LangGraph agent) can answer freeform questions about mutual funds, crypto, investment strategy, and more — using the same live data tools. Ask it to compare specific funds, explain concepts, or explore hypothetical scenarios.',
  },
  {
    q: 'What happens if MFAPI or CoinGecko is down?',
    a: 'The backend handles API failures gracefully with clear error messages. If a live data fetch fails, the system will surface an error rather than silently falling back to stale data. You\'ll know if a recommendation was made without live prices.',
  },
]

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 text-left gap-4 group"
      >
        <span className={cn('text-sm font-semibold leading-snug transition-colors', isOpen ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="shrink-0"
        >
          <ChevronDown className={cn('w-4 h-4 transition-colors', isOpen ? 'text-blue-400' : 'text-muted-foreground/40')} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i))

  // Split into two columns
  const half = Math.ceil(faqs.length / 2)
  const left = faqs.slice(0, half)
  const right = faqs.slice(half)

  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-6">

        <SectionHeader
          eyebrow="Frequently Asked"
          title="Questions worth answering honestly."
          subtitle="We don't hide how this works. Here's everything you should know before trusting an AI with your money."
          className="mb-14"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 divide-y divide-white/[0.04]">
            {left.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                isOpen={openIdx === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 divide-y divide-white/[0.04]">
            {right.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                isOpen={openIdx === i + half}
                onToggle={() => toggle(i + half)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
