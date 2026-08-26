import { AlertTriangle, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisclaimerBadgeProps {
  variant?: 'disclaimer' | 'datasource' | 'both'
  className?: string
}

export function DisclaimerBadge({ variant = 'both', className }: DisclaimerBadgeProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {(variant === 'disclaimer' || variant === 'both') && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400/90">
          <AlertTriangle className="w-3 h-3" />
          Educational purposes only — not financial advice
        </span>
      )}
      {(variant === 'datasource' || variant === 'both') && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-muted-foreground">
          <Database className="w-3 h-3 text-blue-400" />
          Live data: MFAPI &amp; CoinGecko
        </span>
      )}
    </div>
  )
}
