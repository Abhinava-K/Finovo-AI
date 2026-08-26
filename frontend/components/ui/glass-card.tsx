import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'heavy'
  glow?: 'none' | 'blue' | 'violet' | 'green'
  shine?: boolean
}

const variantClasses = {
  default: 'glass',
  elevated: 'glass-elevated',
  subtle: 'glass-subtle',
  heavy: 'glass-heavy',
} as const

const glowClasses = {
  none: '',
  blue: 'shadow-card hover:shadow-glow-blue transition-shadow duration-300',
  violet: 'shadow-card hover:shadow-glow-violet transition-shadow duration-300',
  green: 'shadow-card hover:shadow-glow-green transition-shadow duration-300',
} as const

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glow = 'none', shine = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl',
          variantClasses[variant],
          glowClasses[glow],
          shine && 'card-shine overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = 'GlassCard'

export { GlassCard }
