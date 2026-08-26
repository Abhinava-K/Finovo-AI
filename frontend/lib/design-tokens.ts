/**
 * Design tokens for programmatic use — Recharts colors, chart theming,
 * animation durations. All palette values must stay in sync with globals.css.
 */

// ─── Recharts Theme ─────────────────────────────────────────────────────────
export const chartTheme = {
  background: 'transparent',
  grid: {
    stroke: 'rgba(255, 255, 255, 0.04)',
    strokeDasharray: '4 4',
  },
  axis: {
    stroke: 'rgba(255, 255, 255, 0.12)',
    tick: '#768098',
    fontSize: 11,
    fontFamily: 'var(--font-inter)',
  },
  tooltip: {
    background: '#0b1220',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#dde4f1',
    fontSize: 12,
  },
  legend: {
    color: '#768098',
    fontSize: 12,
  },
} as const

// ─── Mutual Fund Allocation Colors ──────────────────────────────────────────
export const mfColors = {
  equity: '#3B82F6',   // electric blue
  midcap: '#F59E0B',   // amber — growth potential
  debt: '#10B981',     // emerald — safety/stability
} as const

export type MFCategory = keyof typeof mfColors

// ─── Crypto Coin Colors ──────────────────────────────────────────────────────
// Maps exact coin names returned by backend to brand-accurate hex values
export const cryptoColors: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDC: '#2775CA',
  'USDC (Stable)': '#2775CA',
  'PAXG (Gold)': '#D4AF37',
  LINK: '#375BD2',
  UNI: '#FF007A',
  DOGE: '#C3A634',
  RNDR: '#FF6B00',
  FET: '#1872E8',
  INJ: '#00B2FF',
  DOT: '#E6007A',
  ATOM: '#4A4E87',
}

export const defaultCryptoColor = '#6B7280'

export function getCryptoColor(coinName: string): string {
  return cryptoColors[coinName] ?? defaultCryptoColor
}

// ─── Projection Scenario Colors ─────────────────────────────────────────────
export const projectionColors = {
  optimistic: '#10B981',   // green — best case
  expected: '#3B82F6',     // blue — expected case
  conservative: '#F59E0B', // amber — conservative case
} as const

// ─── Risk Level Colors ───────────────────────────────────────────────────────
export const riskColors = {
  low: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    hex: '#34D399',
    label: 'Low',
  },
  medium: {
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    hex: '#FBBF24',
    label: 'Medium',
  },
  high: {
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    hex: '#F87171',
    label: 'High',
  },
  'Very High': {
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    hex: '#EF4444',
    label: 'Very High',
  },
  Low: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    hex: '#34D399',
    label: 'Low',
  },
  Medium: {
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    hex: '#FBBF24',
    label: 'Medium',
  },
} as const

// ─── Framer Motion Presets ───────────────────────────────────────────────────
export const motionPresets = {
  // Standard fade-up for page sections
  fadeUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  // Stagger children
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  },
  staggerItem: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  // Scale pop for cards
  scalePop: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
  },
  // Slide from right (page transition)
  slideRight: {
    initial: { opacity: 0, x: 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  // Chat message appear
  messageIn: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
  },
} as const

// ─── Loading Messages ────────────────────────────────────────────────────────
export const loadingMessages = {
  mf: [
    'Connecting to live market data...',
    'Analyzing your investment profile...',
    'Computing age-based allocation...',
    'Running optimization engine...',
    'Ranking top-performing funds...',
    'Calculating CAGR projections...',
    'Building rebalancing timeline...',
    'Preparing your strategy...',
  ],
  crypto: [
    'Fetching live crypto prices...',
    'Analyzing market volatility...',
    'Computing risk-adjusted weights...',
    'Running return simulations...',
    'Stress-testing drawdown scenarios...',
    'Optimizing your crypto allocation...',
    'Preparing your portfolio...',
  ],
  agent: [
    'Activating AI advisor...',
    'Searching mutual fund database...',
    'Fetching live market data...',
    'Processing your query...',
    'Synthesizing recommendation...',
    'Formatting response...',
  ],
} as const

// ─── Module Config ───────────────────────────────────────────────────────────
export const moduleConfig = {
  'mutual-funds': {
    label: 'Mutual Funds',
    color: '#3B82F6',
    gradient: 'from-blue-600 to-indigo-600',
    glowClass: 'shadow-glow-blue',
    accentClass: 'text-blue-400',
    bgAccent: 'bg-blue-500/10',
    borderAccent: 'border-blue-500/20',
  },
  crypto: {
    label: 'Crypto',
    color: '#8B5CF6',
    gradient: 'from-violet-600 to-purple-600',
    glowClass: 'shadow-glow-violet',
    accentClass: 'text-violet-400',
    bgAccent: 'bg-violet-500/10',
    borderAccent: 'border-violet-500/20',
  },
  advisor: {
    label: 'AI Advisor',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    glowClass: 'shadow-glow-green',
    accentClass: 'text-emerald-400',
    bgAccent: 'bg-emerald-500/10',
    borderAccent: 'border-emerald-500/20',
  },
} as const
