'use client'

import { useRef, useEffect, useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BrainCircuit, Send, Trash2, Sparkles, TrendingUp, Bitcoin,
  BarChart3, HelpCircle, Loader2, AlertTriangle, Copy, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { useAgentChat } from '@/hooks/use-agent-chat'
import { formatRelativeTime } from '@/lib/formatters'

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { icon: TrendingUp, text: 'What are the best mid-cap funds for a 10-year SIP?', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { icon: Bitcoin,    text: 'Build a crypto portfolio for ₹50,000 with medium risk', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  { icon: BarChart3,  text: 'How should a 25-year-old invest ₹1L for 15 years?', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { icon: HelpCircle, text: 'Explain the difference between equity and debt funds', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { icon: TrendingUp, text: 'Compare HDFC Top 100 vs Axis Bluechip fund returns', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { icon: Bitcoin,    text: 'What is the risk of investing in Bitcoin long-term?', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
]

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-emerald-400/60"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/10 text-muted-foreground/60 hover:text-muted-foreground"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

function MessageBubble({ role, content, timestamp, isLoading }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isUser
          ? 'bg-blue-500/20 border border-blue-500/30'
          : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
      }`}>
        {isUser
          ? <span className="text-xs font-black text-blue-400">U</span>
          : <BrainCircuit className="w-4 h-4 text-emerald-400" />
        }
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`group relative rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-500/15 border border-blue-500/20 rounded-tr-sm'
            : 'glass border border-white/[0.08] rounded-tl-sm'
        }`}>
          {isLoading ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="text-sm text-blue-100 leading-relaxed">{content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none
              prose-p:text-sm prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-1.5
              prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
              prose-pre:bg-white/[0.05] prose-pre:border prose-pre:border-white/[0.08] prose-pre:rounded-xl prose-pre:text-xs
              prose-ul:text-muted-foreground prose-li:my-0.5
              prose-ol:text-muted-foreground
              prose-table:border-collapse prose-table:w-full
              prose-th:text-xs prose-th:font-semibold prose-th:text-foreground prose-th:border prose-th:border-white/[0.1] prose-th:px-3 prose-th:py-2
              prose-td:text-xs prose-td:text-muted-foreground prose-td:border prose-td:border-white/[0.06] prose-td:px-3 prose-td:py-1.5
              prose-blockquote:border-l-blue-400 prose-blockquote:text-muted-foreground prose-blockquote:italic
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
          {!isLoading && !isUser && (
            <div className="absolute top-2 right-2">
              <CopyButton text={content} />
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground/50 px-1">{formatRelativeTime(timestamp)}</span>
      </div>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full gap-6 py-8"
    >
      {/* Animated brain icon */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
          <BrainCircuit className="w-8 h-8 text-emerald-400" />
        </div>
        <motion.div
          className="absolute -inset-1 rounded-2xl border border-emerald-400/20"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="text-center max-w-sm">
        <h3 className="text-base font-bold text-foreground mb-1.5">Ask me anything about investing</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          I use live MFAPI and CoinGecko data to answer your questions — not static templates.
          Ask about mutual funds, crypto, SIPs, rebalancing, or any investment strategy.
        </p>
      </div>

      {/* Suggested prompts */}
      <div className="grid sm:grid-cols-2 gap-2 w-full max-w-xl">
        {SUGGESTED_PROMPTS.slice(0, 4).map(({ icon: Icon, text, color, bg, border }) => (
          <button
            key={text}
            onClick={() => onSend(text)}
            className={`flex items-start gap-2.5 p-3 rounded-xl border ${border} ${bg} hover:opacity-80 transition-opacity text-left`}
          >
            <Icon className={`w-3.5 h-3.5 ${color} shrink-0 mt-0.5`} />
            <span className="text-xs text-foreground/80 leading-snug">{text}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdvisorPage() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAgentChat()
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll disabled per user preference

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) return
    sendMessage(trimmed)
    setInputValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  function handleSuggestion(text: string) {
    sendMessage(text)
    inputRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="container mx-auto px-4 lg:px-6 max-w-4xl flex flex-col h-[calc(100vh-6.5rem)] max-h-[calc(100vh-6.5rem)] overflow-hidden">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AI Advisor</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Investment Intelligence</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live MFAPI + CoinGecko tools · LangGraph ReAct Reasoning Agent
          </p>
        </div>
        {messages.length > 0 && (
          <Button onClick={clearMessages} variant="glass" size="sm" className="gap-2 shrink-0">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </motion.div>

      {/* Chat area */}
      <GlassCard variant="elevated" className="flex-1 flex flex-col overflow-hidden min-h-0 border border-white/[0.08] shadow-2xl relative">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 min-h-0 scrollbar-thin">
          {isEmpty ? (
            <EmptyState onSend={handleSuggestion} />
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    isLoading={msg.isLoading}
                  />
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Error bar */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/[0.08] border-t border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested prompts when not empty */}
        {!isEmpty && !isLoading && (
          <div className="px-4 py-2 border-t border-white/[0.06] flex gap-2 overflow-x-auto scrollbar-thin shrink-0">
            {SUGGESTED_PROMPTS.slice(0, 3).map(({ icon: Icon, text, color }) => (
              <button
                key={text}
                onClick={() => handleSuggestion(text)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-xs text-muted-foreground whitespace-nowrap shrink-0"
              >
                <Icon className={`w-3 h-3 ${color} shrink-0`} />
                {text.length > 40 ? text.slice(0, 40) + '…' : text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/[0.06] shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about mutual funds, crypto, SIPs, rebalancing…"
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all resize-none leading-relaxed"
                style={{ minHeight: '46px', maxHeight: '140px' }}
                disabled={isLoading}
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/30">⏎</span>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="shrink-0 h-[46px] w-[46px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_12px_rgba(52,211,153,0.25)] disabled:opacity-40"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </Button>
          </form>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 mt-2 px-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400/70 font-medium">
                AI is reasoning with live market data…
              </span>
            </motion.div>
          )}

          <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
            AI responses are for educational purposes only · Not financial advice · Shift+Enter for new line
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
