'use client'

import Link from 'next/link'
import { Sparkles, MessageSquare } from 'lucide-react'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            FinovoAI
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/mutual-funds" className="hover:text-white transition-colors">Mutual Funds</Link>
          <Link href="/crypto" className="hover:text-white transition-colors">Crypto</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/advisor"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 hover:opacity-90 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Advisor
          </Link>
        </div>
      </nav>
    </header>
  )
}
