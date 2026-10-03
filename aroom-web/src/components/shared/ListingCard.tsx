import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrustBadge } from './TrustBadge'
import { MoveInCostCalculator } from './MoveInCostCalculator'

export type Listing = {
  id: string
  title: string
  price: number
  period: string
  landmark: string
  verificationStatus: 'verified' | 'unverified_new'
  availabilityStatus: 'available' | 'held' | 'taken'
  imageUrl: string
}

type ListingCardProps = {
  listing: Listing
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'

export function ListingCard({ listing }: ListingCardProps) {
  const [imgSrc, setImgSrc] = useState(listing.imageUrl)

  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative">
        <div className="h-48 bg-slate-200 relative overflow-hidden">
          <img
            src={imgSrc}
            alt={listing.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <TrustBadge status={listing.verificationStatus} />
          </div>

          <div className={`absolute bottom-2 right-2 text-white text-xs font-medium px-2 py-1 rounded ${
            listing.availabilityStatus === 'available' ? 'bg-slate-900/80' :
            listing.availabilityStatus === 'held' ? 'bg-amber-600/90' : 'bg-red-600/90'
          }`}>
            {listing.availabilityStatus === 'available' ? 'Available Now' :
             listing.availabilityStatus === 'held' ? 'Inspection Held' : 'Taken'}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 truncate">{listing.title}</h3>
          <p className="text-slate-500 text-sm mt-1">📍 {listing.landmark}</p>

          <div className="mt-3.5 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold text-green-700">
                ₦{listing.price.toLocaleString()}
              </span>
              <span className="text-sm font-normal text-slate-500">/{listing.period}</span>
            </div>
          </div>

          <MoveInCostCalculator rent={listing.price} mode="card" />
        </div>
      </div>
    </Link>
  )
}
