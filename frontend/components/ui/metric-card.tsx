import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GlassCard } from './glass-card'

interface MetricCardProps {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: React.ReactNode
  accent?: 'blue' | 'violet' | 'green' | 'amber'
  className?: string
  animate?: boolean
}

const accentMap = {
  blue: {
    iconBg: 'bg-blue-500/10 text-blue-400',
    trend: 'text-blue-400',
    border: 'border-blue-500/10',
  },
  violet: {
    iconBg: 'bg-violet-500/10 text-violet-400',
    trend: 'text-violet-400',
    border: 'border-violet-500/10',
  },
  green: {
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    trend: 'text-emerald-400',
    border: 'border-emerald-500/10',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-400',
    trend: 'text-amber-400',
    border: 'border-amber-500/10',
  },
} as const

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  accent = 'blue',
  className,
  animate = true,
}: MetricCardProps) {
  const colors = accentMap[accent]

  const trendColor =
    trend === 'up'
      ? 'text-positive'
      : trend === 'down'
      ? 'text-negative'
      : 'text-neutral-metric'

  const Wrapper = animate ? motion.div : 'div'
  const wrapperProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
      }
    : {}

  return (
    <Wrapper {...(wrapperProps as object)}>
      <GlassCard
        className={cn('p-5 flex flex-col gap-4', colors.border, className)}
        shine
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          {icon && (
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.iconBg)}>
              {icon}
            </div>
          )}
        </div>

        <div>
          <p className="text-2xl font-bold text-foreground tabular tracking-tight leading-none">
            {value}
          </p>
          {(subValue || trendValue) && (
            <div className="flex items-center gap-2 mt-1.5">
              {subValue && (
                <span className="text-xs text-muted-foreground">{subValue}</span>
              )}
              {trendValue && (
                <span className={cn('text-xs font-semibold', trendColor)}>{trendValue}</span>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </Wrapper>
  )
}
