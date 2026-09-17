'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { GlassCard } from '@/components/ui/glass-card'

const testimonials = [
  {
    quote:
      "I've tried Groww, Zerodha, and every major platform. None of them told me *why* they were recommending a fund. FinovoAI explained it like a financial advisor, then showed me the live NAV. That transparency is unmatched.",
    name: 'Priya Mehta',
    role: 'Software Engineer, Bangalore',
    avatar: 'PM',
    accentColor: 'bg-blue-500',
    stars: 5,
  },
  {
    quote:
      "The crypto module made me rethink my whole approach. I thought I could handle 80% drawdown — the advisor walked me through what that actually means in rupees, and I switched to 50%. Probably saved me from a panic sell in the next crash.",
    name: 'Arjun Singh',
    role: 'Product Manager, Delhi',
    avatar: 'AS',
    accentColor: 'bg-violet-500',
    stars: 5,
  },
  {
    quote:
      "As a 23-year-old with ₹5,000/month to invest, most tools either ignore me or push me into generic SIPs. The age-adaptive allocation felt like it was actually built for someone in my situation.",
    name: 'Tanvi Reddy',
    role: 'Data Analyst, Hyderabad',
    avatar: 'TR',
    accentColor: 'bg-emerald-500',
    stars: 5,
  },
  {
    quote:
      "I asked the AI advisor to compare mid-cap funds for a 10-year SIP. It pulled live returns, highlighted consistency metrics, and even flagged one fund with recent AUM bloat. No advisor has ever done that in real time.",
    name: 'Rahul Gupta',
    role: 'Finance Professional, Mumbai',
    avatar: 'RG',
    accentColor: 'bg-amber-500',
    stars: 5,
  },
  {
    quote:
      "The rebalancing plan blew me away. Most tools tell you what to buy. This one told me when to shift from equity to debt as I approach my goal — with actual percentages per phase.",
    name: 'Kavitha Nair',
    role: 'Doctor, Chennai',
    avatar: 'KN',
    accentColor: 'bg-blue-500',
    stars: 5,
  },
  {
    quote:
      "Used the AI chat to ask about tax implications of switching funds. It pulled in context about my profile and gave me a nuanced answer. It didn't try to be a tax advisor, but it pointed me exactly to what I needed to research.",
    name: 'Vikram Iyer',
    role: 'Entrepreneur, Pune',
    avatar: 'VI',
    accentColor: 'bg-violet-500',
    stars: 5,
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-white/[0.01]">
      {/* Subtle grid border */}
      <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">

        <SectionHeader
          eyebrow="What users say"
          title="Real investors. Real decisions."
          subtitle="From first-time investors to seasoned portfolio managers — here's how FinovoAI changed the way they think about their money."
          className="mb-14"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {testimonials.map(({ quote, name, role, avatar, accentColor, stars }) => (
            <motion.div key={name} variants={cardVariants}>
              <GlassCard
                variant="default"
                shine
                className="p-6 h-full flex flex-col hover:bg-white/[0.04] transition-colors"
              >
                {/* Quote icon */}
                <Quote className="w-6 h-6 text-muted-foreground/20 mb-3 shrink-0" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/[0.06]">
                  <div className={`w-9 h-9 rounded-full ${accentColor} flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-black text-white">{avatar}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{role}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
