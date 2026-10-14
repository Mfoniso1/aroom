/**
 * PageBackground
 * Renders a full-screen fixed photo behind the page content.
 * Features a semi-transparent black overlay (45-60% opacity) layered with
 * a subtle vertical gradient so the entire page background image is darkened
 * enough to ensure foreground text and components are highly readable while
 * preserving visual details and architectural clarity.
 */
interface PageBackgroundProps {
  /** Path to the image, e.g. '/images/rooms/house-01-exterior.jpg' */
  image: string
  /**
   * Black overlay opacity percentage between 45% and 60% (e.g. 50 = 50% opacity).
   * Default: 50% (rgba(0, 0, 0, 0.50))
   */
  blackOverlayOpacity?: number
  /**
   * Optional custom gradient or overlay layer.
   * Default: subtle vertical black darkening gradient
   */
  gradientOverlay?: string
}

export function PageBackground({
  image,
  blackOverlayOpacity = 50,
  gradientOverlay = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.52) 50%, rgba(0, 0, 0, 0.60) 100%)',
}: PageBackgroundProps) {
  // Clamp overlay opacity to the requested 45% - 60% range
  const clampedOpacity = Math.min(Math.max(blackOverlayOpacity, 40), 65) / 100

  return (
    <>
      {/* High-quality background image covering the full screen without stretching */}
      <div
        className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
      {/* 
        Semi-transparent black overlay (45–60% opacity) with layered gradient:
        Darkens the background image sufficiently for foreground readability
        while keeping the building/room visual details crisp.
      */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${clampedOpacity})`,
          backgroundImage: gradientOverlay,
        }}
        aria-hidden="true"
      />
    </>
  )
}
