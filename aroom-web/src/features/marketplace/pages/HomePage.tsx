import { useState, useEffect } from 'react'
import { Search as SearchIcon, ShieldCheck, Sparkles, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ListingCard } from '@/components/shared/ListingCard'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { CAMPUSES } from '@/lib/campuses'
import { useListings } from '@/lib/listingsStore'

const ROTATING_ACCOMMODATIONS = [
  'Student Accommodation',
  'Campus Hostels',
  'Self-Contain Rooms',
  'Shared Flats',
  'Off-Campus Housing'
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
      search: params.toString() ? `?${params.toString()}` : ''
    })
  }

  return (
    <div className="relative">
      <PageBackground image="/images/rooms/room-01-apartment.jpg" blackOverlayOpacity={50} />
      {/* Hero Section - inherits unified page background with zero photo division */}
      <HeroSection className="py-24 px-4 min-h-150">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Trust Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-600/70 border border-green-400/30 text-green-100 text-xs sm:text-sm font-medium mb-6 shadow-sm backdrop-blur-sm animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>100% Physical Inspection Guarantee</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
          <span className="text-green-200">Zero Fake Agent Fees</span>
        </div>

        {/* Animated Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto animate-fade-in-up">
          <span>Find Verified </span>
          <span 
            className="inline-block text-amber-300 drop-shadow-md min-h-[1.2em] transition-all"
            aria-live="polite"
          >
            <span key={termIndex} className="animate-hero-word">
              {ROTATING_ACCOMMODATIONS[termIndex]}
            </span>
          </span>
          <span className="block mt-2 sm:mt-1">
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-emerald-100 via-white to-amber-200 bg-clip-text text-transparent animate-shimmer-text">
                No Scams.
              </span>
              <svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 text-amber-400/90 overflow-visible"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 9.5C55 2 145 2 198 9.5"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-xl text-green-100 max-w-2xl mx-auto animate-fade-in-up [animation-delay:150ms]">
          Connect with trusted agents and view verified listings. Never lose an inspection fee or pay for a phantom room again.
        </p>

        {/* Search Form */}
        <form 
          onSubmit={handleSearch} 
          className="mt-10 w-full max-w-3xl mx-auto bg-white rounded-lg p-2 shadow-2xl flex flex-col sm:flex-row gap-2 text-left animate-fade-in-up [animation-delay:250ms]"
        >
          <select 
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full p-4 outline-none"
          >
            <option value="">Select Campus (e.g., UNIPORT, UNILAG)</option>
            {CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select 
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full p-4 outline-none"
          >
            <option value="">All Room Types</option>
            <option value="self_contain">Self Contain</option>
            <option value="single_room">Single Room</option>
            <option value="flat_shared">Shared Flat</option>
          </select>
          <button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-md text-base px-8 py-4 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <SearchIcon className="h-5 w-5" />
            Search
          </button>
        </form>

        {/* Trust points under search */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-green-200 animate-fade-in-up [animation-delay:350ms]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-300" /> Direct physical verification
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-300" /> Escrow payment protection
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-300" /> UNIPORT, UNILAG, UNIBEN &amp; 10+ campuses
          </span>
        </div>
      </HeroSection>
      
      {/* Listings Section - High Visibility Frosted Container */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/60 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Verified Student Accommodations
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                Recently Added Near You
              </h2>
              <p className="text-slate-600 mt-2 text-base sm:text-lg">
                Explore the latest verified student housing across top Nigerian universities.
              </p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <span>View all campus listings</span>
              <span>&rarr;</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.slice(0, 6).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
