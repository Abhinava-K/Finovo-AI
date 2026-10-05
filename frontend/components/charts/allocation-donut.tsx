'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatINR, formatPercent } from '@/lib/formatters'

interface DonutSlice {
  name: string
  value: number   // percentage (0–100)
  color: string
  amount?: number // optional INR amount for tooltip
}

interface Props {
  data: DonutSlice[]
  totalAmount?: number
  size?: 'sm' | 'md' | 'lg'
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string
}

const sizes = { sm: 140, md: 200, lg: 260 }
const innerR = { sm: 42, md: 60, lg: 78 }
const outerR = { sm: 65, md: 90, lg: 115 }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DonutSlice }> }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="glass-elevated border border-white/10 rounded-xl px-3 py-2 shadow-elevated">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
        <span className="text-xs font-semibold text-foreground">{item.name}</span>
      </div>
      <p className="text-sm font-black text-foreground tabular">{formatPercent(item.value)}%</p>
      {item.amount !== undefined && (
        <p className="text-xs text-muted-foreground">{formatINR(item.amount)}</p>
      )}
    </div>
  )
}

export function AllocationDonut({ data, size = 'md', showLegend = true, centerLabel, centerValue }: Props) {
  const h = sizes[size]
  const ir = innerR[size]
  const or = outerR[size]

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: h, height: h }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={ir}
              outerRadius={or}
              dataKey="value"
              strokeWidth={2}
              stroke="transparent"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && (
              <span className="text-base font-black text-foreground tabular leading-tight">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map(({ name, color, value }) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">{name}</span>
              <span className="text-xs font-bold text-foreground tabular">{formatPercent(value)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
