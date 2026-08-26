'use client'

import Link from 'next/link'
import { Sparkles, TrendingUp, Bitcoin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-950/90 border-t border-white/10 mt-auto py-10">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                FinovoAI
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm">
              AI-powered personalized investment advisor for mutual funds and crypto portfolios.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Live Mutual Funds Data
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Bitcoin className="w-3 h-3 text-amber-400" />
              Live Crypto Analytics
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FinovoAI. All rights reserved.</p>
          <p className="text-center sm:text-right max-w-md">
            ⚠️ Educational platform. AI suggestions do not constitute financial advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
