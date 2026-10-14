import { useState, useEffect, useRef } from 'react'
import { Sparkles, X } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

export function SplashScreen({ onComplete, duration = 4200 }: SplashScreenProps) {
  // phase: 'enter' → logo strokes draw in
  //        'brand' → wordmark fades up beneath emblem
  //        'docking' → whole lockup flies to navbar logo
  const [phase, setPhase] = useState<'enter' | 'brand' | 'docking'>('enter')

  // Single transform applied to the WHOLE centered lockup wrapper
  const [lockupTransform, setLockupTransform] = useState<string>('none')
  const [lockupScale, setLockupScale] = useState<number>(1)

  const lockupRef = useRef<HTMLDivElement>(null)
  const dockingTriggered = useRef(false)

  // ─── Phase timeline ───────────────────────────────────────────────────────
  useEffect(() => {
    const brandTimer = setTimeout(() => setPhase('brand'), 900)
    const dockTimer  = setTimeout(() => setPhase('docking'), 2200)
    const doneTimer  = setTimeout(() => onComplete(), duration)

    return () => {
      clearTimeout(brandTimer)
      clearTimeout(dockTimer)
      clearTimeout(doneTimer)
    }
  }, [duration, onComplete])

  // ─── Compute & apply flight transform once docking starts ─────────────────
  useEffect(() => {
    if (phase !== 'docking' || dockingTriggered.current) return
    dockingTriggered.current = true

    const lockup  = lockupRef.current
    const target  = document.getElementById('app-header-logo')

    if (!lockup || !target) {
      // Fallback: slide to top-left corner
      setLockupTransform('translate(-44vw, -45vh)')
      setLockupScale(0.35)
      return
    }

    const cRect = lockup.getBoundingClientRect()
    const tRect = target.getBoundingClientRect()

    // Align top-left corners of the two boxes then scale
    const scaleVal = tRect.height / cRect.height
    // After scaling around top-left, the element moves by (cRect.left * (1-scale), cRect.top * (1-scale)).
    // We want its new top-left to land at tRect.left / tRect.top.
    // dx = tRect.left - cRect.left * scaleVal   (cancel out scale shift, then translate)
    // Simpler: use translate + scale(origin top-left)
    const dx = tRect.left - cRect.left
    const dy = tRect.top  - cRect.top

    setLockupTransform(`translate(${dx}px, ${dy}px)`)
    setLockupScale(scaleVal)
  }, [phase])

  const isDocking = phase === 'docking'

  const handleSkip = () => {
    if (dockingTriggered.current) return
    dockingTriggered.current = true
    setPhase('docking')
    setTimeout(onComplete, 900)
  }

  return (
    <div
      className="fixed inset-0 z-9999 overflow-hidden select-none"
      aria-label="Loading Aroom"
      role="progressbar"
    >
      {/* ── Backdrop: white canvas that fades out when docking ── */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-700 ease-out ${
          isDocking ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Subtle emerald radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.07)_0%,rgba(255,255,255,1)_70%)] pointer-events-none" />
      </div>

      {/* ── Skip button ── */}
      {!isDocking && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200 border border-slate-200/80 text-xs font-medium text-slate-500 hover:text-slate-800 transition-all backdrop-blur-sm"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* ── Dead-centred brand lockup ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={lockupRef}
          style={{
            transformOrigin: 'top left',
            transform: isDocking
              ? `${lockupTransform} scale(${lockupScale})`
              : 'none',
            transition: isDocking
              ? 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.1s ease'
              : 'none',
            opacity: isDocking ? 0 : 1,
          }}
          className="flex flex-col items-center"
        >
          {/* ── EMBLEM ── */}
          <div className="relative flex items-center justify-center">
            {/* Ambient glow ring */}
            <div
              className={`absolute -inset-3 rounded-3xl bg-linear-to-r from-emerald-500 to-green-500 blur-lg transition-opacity duration-500 ${
                isDocking ? 'opacity-0' : 'opacity-25 animate-pulse'
              }`}
            />

            {/* Squircle badge */}
            <div className="relative w-24 h-24 rounded-3xl bg-linear-to-br from-green-600 via-emerald-600 to-teal-700 shadow-2xl shadow-green-950/30 flex items-center justify-center overflow-hidden border border-emerald-400/30">
              {/* Glossy sheen */}
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />

              {/* Slash accent */}
              <div
                className={`absolute top-2 right-2.5 w-3.5 h-1 bg-amber-300 rounded-full rotate-45 transition-all duration-500 ${
                  phase !== 'enter' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
              />

              {/* Shield SVG */}
              <svg
                className="w-14 h-14 text-white drop-shadow relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="animate-stroke-draw"
                  d="M12 2.5L3.5 9.2C3.5 9.2 3 13.5 4.5 16.8C6 20.1 12 22 12 22C12 22 18 20.1 19.5 16.8C21 13.5 20.5 9.2 20.5 9.2L12 2.5Z"
                  fill="currentColor"
                  fillOpacity="0.18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className="animate-logo-check text-amber-300"
                  d="M8.5 12.2L11 14.7L15.8 9.8"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Sparkle particle */}
              <div className="absolute top-1.5 right-1.5 text-amber-300 animate-spark-twinkle z-20">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* ── WORDMARK ── */}
          <div
            className={`flex flex-col items-center mt-5 transition-all duration-500 ${
              phase === 'enter' ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Brand name row */}
            <div className="flex items-center gap-2">
              <span className="font-black text-3xl tracking-tight leading-none text-slate-900">
                <span>Ar</span>
                <span className="relative inline-block px-px text-emerald-600">
                  oo
                  <span className="absolute -bottom-0.5 left-0.5 right-0.5 h-0.5 bg-linear-to-r from-green-500 via-emerald-400 to-amber-400 rounded-full" />
                </span>
                <span>m</span>
              </span>

              {/* Live beacon */}
              <span className="relative flex w-2.5 h-2.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            </div>

            {/* Hairline + subtitle — fades out before docking */}
            <div
              className={`flex flex-col items-center transition-all duration-400 ${
                isDocking ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <div className="h-px w-24 bg-linear-to-r from-transparent via-emerald-400 to-transparent my-2.5 animate-line-grow" />
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-slate-400">
                Verified Campus Living
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
