import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrustBadge } from './TrustBadge'
import { MoveInCostCalculator } from './MoveInCostCalculator'
import { VideoModal } from './VideoModal'
import { Play, Building2, UserCheck, MapPin } from 'lucide-react'

export interface CampusSurvivalMetrics {
  waterSource: 'Borehole (Running)' | 'Well Water' | 'Pumped Daily'
  powerStatus: 'Federal Light (Band A/B)' | 'Solar Backup' | 'Generator Allowed'
  walkMinutesToGate: number // e.g., 6
  nearestLandmark: string   // e.g., "Choba Junction (by Crunchies)"
  walkthroughVideoUrl?: string // 15-sec compressed MP4 or YouTube Shorts/Cloudinary link
  securityFeatures: string[] // e.g., ['Fenced & Gated', 'Caretaker On-Site']
}

export type Listing = {
  id: string
  title: string
  price: number
  period: string
  landmark: string
  verificationStatus: 'verified' | 'unverified_new'
  availabilityStatus: 'available' | 'held' | 'taken'
  imageUrl: string
  campusId?: string
  uploaderType?: 'landlord' | 'agent'
  uploaderName?: string
  hasVideoTour?: boolean
  videoUrl?: string
  description?: string
  roomType?: string
  verificationRequested?: boolean
  verificationRequestedAt?: string
  verificationRequestNote?: string
  verifiedBy?: string
  propertyPublicId?: string
  unitPublicId?: string
  conditionStatus?: 'good' | 'minor_issues' | 'under_repair'
  verifiedAt?: string
  survivalMetrics?: CampusSurvivalMetrics
  customFees?: {
    cautionFee?: number
    legalFee?: number
    utilityFee?: number
    agencyFee?: number
  }
}

type ListingCardProps = {
  listing: Listing
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'

export function ListingCard({ listing }: ListingCardProps) {
  const [imgSrc, setImgSrc] = useState(listing.imageUrl)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const isLandlord = listing.uploaderType === 'landlord'

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsVideoModalOpen(true)
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-visible hover:shadow-md transition-all relative flex flex-col justify-between">
        {/* ── Minimalist Media Container ── */}
        <div
          onClick={handlePlayVideo}
          className="h-52 sm:h-56 bg-slate-900 relative overflow-hidden cursor-pointer group rounded-t-2xl"
          title="Watch video walkthrough"
        >
          <img
            src={imgSrc}
            alt={listing.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

          {/* Top Left: Single Clear Source Pill */}
          <div className="absolute top-3 left-3 z-10">
            {isLandlord ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/95 text-white shadow-xs">
                <Building2 className="w-3 h-3" />
                <span>Direct Landlord • 0% Fee</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs border border-white/15">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Agent</span>
              </span>
            )}
          </div>

          {/* Bottom Bar: Status on Left, Compact Video Trigger on Right */}
          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-10">
            {listing.availabilityStatus !== 'available' ? (
              <span
                className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  listing.availabilityStatus === 'held' ? 'bg-amber-600/90' : 'bg-red-600/90'
                }`}
              >
                {listing.availabilityStatus === 'held' ? 'On Hold' : 'Taken'}
              </span>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={handlePlayVideo}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/75 hover:bg-red-600 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Video Tour</span>
            </button>
          </div>
        </div>

        {/* ── Minimalist Card Body ── */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <Link to={`/listings/${listing.id}`} className="block group/link">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover/link:text-emerald-700 transition-colors line-clamp-1">
                {listing.title}
              </h3>
              <TrustBadge status={listing.verificationStatus} />
            </div>

            <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.landmark}</span>
            </p>
          </Link>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                  ₦{listing.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">/{listing.period}</span>
              </div>
              {listing.uploaderName && (
                <span className="text-[11px] text-slate-500 truncate max-w-32">
                  {listing.uploaderName}
                </span>
              )}
            </div>

            {/* Minimalist Move-in Cost Summary + Popover */}
            <MoveInCostCalculator
              rent={listing.price}
              uploaderType={listing.uploaderType ?? 'agent'}
              customFees={listing.customFees}
              mode="card"
            />
          </div>
        </div>
      </div>

      {/* Video Walkthrough Player Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={listing.videoUrl || '/videos/room-tour.mp4'}
        title={listing.title}
        landmark={listing.landmark}
        uploaderType={listing.uploaderType}
        uploaderName={listing.uploaderName}
      />
    </>
  )
}
