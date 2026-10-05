'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatINRCompact, formatINR } from '@/lib/formatters'

interface DataPoint {
  year: number
  conservative: number
  expected: number
  optimistic: number
}

interface Props {
  data: DataPoint[]
  height?: number
  showLegend?: boolean
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-elevated border border-white/10 rounded-xl px-3 py-2.5 shadow-elevated min-w-[160px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2">Year {label}</p>
      {payload.map(({ name, value, color }) => (
        <div key={name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs capitalize text-muted-foreground">{name}</span>
          </div>
          <span className="text-xs font-bold text-foreground tabular">{formatINR(value, true)}</span>
        </div>
      ))}
    </div>
  )
}

export function ProjectionArea({ data, height = 260, showLegend = true }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="year"
          tickFormatter={(v) => `Y${v}`}
          tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatINRCompact}
          tick={{ fill: 'rgba(148,163,184,0.7)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            formatter={(value) => (
              <span className="text-xs text-muted-foreground capitalize">{value}</span>
            )}
          />
        )}
        <Area
          type="monotone"
          dataKey="optimistic"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#colorOptimistic)"
          dot={false}
          activeDot={{ r: 4, fill: '#34d399' }}
        />
        <Area
          type="monotone"
          dataKey="expected"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#colorExpected)"
          dot={false}
          activeDot={{ r: 4, fill: '#3b82f6' }}
        />
        <Area
          type="monotone"
          dataKey="conservative"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#colorConservative)"
          dot={false}
          activeDot={{ r: 4, fill: '#f59e0b' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
