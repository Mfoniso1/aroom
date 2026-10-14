import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TrustBadge } from '@/components/shared/TrustBadge'
import { MoveInCostCalculator } from '@/components/shared/MoveInCostCalculator'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { InspectionScheduleModal } from '@/components/shared/InspectionScheduleModal'
import { VideoModal } from '@/components/shared/VideoModal'
import { Calendar, MapPin, User, Star, CheckCircle2, Building2, UserCheck, Play, ShieldCheck } from 'lucide-react'

// Mock database dictionary to resolve ID
const LISTING_CATALOG: Record<string, {
  title: string
  price: number
  period: string
  landmark: string
  verificationStatus: 'verified' | 'unverified_new'
  availabilityStatus: 'available' | 'held' | 'taken'
  uploaderType: 'landlord' | 'agent'
  uploaderName: string
  uploaderRole: string
  rating: number
  responseRate: number
  cautionFee: number
  legalFee: number
  utilityFee: number
  agencyFee: number
  imageUrl: string
  videoUrl?: string
  descriptionText: string
}> = {
  '1': {
    title: 'Spacious Self-Contain at Akoka',
    price: 350000,
    period: 'yr',
    landmark: '5 mins walk from UNILAG Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    uploaderType: 'agent',
    uploaderName: 'Femi K.',
    uploaderRole: 'Verified Campus Agent',
    rating: 4.9,
    responseRate: 98,
    cautionFee: 30000,
    legalFee: 20000,
    utilityFee: 15000,
    agencyFee: 52500, // 15%
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
    descriptionText: 'Spacious verified self-contain apartment with personal balcony and prepaid meter. Standard agent listing with legally capped 15% agency commission and free physical walkthrough inspection.',
  },
  '4': {
    title: 'Executive Self-Contain in Choba',
    price: 280000,
    period: 'yr',
    landmark: '5 mins to UNIPORT Choba Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    uploaderType: 'landlord',
    uploaderName: 'Chief Emeka Eze',
    uploaderRole: 'Verified Property Owner (Direct)',
    rating: 5.0,
    responseRate: 100,
    cautionFee: 25000,
    legalFee: 20000,
    utilityFee: 15000,
    agencyFee: 0, // 0%
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
    descriptionText: 'Direct landlord upload for Eze Royal Lodge. Listed directly by the property owner with zero agency fees. Students only pay rent, caution deposit, legal agreement, and utilities. Free physical viewing guaranteed.',
  },
}

import { getListingById } from '@/lib/listingsStore'

