import { Sparkles } from 'lucide-react'

interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  badge?: string
  showTagline?: boolean
  className?: string
}

export function Logo({
  variant = 'light',
  size = 'md',
  badge,
  showTagline = false,
  className = '',
}: LogoProps) {
  const isDark = variant === 'dark'

  const sizeConfig = {
    sm: {
      emblem: 'w-7 h-7 rounded-lg',
      svg: 'w-4 h-4',
      text: 'text-lg',
      badge: 'text-[10px] px-1.5 py-0.5',
      dot: 'w-1.5 h-1.5',
    },
    md: {
      emblem: 'w-9 h-9 rounded-xl',
      svg: 'w-5 h-5',
      text: 'text-xl',
      badge: 'text-xs px-2 py-0.5',
      dot: 'w-2 h-2',
    },
    lg: {
      emblem: 'w-12 h-12 rounded-2xl',
      svg: 'w-7 h-7',
      text: 'text-3xl',
      badge: 'text-xs px-2.5 py-1',
      dot: 'w-2.5 h-2.5',
    },
  }[size]

  return (
    <div className={`group inline-flex items-center gap-2.5 select-none transition-transform active:scale-[0.98] ${className}`}>
      {/* Animated Emblem Container */}
      <div data-logo-emblem="true" className="relative flex items-center justify-center">
        {/* Ambient Halo Glow */}
        <div
          className={`absolute -inset-1 rounded-2xl bg-linear-to-r from-emerald-500 to-green-500 opacity-25 blur-sm transition-all duration-500 group-hover:opacity-60 group-hover:blur-md ${
            isDark ? 'opacity-40 group-hover:opacity-80' : ''
          }`}
        />

        {/* Squircle Badge */}
        <div
          className={`relative ${sizeConfig.emblem} bg-linear-to-br from-green-600 via-emerald-600 to-teal-700 shadow-md shadow-green-900/20 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3 group-hover:shadow-green-500/30 group-hover:shadow-lg overflow-hidden`}
        >
          {/* Subtle glossy overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />

          {/* Protective House + Shield SVG */}
          <svg
            className={`${sizeConfig.svg} text-white drop-shadow relative z-10 transition-transform duration-300 group-hover:scale-110`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* House roof line merging with shield outer boundary */}
            <path
              d="M12 2.5L3.5 9.2C3.5 9.2 3 13.5 4.5 16.8C6 20.1 12 22 12 22C12 22 18 20.1 19.5 16.8C21 13.5 20.5 9.2 20.5 9.2L12 2.5Z"
              fill="currentColor"
              fillOpacity="0.18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner verified checkmark */}
            <path
              className="animate-logo-check text-amber-300"
              d="M8.5 12.2L11 14.7L15.8 9.8"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Twinkling star particle in top corner */}
          <div className="absolute top-1 right-1 z-20 pointer-events-none text-amber-300 animate-spark-twinkle">
            <Sparkles className="w-2.5 h-2.5 opacity-90" />
          </div>
        </div>
      </div>

      {/* Typography / Wordmark */}
      <div data-logo-wordmark="true" className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight leading-none ${sizeConfig.text} transition-colors duration-200 ${
              isDark
                ? 'text-white group-hover:text-green-300'
                : 'text-slate-900 group-hover:text-green-700'
            }`}
          >
            <span>Ar</span>
            {/* The interconnected 'oo' with an animated underline bridge */}
            <span className="relative inline-block px-px">
              <span className="text-emerald-600 transition-colors group-hover:text-emerald-500">
                oo
              </span>
              <span
                className="absolute -bottom-0.5 left-0.5 right-0.5 h-0.5 bg-linear-to-r from-green-500 via-emerald-400 to-amber-400 rounded-full opacity-70 group-hover:opacity-100 group-hover:h-[2.5px] transition-all duration-300"
                aria-hidden="true"
              />
            </span>
            <span>m</span>
          </span>

          {/* Pulsing Live Beacon Dot */}
          <span
            className={`relative flex ${sizeConfig.dot} items-center justify-center`}
            title="Verified Network Active"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>

          {/* Optional Badge */}
          {badge && (
            <span
              className={`font-semibold rounded-full uppercase tracking-wider ${sizeConfig.badge} ${
                isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-900/50'
                  : 'bg-green-50 text-green-700 border border-green-200/80'
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Optional Tagline */}
        {showTagline && (
          <span
            className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Verified Campus Housing
          </span>
        )}
      </div>
    </div>
  )
}
