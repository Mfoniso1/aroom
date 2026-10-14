import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrustBadge } from './TrustBadge'
import { MoveInCostCalculator } from './MoveInCostCalculator'
import { VideoModal } from './VideoModal'
import { Play, Building2, UserCheck } from 'lucide-react'

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
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative flex flex-col justify-between">
        
        {/* ── Video / Media Container (Clean & Uncluttered) ── */}
        <div 
          onClick={handlePlayVideo}
          className="h-52 bg-slate-900 relative overflow-hidden cursor-pointer group"
          title="Click to play walkthrough video"
        >
          <img
            src={imgSrc}
            alt={listing.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-90"
          />

          {/* Subtle Top Gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Top Left: Clean Uploader Badge (No 15% or 0% text) */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {isLandlord ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-amber-300 backdrop-blur-xs border border-amber-400/40 shadow-xs">
                <Building2 className="w-3 h-3 text-amber-300" />
                <span>Direct Landlord</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-slate-200 backdrop-blur-xs border border-slate-600/50 shadow-xs">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Agent Upload</span>
              </span>
            )}
          </div>

          {/* Top Right: "View Video" Action Button */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <button
              type="button"
              onClick={handlePlayVideo}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-all active:scale-95 cursor-pointer border border-red-400/50"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>View Video</span>
            </button>
          </div>

          {/* Center Play Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform pl-0.5 border-2 border-white/80">
              <Play className="w-5 h-5 fill-white" />
            </div>
          </div>

          {/* Bottom Right: Clean Availability Status */}
          <div className={`absolute bottom-2.5 right-2.5 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs z-10 ${
            listing.availabilityStatus === 'available' ? 'bg-slate-900/80' :
            listing.availabilityStatus === 'held' ? 'bg-amber-600/90' : 'bg-red-600/90'
          }`}>
            {listing.availabilityStatus === 'available' ? 'Available' :
             listing.availabilityStatus === 'held' ? 'On Hold' : 'Taken'}
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <Link to={`/listings/${listing.id}`} className="block group/link">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="text-base font-bold text-slate-900 group-hover/link:text-emerald-700 transition-colors truncate">
                {listing.title}
              </h3>
              <TrustBadge status={listing.verificationStatus} />
            </div>
            
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
              <span>📍</span>
              <span className="truncate">{listing.landmark}</span>
            </p>

            {listing.uploaderName && (
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span className="font-medium text-slate-600">Uploaded by:</span> {listing.uploaderName}
              </p>
            )}
          </Link>

          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-extrabold text-emerald-700">
                  ₦{listing.price.toLocaleString()}
                </span>
                <span className="text-xs font-normal text-slate-500">/{listing.period}</span>
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                isLandlord ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isLandlord ? 'Direct Landlord' : 'Agent Listing'}
              </span>
            </div>

            {/* Move-in cost breakdown */}
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
