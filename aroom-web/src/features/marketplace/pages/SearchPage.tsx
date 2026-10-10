import { useState, useEffect } from 'react'
import { Filter, Loader2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ListingCard, type Listing } from '@/components/shared/ListingCard'
import { api, FALLBACK_LISTINGS } from '@/lib/api'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCampus = searchParams.get('campus') || 'unilag'
  const initialRoomType = searchParams.get('roomType') || ''

  const [campus, setCampus] = useState(initialCampus)
  const [roomType, setRoomType] = useState(initialRoomType)
  const [maxBudget, setMaxBudget] = useState(600000)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [listings, setListings] = useState<Listing[]>(FALLBACK_LISTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadFilteredListings() {
      setIsLoading(true)
      try {
        const results = await api.getListings({
          campus_code: campus.toUpperCase(),
          max_budget: maxBudget,
          only_verified: onlyVerified,
          room_type: roomType ? (roomType as any) : undefined,
        })
        if (isMounted) {
          setListings(results)
        }
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadFilteredListings()
    return () => {
      isMounted = false
    }
  }, [campus, roomType, maxBudget, onlyVerified])

  const handleCampusChange = (newCampus: string) => {
    setCampus(newCampus)
    const newParams = new URLSearchParams(searchParams)
    if (newCampus) newParams.set('campus', newCampus)
    else newParams.delete('campus')
    setSearchParams(newParams)
  }

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
              <select
                value={campus}
                onChange={(e) => handleCampusChange(e.target.value)}
                className="w-full border-slate-200 rounded-md text-sm p-2 outline-none focus:border-green-500 border bg-slate-50"
              >
                <option value="unilag">UNILAG (Lagos)</option>
                <option value="uniben">UNIBEN (Benin)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full border-slate-200 rounded-md text-sm p-2 outline-none focus:border-green-500 border bg-slate-50"
              >
                <option value="">All Types</option>
                <option value="self_contain">Self Contain</option>
                <option value="single_room">Single Room</option>
                <option value="flat_shared">Shared Flat</option>
                <option value="flat_entire">Entire Flat</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Max Budget</label>
                <span className="text-xs font-bold text-green-700">₦{maxBudget.toLocaleString()}</span>
              </div>
              <input
                type="range"
                className="w-full accent-green-600 cursor-pointer"
                min="100000"
                max="1000000"
                step="25000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trust Level</label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-green-600 focus:ring-green-500 accent-green-600 w-4 h-4 cursor-pointer"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                />
                Show Verified Only
              </label>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Search Results</h1>
            <p className="text-xs text-slate-500 mt-0.5">Live listings synced with Supabase</p>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-green-600" />}
            <span className="text-slate-500 text-sm">Showing {listings.length} listings</span>
          </div>
        </div>

        {listings.length === 0 && !isLoading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <p className="text-lg font-semibold text-slate-700">No matching accommodations found</p>
            <p className="text-sm text-slate-500 mt-1">Try increasing your max budget or selecting all room types.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
