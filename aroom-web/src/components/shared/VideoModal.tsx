/**
 * VideoModal.tsx
 * Interactive modal that plays verified room physical walkthrough videos.
 * - Allows full video volume with volume control and unmute button.
 * - Natural unzoomed aspect ratio (object-contain) for maximum clarity without cropping.
 */
import { useEffect, useRef, useState } from 'react'
import { X, Play, Building2, UserCheck, ShieldCheck, Volume2, VolumeX } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl?: string
  title: string
  landmark?: string
  uploaderType?: 'landlord' | 'agent'
  uploaderName?: string
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl = '/videos/room-tour.mp4',
  title,
  landmark,
  uploaderType = 'agent',
  uploaderName,
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [soundNotice, setSoundNotice] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)

      // Start with unmuted volume enabled
      if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.volume = 1.0
        setIsMuted(false)

        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If browser autoplay policy blocks unmuted audio before user interaction,
            // mute temporarily so playback starts and show a prominent unmute button
            if (videoRef.current) {
              videoRef.current.muted = true
              setIsMuted(true)
              setSoundNotice(true)
              videoRef.current.play().catch(() => {})
            }
          })
        }
      }
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isLandlord = uploaderType === 'landlord'

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted
      videoRef.current.muted = nextMuted
      if (!nextMuted) {
        videoRef.current.volume = 1.0
      }
      setIsMuted(nextMuted)
      setSoundNotice(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl lg:max-w-5xl bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Play className="w-4 h-4 fill-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate text-white">{title}</h3>
              {landmark && (
                <p className="text-xs text-slate-400 truncate">📍 {landmark}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={toggleSound}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title={isMuted ? 'Click to enable audio' : 'Click to mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Unmute Sound' : 'Sound ON'}</span>
            </button>

            {isLandlord ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Building2 className="w-3 h-3" />
                <span>Direct Landlord</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <UserCheck className="w-3 h-3" />
                <span>Agent Walkthrough</span>
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container — Natural Unzoomed View (object-contain with max natural height) */}
        <div className="relative bg-black flex items-center justify-center w-full min-h-[300px] max-h-[75vh] overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            onVolumeChange={() => {
              if (videoRef.current) {
                setIsMuted(videoRef.current.muted || videoRef.current.volume === 0)
              }
            }}
            className="w-full max-h-[75vh] object-contain mx-auto"
          >
            Your browser does not support the video tag.
          </video>

          {/* Prompt to unmute if browser initially muted the video */}
          {soundNotice && isMuted && (
            <button
              type="button"
              onClick={toggleSound}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-lg backdrop-blur-sm cursor-pointer transition-transform hover:scale-105"
            >
              <VolumeX className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Click to turn on sound 🔊</span>
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-3.5 bg-slate-950/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Physically verified walkthrough video recorded at property premises. Full volume &amp; natural framing.</span>
          </div>
          {uploaderName && (
            <span className="text-slate-300 text-[11px]">
              Uploaded by: <strong className="text-white">{uploaderName}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
