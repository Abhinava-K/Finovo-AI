'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { loadingMessages } from '@/lib/design-tokens'

interface LoadingScreenProps {
  type?: 'mf' | 'crypto' | 'agent'
  className?: string
}

export function LoadingScreen({ type = 'mf', className }: LoadingScreenProps) {
  const messages = loadingMessages[type]
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 1600)

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 92))
    }, 400)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
    }
  }, [messages.length])

  const accentColor =
    type === 'crypto'
      ? 'from-violet-500 to-purple-600'
      : type === 'agent'
      ? 'from-emerald-500 to-teal-600'
      : 'from-blue-500 to-indigo-600'

  const glowColor =
    type === 'crypto'
      ? 'shadow-glow-violet'
      : type === 'agent'
      ? 'shadow-glow-green'
      : 'shadow-glow-blue'

  return (
    <div className={`flex flex-col items-center justify-center py-28 gap-10 ${className ?? ''}`}>
      {/* Animated icon */}
      <div className="relative">
        {/* Outer pulsing ring */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accentColor} opacity-20 blur-xl`}
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Icon container */}
        <div
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${accentColor} flex items-center justify-center ${glowColor}`}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-xl border-2 border-white/20 border-t-white/70"
          />
          <Sparkles className="w-6 h-6 text-white relative z-10" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-0.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${accentColor} rounded-full`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Rotating message */}
      <div className="h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-sm text-muted-foreground text-center font-medium"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${accentColor}`}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
