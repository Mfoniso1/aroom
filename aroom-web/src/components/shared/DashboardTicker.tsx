/**
 * DashboardTicker.tsx
 * Continuous text animation for the student dashboard:
 * Transitions between "Keep track of your space" and "Secure a space now"
 * coming from the right to the left-middle part of the dashboard continuously.
 */
import { useState, useEffect } from 'react'
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'

const TICKER_MESSAGES = [
  {
    id: 'track',
    title: 'Keep track of your space',
    subtitle: 'Live inspection & booking alerts',
    icon: Sparkles,
    badge: 'My Space',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'secure',
    title: 'Secure a space now',
    subtitle: 'Verified scam-free campus rooms',
    icon: ShieldCheck,
    badge: 'Instant Hold',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
]

interface DashboardTickerProps {
  className?: string
  variant?: 'compact' | 'banner'
}

export function DashboardTicker({ className = '', variant = 'compact' }: DashboardTickerProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TICKER_MESSAGES.length)
    }, 3800)

    return () => clearInterval(timer)
  }, [])

  const current = TICKER_MESSAGES[index]
  const Icon = current.icon

  if (variant === 'banner') {
    return (
      <div className={`w-full overflow-hidden relative rounded-xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-3.5 sm:p-4 shadow-sm border border-emerald-800/40 ${className}`}>
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <span className="flex h-2.5 w-2.5 shrink-0 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            {/* Continuous animation from right to left-middle */}
            <div
              key={index}
              className="flex items-center gap-2.5 animate-[tickerRightToLeft_3.8s_ease-out_infinite]"
            >
              <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${current.badgeClass}`}>
                {current.badge}
              </span>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                {current.title}
              </span>
              <span className="hidden md:inline text-xs text-slate-300 border-l border-slate-700 pl-2">
                {current.subtitle}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-white transition-colors shrink-0">
            <span>Aroom UNIPORT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    )
  }

  // Compact navbar pill version
  return (
    <div className={`overflow-hidden relative flex items-center ${className}`}>
      <div
        key={index}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 shadow-xs animate-[tickerRightToLeft_3.8s_ease-out_infinite]"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

        <span className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
          {current.title}
        </span>

        <span className="hidden xl:inline text-[11px] font-medium text-emerald-700/80 border-l border-emerald-200 pl-1.5">
          {current.subtitle}
        </span>
      </div>
    </div>
  )
}
