import { Filter } from 'lucide-react'
import { ListingCard, type Listing } from '@/components/shared/ListingCard'

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Spacious Self-Contain at Akoka',
    price: 350000,
    period: 'yr',
    landmark: '5 mins walk from UNILAG Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Standard Single Room in Yaba',
    price: 180000,
    period: 'yr',
    landmark: 'Near Yabatech Back Gate',
    verificationStatus: 'unverified_new',
    availabilityStatus: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop'
  }
]

export function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 text-slate-900 font-semibold">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Campus</label>
              <select className="w-full border-slate-200 rounded-md text-sm p-2 outline-none focus:border-green-500 border bg-slate-50">
                <option>UNILAG</option>
                <option>UNIBEN</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Budget</label>
              <input type="range" className="w-full accent-green-600" min="50000" max="1000000" step="10000" />
              <div className="text-right text-sm text-slate-500 font-medium mt-1">₦500,000</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trust Level</label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="rounded text-green-600 focus:ring-green-500 accent-green-600 w-4 h-4" defaultChecked />
                Show Verified Only
              </label>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Search Results</h1>
          <span className="text-slate-500 text-sm">Showing 2 listings</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_LISTINGS.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  )
}