export function ListingDetailPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [scheduledSlot, setScheduledSlot] = useState<string | null>(null)

  const storeListing = getListingById(id)
  const resolved = storeListing ? {
    title: storeListing.title,
    price: storeListing.price,
    period: storeListing.period,
    landmark: storeListing.landmark,
    verificationStatus: storeListing.verificationStatus,
    availabilityStatus: storeListing.availabilityStatus,
    uploaderType: (storeListing.uploaderType || 'agent') as 'landlord' | 'agent',
    uploaderName: storeListing.uploaderName || (storeListing.uploaderType === 'landlord' ? 'Verified Landlord' : 'Certified Agent'),
    uploaderRole: storeListing.uploaderType === 'landlord' ? 'Verified Property Owner' : 'Verified Campus Agent',
    rating: 4.9,
    responseRate: 98,
    cautionFee: storeListing.customFees?.cautionFee ?? 25000,
    legalFee: storeListing.customFees?.legalFee ?? 20000,
    utilityFee: storeListing.customFees?.utilityFee ?? 15000,
    agencyFee: storeListing.customFees?.agencyFee ?? (storeListing.uploaderType === 'landlord' ? 0 : Math.round(storeListing.price * 0.15)),
    inspectionFee: storeListing.customFees?.inspectionFee ?? 0,
    imageUrl: storeListing.imageUrl,
    videoUrl: storeListing.videoUrl || '/videos/room-tour.mp4',
    descriptionText: storeListing.description || `${storeListing.title} located at ${storeListing.landmark}. Verified walkthrough video recorded on site.`,
  } : (LISTING_CATALOG[id] || {
    title: 'Executive Student Accommodation',
    price: 300000,
    period: 'yr',
    landmark: 'Walking distance to University Campus',
    verificationStatus: 'verified' as const,
    availabilityStatus: 'available' as const,
    uploaderType: (Number(id) % 2 === 0 ? 'landlord' : 'agent') as 'landlord' | 'agent',
    uploaderName: Number(id) % 2 === 0 ? 'Chief Emeka Eze (Owner)' : 'Femi K. (Agent)',
    uploaderRole: Number(id) % 2 === 0 ? 'Verified Property Owner' : 'Verified Campus Agent',
    rating: 4.8,
    responseRate: 96,
    cautionFee: 25000,
    legalFee: 20000,
    utilityFee: 15000,
    agencyFee: Number(id) % 2 === 0 ? 0 : 45000,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
    videoUrl: '/videos/room-tour.mp4',
    descriptionText: 'Verified campus apartment with video tour. Scam-free walkthrough guaranteed before payment.',
  })

  const isLandlord = resolved.uploaderType === 'landlord'
  const moveInSum =
    resolved.price +
    resolved.cautionFee +
    resolved.legalFee +
    resolved.utilityFee +
    (isLandlord ? 0 : resolved.price * 0.15)

  return (
    <div className="relative font-sans">
      <PageBackground image={resolved.imageUrl} blackOverlayOpacity={48} />
      
      {/* High-quality Hero Section */}
      <HeroSection className="py-12 px-4 min-h-56 sm:min-h-68">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 mb-2 flex-wrap justify-center">
            <TrustBadge status={resolved.verificationStatus} />
            {isLandlord ? (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500 text-white shadow-sm border border-amber-300">
                <Building2 className="w-3.5 h-3.5" />
                <span>Direct Landlord Upload</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900 text-white shadow-sm border border-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Agent Upload</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {resolved.title}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-200 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-amber-300" /> {resolved.landmark}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-emerald-300" /> Available Now</span>
          </p>
        </div>
      </HeroSection>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Media Box with Video Tour Overlay */}
            <div className="h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden relative shadow-md group">
              <img src={resolved.imageUrl} alt={resolved.title} className="w-full h-full object-cover object-center" />
              
              {/* Center Play Button Overlay */}
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                aria-label="Play video walkthrough"
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors cursor-pointer focus:outline-none"
              >
                <div className="w-16 h-16 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
              </button>

              {/* View Video Action Button (Clean, no 15%/0%/Zero-middleman/verified badge clutter) */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>View Video</span>
                </button>
              </div>

              {/* Clean Uploader Attribution Badge */}
              <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-md backdrop-blur-md ${
                  isLandlord ? 'bg-amber-600/90' : 'bg-slate-900/90'
                }`}>
                  {isLandlord ? '👑 Landlord Upload' : '🏢 Agent Upload'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{resolved.title}</h2>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isLandlord ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  {isLandlord ? 'Direct Property Owner' : 'Verified Agent Listing'}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs sm:text-sm">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-emerald-600" /> {resolved.landmark}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-emerald-600" /> Available for Immediate Move-in</span>
              </div>
            </div>

            {/* Description Card (Only includes required details for respective uploader) */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {isLandlord ? 'Direct Landlord Property Details' : 'Agent Listing Details'}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Uploaded by: <strong>{resolved.uploaderName}</strong>
                </span>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed">{resolved.descriptionText}</p>

              {/* Required Details List tailored for uploader */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {isLandlord ? 'Landlord Required Fee Schedule' : 'Agent Required Fee Schedule'}
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-slate-400 font-medium">Annual Rent</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">₦{resolved.price.toLocaleString()}/yr</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-slate-400 font-medium">Caution Fee</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">₦{resolved.cautionFee.toLocaleString()} (Refundable)</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-slate-400 font-medium">Legal / Agreement</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">₦{resolved.legalFee.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <p className="text-slate-400 font-medium">Utilities Fee</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">₦{resolved.utilityFee.toLocaleString()}</p>
                  </div>

                  {isLandlord ? (
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 col-span-2 sm:col-span-1">
                      <p className="text-amber-700 font-bold">Agency Fee</p>
                      <p className="text-sm font-extrabold text-emerald-700 mt-0.5">₦0 (0% Fee)</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                        <p className="text-blue-700 font-bold">Agency Fee (15%)</p>
                        <p className="text-sm font-extrabold text-blue-900 mt-0.5">₦{(resolved.price * 0.15).toLocaleString()}</p>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        <p className="text-emerald-700 font-bold">Inspection Fee</p>
                        <p className="text-sm font-extrabold text-emerald-900 mt-0.5">₦0 (Free on Aroom)</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 mt-2">
                  <span className="text-xs font-bold text-slate-900">
                    {isLandlord ? 'Total Direct Landlord Move-In Package:' : 'Total Agent Move-In Package:'}
                  </span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₦{moveInSum.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Move-In Calculator View */}
            <div>
              <MoveInCostCalculator
                rent={resolved.price}
                uploaderType={resolved.uploaderType}
                customFees={{
                  cautionFee: resolved.cautionFee,
                  legalFee: resolved.legalFee,
                  utilityFee: resolved.utilityFee,
                  agencyFee: isLandlord ? 0 : resolved.price * 0.15,
                }}
                mode="inline"
              />
            </div>
          </div>

          {/* Right Column / Sticky Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 sticky top-24">
              <div className="text-3xl font-extrabold text-emerald-700">
                ₦{resolved.price.toLocaleString()}
                <span className="text-sm font-normal text-slate-500">/{resolved.period}</span>
              </div>

              <div className="mt-4">
                <MoveInCostCalculator
                  rent={resolved.price}
                  uploaderType={resolved.uploaderType}
                  customFees={{
                    cautionFee: resolved.cautionFee,
                    legalFee: resolved.legalFee,
                    utilityFee: resolved.utilityFee,
                    agencyFee: isLandlord ? 0 : resolved.price * 0.15,
                  }}
                  mode="card"
                />
              </div>

              {scheduledSlot ? (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Inspection Scheduled
                  </div>
                  <p className="text-sm font-bold text-slate-900">{scheduledSlot}</p>
                  <p className="text-xs text-slate-500">
                    {isLandlord ? 'The property owner' : 'The agent'} has been notified via WhatsApp.
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => navigate('/student/dashboard')}
                      className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 cursor-pointer"
                    >
                      View in Dashboard &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Customize &amp; Book Inspection</span>
                </button>
              )}

              <p className="text-xs text-center text-slate-500 mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero inspection fees guaranteed.</span>
              </p>

              <hr className="my-6 border-slate-100" />
              
              {/* Uploader Profile Card */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {isLandlord ? 'Direct Property Owner' : 'Listed by Verified Agent'}
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-bold shadow-xs ${
                    isLandlord ? 'bg-amber-600' : 'bg-slate-800'
                  }`}>
                    {isLandlord ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{resolved.uploaderName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span>{resolved.rating} Rating</span>
                      <span>•</span>
                      <span>{resolved.responseRate}% Response</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>

      {/* Inspection Customization Modal */}
      <InspectionScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={{
          id: id || '1',
          title: resolved.title,
          landmark: resolved.landmark,
          agentName: resolved.uploaderName,
        }}
        onConfirm={(booking) => {
          setScheduledSlot(`${booking.date} at ${booking.timeSlot}`)
        }}
      />

      {/* Video Walkthrough Player Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        title={resolved.title}
        videoUrl={resolved.videoUrl || '/videos/room-tour.mp4'}
        uploaderName={resolved.uploaderName}
        uploaderType={resolved.uploaderType}
      />
    </div>
  )
}
