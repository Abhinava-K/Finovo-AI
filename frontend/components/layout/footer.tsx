import Link from 'next/link'
import { Sparkles, TrendingUp, Bitcoin, ExternalLink } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface FooterLink {
  href: string
  label: string
  external?: boolean
}

const footerLinks: { group: string; links: FooterLink[] }[] = [
  {
    group: 'Platform',
    links: [
      { href: '/', label: 'Home' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/about', label: 'How It Works' },
    ],
  },
  {
    group: 'Modules',
    links: [
      { href: '/mutual-funds', label: 'Mutual Fund Advisor' },
      { href: '/crypto', label: 'Crypto Portfolio' },
      { href: '/advisor', label: 'AI Chat Advisor' },
    ],
  },
  {
    group: 'Data Sources',
    links: [
      { href: 'https://www.mfapi.in', label: 'MFAPI (Mutual Funds)', external: true },
      { href: 'https://www.coingecko.com', label: 'CoinGecko (Crypto)', external: true },
    ],
  },
]

export function Footer() {
  return (
    <footer className="glass border-t border-white/[0.05] mt-auto">
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient-blue">FinovoAI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Investment advice powered by live market data and AI. Personalized for your
              age, risk appetite, and time horizon.
            </p>

            {/* Data attribution badges */}
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { label: 'Live data via MFAPI', icon: TrendingUp },
                { label: 'Live data via CoinGecko', icon: Bitcoin },
              ].map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.05] border border-white/[0.07] text-muted-foreground"
                >
                  <Icon className="w-3 h-3 text-blue-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map(({ group, links }) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ href, label, external }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group"
                    >
                      {label}
                      {external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-white/[0.05]" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FinovoAI. Built for educational purposes.
          </p>
          <p className="text-xs text-muted-foreground/70 text-center sm:text-right max-w-md">
            ⚠️ AI-generated suggestions are for educational purposes only and do not
            constitute financial advice. Always consult a qualified financial advisor.
          </p>
        </div>
      </div>
    </footer>
  )
}
