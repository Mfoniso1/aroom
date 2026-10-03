import { useParams } from 'react-router-dom'
import { TrustBadge } from '@/components/shared/TrustBadge'
import { MoveInCostCalculator } from '@/components/shared/MoveInCostCalculator'
import { Calendar, MapPin, User, Star } from 'lucide-react'

export function ListingDetailPage() {
  const { id } = useParams()

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
            
            <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors">
              Book Inspection
            </button>
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
  )
}

