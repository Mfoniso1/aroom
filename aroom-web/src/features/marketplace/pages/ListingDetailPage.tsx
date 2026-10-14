import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TrustBadge } from '@/components/shared/TrustBadge'
import { MoveInCostCalculator } from '@/components/shared/MoveInCostCalculator'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { InspectionScheduleModal } from '@/components/shared/InspectionScheduleModal'
import { Calendar, MapPin, User, Star, CheckCircle2 } from 'lucide-react'

export function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduledSlot, setScheduledSlot] = useState<string | null>(null)

  const listing = {
    id,
    title: 'Spacious Self-Contain at Akoka',
    price: 350000,
    period: 'yr',
    landmark: '5 mins walk from UNILAG Gate',
    verificationStatus: 'verified' as const,
    availabilityStatus: 'available' as const,
    description: 'A very spacious and clean self-contain with running water and personal prepaid meter. Just 5 minutes walk to the university main gate.',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
    agent: {
      name: 'Femi K.',
      rating: 4.9,
      responseRate: 98
    }
  }

  return (
    <div className="relative">
      <PageBackground image={listing.imageUrl} blackOverlayOpacity={48} />
      
      {/* High-quality Hero Section */}
      <HeroSection className="py-12 px-4 min-h-56 sm:min-h-68">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <TrustBadge status={listing.verificationStatus} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {listing.title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-200 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-amber-300" /> {listing.landmark}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-emerald-300" /> Available Now</span>
          </p>
        </div>
      </HeroSection>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
          <div className="md:col-span-2 space-y-6">
            <div className="h-80 sm:h-96 bg-slate-200 rounded-xl overflow-hidden relative shadow-sm">
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <TrustBadge status={listing.verificationStatus} />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {listing.landmark}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Available Now</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-700 leading-relaxed">{listing.description}</p>
            </div>

            <div>
              <MoveInCostCalculator rent={listing.price} mode="inline" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-24">
              <div className="text-3xl font-bold text-green-700">
                ₦{listing.price.toLocaleString()}
                <span className="text-lg font-normal text-slate-500">/{listing.period}</span>
              </div>

              <div className="mt-4">
                <MoveInCostCalculator rent={listing.price} mode="card" />
              </div>

              {scheduledSlot ? (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Inspection Scheduled
                  </div>
                  <p className="text-sm font-bold text-slate-900">{scheduledSlot}</p>
                  <p className="text-xs text-slate-500">The agent has been notified via WhatsApp &amp; SMS.</p>
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
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Customize &amp; Book Inspection</span>
                </button>
              )}

              <p className="text-xs text-center text-slate-500 mt-3">Never pay inspection fees upfront.</p>

              <hr className="my-6 border-slate-100" />
              
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Listed by Agent</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{listing.agent.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {listing.agent.rating} • {listing.agent.responseRate}% Response
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
          id: listing.id || '1',
          title: listing.title,
          landmark: listing.landmark,
          agentName: listing.agent.name,
        }}
        onConfirm={(booking) => {
          setScheduledSlot(`${booking.date} at ${booking.timeSlot}`)
        }}
      />
    </div>
  )
}
