import {
  // Existing
  BrainCircuit,
  Hexagon,
  Component,
  Flame,
  Command,
  Sparkles,
  Activity,
  Layers,
  LayoutDashboard,
  Box,
  Fingerprint,
  Cpu,
  ChartPie,
  TrendingUp,

  // Investment / Portfolio
  PieChart,
  TrendingDown,
  BarChart3,
  ChartColumn,

  // Mutual Funds / Asset Management
  Wallet,
  BriefcaseBusiness,
  Package,
  Database,
  Boxes,
  Archive,

  // Finance / Money
  IndianRupee,
  CreditCard,
  Landmark,
  PiggyBank,
  Coins,
  Receipt,
  BadgeDollarSign,
  CircleDollarSign,

  // Risk Analysis
  ShieldAlert,
  ShieldCheck,
  Shield,
  TriangleAlert,
  Lock,

  // Analytics Dashboard
  ChartNoAxesCombined,
  LineChart,
  Gauge,
  ChartColumnIncreasing,
  ScanSearch,

  // AI Recommendation Engine
  Bot,
  Brain,
  Binary,
  Radar,

  // User Financial Profile
  User,
  CalendarDays,
  BadgeIndianRupee,
  Briefcase,
  IdCard,
  Clock3,

  // Security / Trust
  LockKeyhole,
  BadgeCheck,
  KeyRound,
  ScanFace,
  EyeOff,

  // Goals / Planning
  Target,
  Flag,
  Milestone,
  Map,
  Rocket,
  Route
} from 'lucide-react';

export default function LogoTestPage() {
  const logos = [
    { name: 'BrainCircuit', icon: BrainCircuit },
    { name: 'Hexagon', icon: Hexagon },
    { name: 'Component', icon: Component },
    { name: 'Flame', icon: Flame },
    { name: 'Command', icon: Command },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Activity', icon: Activity },
    { name: 'Layers', icon: Layers },
    { name: 'LayoutDashboard', icon: LayoutDashboard },
    { name: 'Box', icon: Box },
    { name: 'Fingerprint', icon: Fingerprint },
    { name: 'Cpu', icon: Cpu },
    { name: 'Portfolio Allocation', icon: PieChart },
    { name: 'Asset Distribution', icon: ChartPie },
    { name: 'Investment Growth', icon: TrendingUp },
    { name: 'Performance Decline', icon: TrendingDown },
    { name: 'Fund Diversification', icon: Layers },
    { name: 'Wealth Growth', icon: BarChart3 },
    { name: 'Portfolio Analytics', icon: ChartColumn },
    { name: 'Long Term Returns', icon: Activity },

    { name: 'Mutual Funds', icon: Wallet },
    { name: 'Asset Basket', icon: BriefcaseBusiness },
    { name: 'Holdings', icon: Package },
    { name: 'Fund Management', icon: Database },
    { name: 'Asset Pool', icon: Boxes },
    { name: 'Capital Reserve', icon: Archive },

    { name: 'Money', icon: IndianRupee },
    { name: 'Payments', icon: CreditCard },
    { name: 'Bank Balance', icon: Landmark },
    { name: 'Savings', icon: PiggyBank },
    { name: 'Cash Flow', icon: Coins },
    { name: 'Transactions', icon: Receipt },
    { name: 'Billing', icon: BadgeDollarSign },
    { name: 'Revenue', icon: CircleDollarSign },

    { name: 'Risk Score', icon: ShieldAlert },
    { name: 'Protected Investment', icon: ShieldCheck },
    { name: 'Risk Management', icon: Shield },
    { name: 'Warning', icon: TriangleAlert },
    { name: 'Security Level', icon: Lock },
    { name: 'Financial Protection', icon: Fingerprint },

    { name: 'Analytics', icon: ChartNoAxesCombined },
    { name: 'Trend Lines', icon: LineChart },
    { name: 'Metrics', icon: Gauge },
    { name: 'Statistics', icon: ChartColumnIncreasing },
    { name: 'Predictions', icon: ScanSearch },

    // AI Recommendation Engine
    { name: 'AI Advisor', icon: Bot },
    { name: 'Intelligent Recommendation', icon: Brain },
    { name: 'Automation', icon: Cpu },
    { name: 'Decision Engine', icon: Sparkles },
    { name: 'Model Processing', icon: Binary },
    { name: 'Prediction Radar', icon: Radar },

    // User Financial Profile
    { name: 'User Profile', icon: User },
    { name: 'Age Analysis', icon: CalendarDays },
    { name: 'Income', icon: BadgeIndianRupee },
    { name: 'Occupation', icon: Briefcase },
    { name: 'Identity', icon: IdCard },
    { name: 'Retirement Age', icon: Clock3 },

    // Security / Trust
    { name: 'Secure Data', icon: LockKeyhole },
    { name: 'Verified', icon: BadgeCheck },
    { name: 'Encryption', icon: KeyRound },
    { name: 'Trust', icon: ShieldCheck },
    { name: 'Authentication', icon: ScanFace },
    { name: 'Privacy', icon: EyeOff },

    // Goals / Planning
    { name: 'Goal Planning', icon: Target },
    { name: 'Retirement Planning', icon: Flag },
    { name: 'Milestones', icon: Milestone },
    { name: 'Planning Map', icon: Map },
    { name: 'Future Projection', icon: Rocket },
    { name: 'Growth Roadmap', icon: Route },

    // Premium Landing Page Pack
    { name: 'Growth', icon: TrendingUp },
    { name: 'Smart Allocation', icon: PieChart },
    { name: 'AI Intelligence', icon: Brain },
    { name: 'Secure Investing', icon: ShieldCheck },
    { name: 'Wealth Wallet', icon: Wallet },
    { name: 'Indian Market', icon: IndianRupee },
    { name: 'Financial Goals', icon: Target },
    { name: 'Performance Metrics', icon: Gauge },
    { name: 'Analytics Engine', icon: BarChart3 },
    { name: 'Financial Institution', icon: Landmark }
  ];

  return (
    <div className="container mx-auto p-12 space-y-12 min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black mb-4 text-foreground tracking-tight">FinovoAI Logo Analyzer</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Compare different Lucide icons to find the perfect logo mark for the new FinovoAI brand identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {logos.map((logo, index) => {
          const Icon = logo.icon;
          return (
            <div key={index} className="flex flex-col items-center justify-center p-8 bg-white/[0.02] rounded-2xl border border-white/[0.05] hover:bg-white/[0.04] transition-colors relative group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gradient-blue tracking-tight">FinovoAI</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground bg-black/20 px-3 py-1 rounded-full">{`<${logo.name} />`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
