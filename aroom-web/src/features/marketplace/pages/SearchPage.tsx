import { useState, useMemo } from 'react'
import { Filter, MapPin, X, Building2, UserCheck, Video } from 'lucide-react'
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
    uploaderType: 'agent',
    uploaderName: 'Femi K. (Certified Agent)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 30000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 52500, // 15% of 350,000
    }
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
    uploaderType: 'landlord',
    uploaderName: 'Chief Emeka Eze (Property Owner)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 25000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 0, // Direct landlord - zero agency fee
    }
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
    uploaderType: 'agent',
    uploaderName: 'David O. (UNIPORT Verified Agent)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 30000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 48000, // 15% of 320,000
    }
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
    uploaderType: 'landlord',
    uploaderName: 'Elder Nnamdi (Lodge Landlord)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 0, // Direct landlord
    }
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
    uploaderType: 'agent',
    uploaderName: 'Blessing A. (Lagos Agent)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 27000, // 15% of 180,000
    }
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
    uploaderType: 'landlord',
    uploaderName: 'Dr. (Mrs) Johnson (Property Owner)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 40000,
      legalFee: 25000,
      utilityFee: 20000,
      agencyFee: 0, // Direct landlord
    }
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
    uploaderType: 'agent',
    uploaderName: 'Victor E. (Benin Campus Agent)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 31500, // 15% of 210,000
    }
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
    uploaderType: 'landlord',
    uploaderName: 'Pastor Osa (Direct Landlord)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 25000,
      legalFee: 20000,
      utilityFee: 15000,
      agencyFee: 0, // Direct landlord
    }
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
    uploaderType: 'landlord',
    uploaderName: 'Prof. Adeleke (Lodge Landlord)',
    hasVideoTour: true,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    customFees: {
      cautionFee: 20000,
      legalFee: 15000,
      utilityFee: 10000,
      agencyFee: 0, // Direct landlord
    }
  }
]

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCampus = searchParams.get('campus') || 'all'

  const [selectedCampus, setSelectedCampus] = useState(initialCampus)
  const [maxBudget, setMaxBudget] = useState(600000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [uploaderFilter, setUploaderFilter] = useState<'all' | 'landlord' | 'agent'>('all')

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
      if (uploaderFilter !== 'all' && item.uploaderType !== uploaderFilter) {
        return false
      }
      return true
    })
  }, [selectedCampus, maxBudget, verifiedOnly, uploaderFilter])

  const landlordCount = ALL_MOCK_LISTINGS.filter((l) => l.uploaderType === 'landlord').length
  const agentCount = ALL_MOCK_LISTINGS.filter((l) => l.uploaderType === 'agent').length

  return (
    <div className="relative">
      <PageBackground image="/images/rooms/room-06-living-room.jpg" blackOverlayOpacity={52} />
      
      {/* High-quality Hero Section */}
      <HeroSection className="py-14 px-4 min-h-60 sm:min-h-72">
        <div className="text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-medium mb-3 backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Verified Campus Accommodations &amp; Video Walkthroughs</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Explore Student Rooms
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200 max-w-xl mx-auto">
            Choose between Direct Landlord uploads (0% agency fee) and verified Agent uploads with capped 15% agency.
          </p>
        </div>
      </HeroSection>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-76 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 sticky top-20 space-y-6">
            <div className="flex items-center justify-between text-slate-900 font-semibold border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-emerald-600" />
                <span className="font-bold">Filters</span>
              </div>
              {(selectedCampus !== 'all' || maxBudget !== 600000 || verifiedOnly || uploaderFilter !== 'all') && (
                <button
                  onClick={() => {
                    handleCampusChange('all')
                    setMaxBudget(600000)
                    setVerifiedOnly(false)
                    setUploaderFilter('all')
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  Reset <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            {/* 1. Uploader / Video Filter (Direct Landlord vs Agent) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Uploader &amp; Video Source
              </label>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setUploaderFilter('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                    uploaderFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-slate-400" />
                    <span>All Video Uploads</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    uploaderFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ALL_MOCK_LISTINGS.length}
                  </span>
                </button>

                {/* Direct Landlord Option */}
                <button
                  type="button"
                  onClick={() => setUploaderFilter('landlord')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                    uploaderFilter === 'landlord'
                      ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50/70 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Direct Landlord Uploads</span>
                  </span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    uploaderFilter === 'landlord' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    0% Fee
                  </span>
                </button>

                {/* Agent Option */}
                <button
                  type="button"
                  onClick={() => setUploaderFilter('agent')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                    uploaderFilter === 'agent'
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50/70 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Agent Uploads</span>
                  </span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    uploaderFilter === 'agent' ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    15% Fee
                  </span>
                </button>
              </div>
            </div>

            {/* 2. University Campus */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                University Campus
              </label>
              <select 
                value={selectedCampus}
                onChange={(e) => handleCampusChange(e.target.value)}
                className="w-full border-slate-200 rounded-xl text-sm p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 border bg-slate-50 font-medium"
              >
                <option value="all">All Universities &amp; Campuses</option>
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortCode} - {c.city}
                  </option>
                ))}
              </select>

              {activeCampusObj && (
                <div className="mt-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60 text-xs text-emerald-800">
                  <div className="font-bold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    {activeCampusObj.name}
                  </div>
                  <div className="text-emerald-700 mt-1">
                    Hubs: {activeCampusObj.popularLandmarks.slice(0, 3).join(', ')}
                  </div>
                </div>
              )}
            </div>
            
            {/* 3. Max Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Max Budget</label>
                <span className="text-sm font-extrabold text-emerald-700">
                  ₦{maxBudget.toLocaleString()}
                </span>
              </div>
              <input 
                type="range" 
                className="w-full accent-emerald-600 cursor-pointer" 
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
            
            {/* 4. Trust Level */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Physical Verification</label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 w-4 h-4 cursor-pointer" 
                />
                <span className="text-xs font-medium">Physically Verified Rooms Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Results */}
        <div className="flex-1 min-w-0">
          
          {/* Header Controls & Quick Filter Pills */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeCampusObj ? `${activeCampusObj.shortCode} Student Housing` : 'Student Accommodation Listings'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {uploaderFilter === 'landlord'
                  ? 'Showing verified Direct Landlord uploads (No agency commission).'
                  : uploaderFilter === 'agent'
                  ? 'Showing verified Agent uploads (standard 15% agency fee).'
                  : 'Browse all verified campus video uploads and rooms.'}
              </p>
            </div>

            {/* Quick Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => setUploaderFilter('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  uploaderFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({ALL_MOCK_LISTINGS.length})
              </button>

              <button
                type="button"
                onClick={() => setUploaderFilter('landlord')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  uploaderFilter === 'landlord'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>👑 Direct Landlords</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full font-extrabold">{landlordCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setUploaderFilter('agent')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                  uploaderFilter === 'agent'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>🏢 Agent Uploads</span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-full font-extrabold">{agentCount}</span>
              </button>
            </div>
          </div>
          
          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <MapPin className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No rooms found matching your filters</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Try switching between Landlord and Agent uploads, or adjusting your budget range.
              </p>
              <button
                onClick={() => {
                  handleCampusChange('all')
                  setMaxBudget(600000)
                  setVerifiedOnly(false)
                  setUploaderFilter('all')
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
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
