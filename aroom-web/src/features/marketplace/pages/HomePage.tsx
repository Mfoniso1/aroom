import { useState, useEffect } from 'react'
import { Search as SearchIcon, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { ListingCard } from '@/components/shared/ListingCard'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { CAMPUSES } from '@/lib/campuses'
import { useListings } from '@/lib/listingsStore'

const ROTATING_ACCOMMODATIONS = [
  'Student Rooms',
  'Campus Hostels',
  'Self-Contains',
  'Shared Flats',
]

export function HomePage() {
  const navigate = useNavigate()
  const { listings } = useListings()
  const [termIndex, setTermIndex] = useState(0)
  const [selectedCampus, setSelectedCampus] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setTermIndex((prev) => (prev + 1) % ROTATING_ACCOMMODATIONS.length)
    }, 3200)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedCampus) params.set('campus', selectedCampus)
    if (selectedRoomType) params.set('roomType', selectedRoomType)
    navigate({
      pathname: '/search',
      search: params.toString() ? `?${params.toString()}` : '',
    })
  }

  return (
    <div className="relative">
      <PageBackground image="/images/rooms/room-01-apartment.jpg" blackOverlayOpacity={52} />

      {/* Minimalist Mobile-First Hero Section */}
      <HeroSection className="py-12 sm:py-20 px-4 min-h-0 sm:min-h-125">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600/80 border border-emerald-400/30 text-emerald-50 text-xs font-semibold mb-4 backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Mapped &amp; Verified Lodges • Transparent Move-In Costs</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          <span>Find Verified </span>
          <span className="inline-block text-amber-300" aria-live="polite">
            <span key={termIndex} className="animate-hero-word">
              {ROTATING_ACCOMMODATIONS[termIndex]}
            </span>
          </span>
          <span className="block mt-1 text-emerald-100">Zero Scams.</span>
        </h1>

        <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-200 max-w-xl mx-auto">
          Transparent move-in costs and Team-Leader-vetted campus agents.
        </p>

        {/* Clean Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mt-6 sm:mt-8 w-full max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 text-left"
        >
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3.5 outline-none font-medium"
          >
            <option value="">All UNIPORT Areas</option>
            {CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortCode} — {c.name}
              </option>
            ))}
          </select>
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="sm:w-44 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3.5 outline-none font-medium"
          >
            <option value="">All Room Types</option>
            <option value="self_contain">Self Contain</option>
            <option value="single_room">Single Room</option>
            <option value="flat_shared">Shared Flat</option>
          </select>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm px-6 py-3.5 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <SearchIcon className="h-4 w-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Secondary WhatsApp AI Shortcut */}
        <div className="mt-4 flex items-center justify-center">
          <Link
            to="/whatsapp-ai"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-200 hover:text-white bg-black/35 hover:bg-black/50 border border-white/15 px-4 py-2 rounded-full backdrop-blur-xs transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Prefer WhatsApp? Chat with Aroom AI to book a trusted agent →</span>
          </Link>
        </div>
      </HeroSection>

      {/* Listings Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/60 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Listings</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Available Campus Rooms
              </h2>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <span>View all ({listings.length})</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {listings.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
