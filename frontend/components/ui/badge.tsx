import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/15 text-blue-400',
        secondary: 'border-white/10 bg-white/[0.05] text-muted-foreground',
        destructive: 'border-transparent bg-destructive/15 text-red-400',
        outline: 'border-white/10 text-muted-foreground',
        success: 'border-transparent bg-emerald-500/15 text-emerald-400',
        warning: 'border-transparent bg-amber-500/15 text-amber-400',
        violet: 'border-transparent bg-violet-500/15 text-violet-400',
        'risk-low': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        'risk-medium': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        'risk-high': 'border-red-500/30 bg-red-500/10 text-red-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
