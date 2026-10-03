import { Link } from 'react-router-dom'
import { TrustBadge } from './TrustBadge'

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

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative">
        <div className="h-48 bg-slate-200 relative overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.title}
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

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-green-700">
              ₦{listing.price.toLocaleString()}
              <span className="text-sm font-normal text-slate-500">/{listing.period}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
