/**
 * VideoModal.tsx
 * Interactive modal that plays verified room physical walkthrough videos.
 */
import { useEffect } from 'react'
import { X, Play, Building2, UserCheck, ShieldCheck } from 'lucide-react'

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isLandlord = uploaderType === 'landlord'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
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
            {isLandlord ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Building2 className="w-3 h-3" />
                <span>Direct Landlord Video</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <UserCheck className="w-3 h-3" />
                <span>Agent Walkthrough Video</span>
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative bg-black flex items-center justify-center aspect-video w-full">
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Footer info */}
        <div className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Physically verified walkthrough video recorded at property premises.</span>
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
