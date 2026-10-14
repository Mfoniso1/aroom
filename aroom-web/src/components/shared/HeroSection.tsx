import React from 'react'

interface HeroSectionProps {
  /** Optional background image. If omitted, seamlessly inherits the page's unified background without any photo division */
  image?: string
  /** 
   * Black overlay opacity percentage between 45% and 60% (e.g. 50 = 50% opacity).
   * Default: 52% (rgba(0, 0, 0, 0.52))
   */
  blackOverlayOpacity?: number
  /** Additional gradient layers or custom color blends */
  gradientOverlay?: string
  /** Custom minimum height or sizing */
  className?: string
  children: React.ReactNode
}

/**
 * HeroSection
 * Displays a centered hero section that seamlessly inherits the page's unified background
 * (eliminating any photo division or horizontal seams across the page),
 * or displays a standalone cover image if explicitly passed.
 */
export function HeroSection({
  image,
  blackOverlayOpacity = 52,
  gradientOverlay,
  className = 'py-20 px-4 min-h-120 sm:min-h-140',
  children,
}: HeroSectionProps) {
  const clampedOpacity = Math.min(Math.max(blackOverlayOpacity, 40), 65) / 100

  return (
    /*
     * Stacking order (bottom → top):
     *   z-0  — background image layer (absolute, fills container)
     *   z-[1] — semi-transparent black/gradient overlay (absolute, pointer-events-none)
     *   z-10  — hero content (relative, fully interactive)
     *
     * `isolation: isolate` creates a self-contained stacking context so nothing
     * from a parent can accidentally render between our layers.
     */
    <div
      className={`relative w-full overflow-hidden flex flex-col items-center justify-center text-center isolate ${className}`}
    >
      {/* Background image layer — z-0, sits at the very bottom of this stacking context */}
      {image && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('${image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          aria-hidden="true"
        />
      )}

      {/* Overlay layer — z-1, darkens the image without blocking content */}
      {image && (
        <div
          className="absolute inset-0 z-1 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${clampedOpacity})`,
            backgroundImage:
              gradientOverlay ||
              'linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.55) 50%, rgba(0, 0, 0, 0.60) 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Hero content — z-10, always on top; text & buttons are fully visible and interactive */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center px-4">
        {children}
      </div>
    </div>
  )
}
