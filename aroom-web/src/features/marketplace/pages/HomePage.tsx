import { useState, useEffect } from 'react'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ListingCard, type Listing } from '@/components/shared/ListingCard'
import { api, FALLBACK_LISTINGS } from '@/lib/api'

export function HomePage() {
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>(FALLBACK_LISTINGS)
  const [campuses, setCampuses] = useState<Array<{ id: string; name: string; shortCode: string }>>([])
  const [selectedCampus, setSelectedCampus] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        setIsLoading(true)
        const [loadedListings, loadedCampuses] = await Promise.all([
          api.getListings(),
          api.getCampuses(),
        ])
        if (isMounted) {
          setListings(loadedListings)
          setCampuses(loadedCampuses)
        }
      } catch (err) {
        console.error('Failed to load initial data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (selectedCampus) query.set('campus', selectedCampus)
    if (selectedRoomType) query.set('roomType', selectedRoomType)
    navigate(`/search?${query.toString()}`)
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

        <form
          onSubmit={handleSearch}
          className="mt-10 max-w-3xl mx-auto bg-white rounded-lg p-2 shadow-xl flex flex-col sm:flex-row gap-2"
        >
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full p-4 outline-none"
          >
            <option value="">Select Campus (e.g., UNILAG)</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.shortCode.toLowerCase()}>
                {c.name} ({c.shortCode})
              </option>
            ))}
            {campuses.length === 0 && (
              <>
                <option value="unilag">University of Lagos (UNILAG)</option>
                <option value="uniben">University of Benin (UNIBEN)</option>
              </>
            )}
          </select>

          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full p-4 outline-none"
          >
            <option value="">Room Type</option>
            <option value="self_contain">Self Contain</option>
            <option value="single_room">Single Room</option>
            <option value="flat_shared">Shared Flat</option>
            <option value="flat_entire">Entire Flat</option>
          </select>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-md text-base px-8 py-4 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
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
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
              <span>Syncing with Supabase...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  )
}
