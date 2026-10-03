import { Search as SearchIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  },
  {
    id: '3',
    title: '2-Bedroom Shared Flat Onike',
    price: 450000,
    period: 'yr',
    landmark: 'Onike roundabout',
    verificationStatus: 'verified',
    availabilityStatus: 'held',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1c2c490b2d?q=80&w=800&auto=format&fit=crop'
  }
]

export function HomePage() {
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/search')
  }

  return (
    <div>
      <div className="bg-green-700 py-24 px-4 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Find Verified Student Accommodation. No Scams.
        </h1>
        <p className="mt-6 text-xl text-green-100 max-w-2xl mx-auto">
          Connect with trusted agents and view verified listings. Never lose an inspection fee or pay for a phantom room again.
        </p>
        
        <form onSubmit={handleSearch} className="mt-10 max-w-3xl mx-auto bg-white rounded-lg p-2 shadow-xl flex flex-col sm:flex-row gap-2">
          <select className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full p-4 outline-none">
            <option value="">Select Campus (e.g., UNILAG)</option>
            <option value="unilag">University of Lagos (UNILAG)</option>
            <option value="uniben">University of Benin (UNIBEN)</option>
          </select>
          <select className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full p-4 outline-none">
            <option value="">Room Type</option>
            <option value="self_contain">Self Contain</option>
            <option value="single_room">Single Room</option>
            <option value="flat_shared">Shared Flat</option>
          </select>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-md text-base px-8 py-4 flex items-center justify-center gap-2 transition-colors">
            <SearchIcon className="h-5 w-5" />
            Search
          </button>
        </form>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Recently Added Near You</h2>
            <p className="text-slate-500 mt-2">Explore the latest verified student housing.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_LISTINGS.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  )
}

