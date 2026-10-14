import { useState, useMemo } from 'react'
import { Filter, MapPin, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ListingCard, type Listing } from '@/components/shared/ListingCard'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { CAMPUSES } from '@/lib/campuses'

const ALL_MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Spacious Self-Contain at Akoka',
    price: 350000,
    period: 'yr',
    landmark: '5 mins walk from UNILAG Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'unilag',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Executive Self-Contain in Choba',
    price: 280000,
    period: 'yr',
    landmark: '5 mins to UNIPORT Choba Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniport',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Modern Studio Apartment at Alakahia',
    price: 320000,
    period: 'yr',
    landmark: 'Close to UNIPORT Delta Park',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniport',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '7',
    title: '2-Bedroom Shared Flat in Ozuoba',
    price: 220000,
    period: 'yr',
    landmark: 'Near UNIPORT Abuja Campus Gate',
    verificationStatus: 'unverified_new',
    availabilityStatus: 'available',
    campusId: 'uniport',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Standard Single Room in Yaba',
    price: 180000,
    period: 'yr',
    landmark: 'Near Yabatech Back Gate / UNILAG',
    verificationStatus: 'unverified_new',
    availabilityStatus: 'available',
    campusId: 'unilag',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    title: '2-Bedroom Shared Flat Onike',
    price: 450000,
    period: 'yr',
    landmark: 'Onike roundabout near UNILAG',
    verificationStatus: 'verified',
    availabilityStatus: 'held',
    campusId: 'unilag',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '6',
    title: 'Serviced Room near Ekosodin Gate',
    price: 210000,
    period: 'yr',
    landmark: 'Ekosodin, UNIBEN Main Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniben',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '8',
    title: 'Self-Contain Apartment at BDPA',
    price: 260000,
    period: 'yr',
    landmark: 'BDPA Estate, Ugbowo (UNIBEN)',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'uniben',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '9',
    title: 'Charming Studio in Agbowo',
    price: 250000,
    period: 'yr',
    landmark: 'Walking distance to UI Main Gate',
    verificationStatus: 'verified',
    availabilityStatus: 'available',
    campusId: 'ui',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'
  }
]

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCampus = searchParams.get('campus') || 'all'

  const [selectedCampus, setSelectedCampus] = useState(initialCampus)
  const [maxBudget, setMaxBudget] = useState(600000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const handleCampusChange = (campusId: string) => {
    setSelectedCampus(campusId)
    const newParams = new URLSearchParams(searchParams)
    if (campusId === 'all') {
      newParams.delete('campus')
    } else {
      newParams.set('campus', campusId)
    }
    setSearchParams(newParams)
  }

  const activeCampusObj = useMemo(() => {
    return CAMPUSES.find((c) => c.id === selectedCampus)
  }, [selectedCampus])

  const filteredListings = useMemo(() => {
    return ALL_MOCK_LISTINGS.filter((item) => {
      if (selectedCampus !== 'all' && item.campusId !== selectedCampus) {
        return false
      }
      if (item.price > maxBudget) {
        return false
      }
      if (verifiedOnly && item.verificationStatus !== 'verified') {
        return false
      }
      return true
    })
  }, [selectedCampus, maxBudget, verifiedOnly])

  return (
    <div className="relative">
      <PageBackground image="/images/rooms/room-06-living-room.jpg" blackOverlayOpacity={52} />
      
      {/* High-quality Hero Section - inherits unified page background with zero photo division */}
      <HeroSection className="py-14 px-4 min-h-60 sm:min-h-72">
        <div className="text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-medium mb-3 backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Verified Campus Accommodations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Explore Student Rooms
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200 max-w-xl mx-auto">
            Find vetted, scam-free self-contains, single rooms, and shared apartments across top campuses.
          </p>
        </div>
      </HeroSection>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
      <aside className="w-full md:w-72 shrink-0">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 sticky top-20">
          <div className="flex items-center justify-between mb-6 text-slate-900 font-semibold border-b pb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              <span>Filters</span>
            </div>
            {selectedCampus !== 'all' && (
              <button
                onClick={() => handleCampusChange('all')}
                className="text-xs text-slate-500 hover:text-green-700 flex items-center gap-1"
              >
                Reset <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                University Campus
              </label>
              <select 
                value={selectedCampus}
                onChange={(e) => handleCampusChange(e.target.value)}
                className="w-full border-slate-200 rounded-md text-sm p-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 border bg-slate-50 font-medium"
              >
                <option value="all">All Universities &amp; Campuses</option>
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortCode} - {c.city}
                  </option>
                ))}
              </select>

              {activeCampusObj && (
                <div className="mt-3 p-2.5 bg-green-50 rounded-md border border-green-200/60 text-xs text-green-800">
                  <div className="font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-green-600" />
                    {activeCampusObj.name}
                  </div>
                  <div className="text-green-700 mt-1">
                    Popular areas: {activeCampusObj.popularLandmarks.slice(0, 3).join(', ')}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Max Budget</label>
                <span className="text-sm font-semibold text-green-700">
                  ₦{maxBudget.toLocaleString()}
                </span>
              </div>
              <input 
                type="range" 
                className="w-full accent-green-600 cursor-pointer" 
                min="100000" 
                max="1000000" 
                step="20000" 
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₦100k</span>
                <span>₦1.0M/yr</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">Trust Level</label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-green-600 focus:ring-green-500 accent-green-600 w-4 h-4 cursor-pointer" 
                />
                Show Physically Verified Only
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Results */}
      <div className="flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeCampusObj ? `${activeCampusObj.shortCode} Housing Listings` : 'Student Accommodation Listings'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeCampusObj 
                ? `Verified student accommodations near ${activeCampusObj.name} (${activeCampusObj.city})`
                : 'Browse verified campus rentals across Nigerian universities.'}
            </p>
          </div>
          <span className="text-xs sm:text-sm font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full self-start sm:self-auto">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} available
          </span>
        </div>
        
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 p-8">
            <MapPin className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">No rooms found matching your filters</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your campus selection or increasing the maximum budget to see more available rooms.
            </p>
            <button
              onClick={() => {
                handleCampusChange('all')
                setMaxBudget(1000000)
                setVerifiedOnly(false)
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}
