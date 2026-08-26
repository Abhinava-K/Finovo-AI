'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  accent?: 'blue' | 'violet' | 'green'
  className?: string
  animate?: boolean
}

const eyebrowAccent = {
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  green: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
} as const

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  accent = 'blue',
  className,
  animate = true,
}: SectionHeaderProps) {
  const content = (
    <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}>
      {eyebrow && (
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider',
            eyebrowAccent[accent]
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-base text-muted-foreground leading-relaxed', align === 'center' && 'max-w-2xl')}>
          {subtitle}
        </p>
      )}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {content}
    </motion.div>
  )
}
