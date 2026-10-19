import { useState, useMemo } from 'react'
import { MapPin, X, Building2, UserCheck, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ListingCard } from '@/components/shared/ListingCard'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { CAMPUSES } from '@/lib/campuses'
import { useListings } from '@/lib/listingsStore'

export function SearchPage() {
  const { listings } = useListings()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCampus = searchParams.get('campus') || 'all'

  const [selectedCampus, setSelectedCampus] = useState(initialCampus)
  const [maxBudget, setMaxBudget] = useState(600000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [uploaderFilter, setUploaderFilter] = useState<'all' | 'landlord' | 'agent'>('all')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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
    return listings.filter((item) => {
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
  }, [listings, selectedCampus, maxBudget, verifiedOnly, uploaderFilter])

  const landlordCount = listings.filter((l) => l.uploaderType === 'landlord').length
  const agentCount = listings.filter((l) => l.uploaderType === 'agent').length
  const hasActiveFilters =
    selectedCampus !== 'all' || maxBudget !== 600000 || verifiedOnly || uploaderFilter !== 'all'

  const resetAllFilters = () => {
    handleCampusChange('all')
    setMaxBudget(600000)
    setVerifiedOnly(false)
    setUploaderFilter('all')
  }

  return (
    <div className="relative">
      <PageBackground image="/images/rooms/room-06-living-room.jpg" blackOverlayOpacity={55} />

      {/* Compact Hero Header */}
      <HeroSection className="py-8 sm:py-12 px-4 min-h-0">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {activeCampusObj ? `${activeCampusObj.shortCode} Student Housing` : 'Explore Verified Rooms'}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-200">
            Compare Direct Landlord rooms (0% fee) and Verified Agent listings (capped 15%).
          </p>
        </div>
      </HeroSection>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* ── Mobile Quick-Filter Bar (keeps listings above the fold on phones) ── */}
        <div className="md:hidden mb-4 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <select
              value={selectedCampus}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 px-3 py-2.5 outline-none"
            >
              <option value="all">All UNIPORT Areas</option>
              {CAMPUSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortCode} — {c.city}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                mobileFiltersOpen || maxBudget < 600000 || verifiedOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Horizontal Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setUploaderFilter('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer ${
                uploaderFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              All ({listings.length})
            </button>
            <button
              type="button"
              onClick={() => setUploaderFilter('landlord')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer ${
                uploaderFilter === 'landlord'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              Direct Landlord • 0% ({landlordCount})
            </button>
            <button
              type="button"
              onClick={() => setUploaderFilter('agent')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer ${
                uploaderFilter === 'agent'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              Verified Agent ({agentCount})
            </button>
          </div>

          {/* Collapsible Mobile Budget & Verification Drawer */}
          {mobileFiltersOpen && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700">Max Annual Rent</span>
                  <span className="font-extrabold text-emerald-700">
                    ₦{maxBudget.toLocaleString()}/yr
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded accent-emerald-600 w-4 h-4"
                  />
                  <span>Physically Verified Only</span>
                </label>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop 2-Column Layout ── */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block md:w-68 shrink-0">
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 sticky top-20 space-y-5">
              <div className="flex items-center justify-between text-slate-900 border-b border-slate-100 pb-3">
                <span className="text-sm font-extrabold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                  <span>Filter Rooms</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    Reset <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Uploader Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Listing Source
                </label>
                <button
                  type="button"
                  onClick={() => setUploaderFilter('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    uploaderFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>All Rooms</span>
                  <span>{listings.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploaderFilter('landlord')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    uploaderFilter === 'landlord'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Direct Landlord (0%)</span>
                  </span>
                  <span>{landlordCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploaderFilter('agent')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    uploaderFilter === 'agent'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verified Agent (15%)</span>
                  </span>
                  <span>{agentCount}</span>
                </button>
              </div>

              {/* Campus */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Campus
                </label>
                <select
                  value={selectedCampus}
                  onChange={(e) => handleCampusChange(e.target.value)}
                  className="w-full border-slate-200 rounded-xl text-xs font-semibold p-2.5 outline-none focus:border-emerald-500 border bg-slate-50"
                >
                  <option value="all">All Universities</option>
                  {CAMPUSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortCode} — {c.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Budget */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Max Rent
                  </label>
                  <span className="text-xs font-extrabold text-emerald-700">
                    ₦{maxBudget.toLocaleString()}/yr
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
              </div>

              {/* Verified Only */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span>Physically Verified Rooms Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Results Grid */}
          <div className="flex-1 min-w-0 w-full">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/60 shadow-lg">
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Showing <strong>{filteredListings.length}</strong> available{' '}
                  {filteredListings.length === 1 ? 'room' : 'rooms'}
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-800">
                    No rooms match that filter
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try increasing your max budget or switching campus filters.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
