/**
 * LandlordDashboardPage.tsx
 * Dedicated portal dashboard for verified property owners and landlords:
 * - Profile overview (Verified ownership, NIN, registered properties)
 * - Exclusive "+ List Property (Direct Landlord)" CTA
 * - Property and units occupancy manager
 * - Move-in cost breakdown (Rent, Caution, Legal, Utilities, 0% Agency fee)
 * - Direct student inspection schedule bookings & WhatsApp inquiries
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Plus, Eye, MessageCircle, TrendingUp,
  MapPin, ShieldCheck, Phone, Mail, Home, Calendar, UserCog, Clock
} from 'lucide-react'
import { EditProfileModal } from '@/components/shared/EditProfileModal'
import { AGENT_LOCATIONS } from '@/lib/agentLocations'
import {
  getCurrentSession,
  AUTH_CHANGE_EVENT,
  type ActiveSession,
} from '@/lib/pilotAuthStore'

type PropertyStatus = 'available' | 'held' | 'taken'

interface LandlordProperty {
  id: string
  title: string
  location: string
  totalUnits: number
  availableUnits: number
  rentPrice: number
  cautionFee: number
  legalFee: number
  utilityFee: number
  status: PropertyStatus
  views: number
  directInquiries: number
  imageUrl: string
}

const FALLBACK_LANDLORD: ActiveSession = {
  userId: 'd4444444-4444-4444-4444-444444444444',
  role: 'landlord',
  fullName: 'Chief Emeka Nwosu',
  email: 'emeka.nwosu@directlodge.ng',
  phoneNumber: '+2348022223333',
  agentProfileId: 'a3333333-3333-3333-3333-333333333333',
  agentKind: 'landlord',
  agencyName: 'Nwosu Executive Student Suites',
  coverageAreas: ['uniport-choba', 'uniport-alakahia'],
  bio: 'Verified direct landlord offering 0% agency fee student apartments near UNIPORT.',
  approvalStatus: 'approved',
  rejectionReason: null,
}

const INITIAL_PROPERTIES: LandlordProperty[] = [
  {
    id: 'prop-1',
    title: 'Eze Royal Lodge (Self-Contain Units)',
    location: 'Choba, 5 mins from UNIPORT Gate',
    totalUnits: 10,
    availableUnits: 2,
    rentPrice: 300000,
    cautionFee: 30000,
    legalFee: 20000,
    utilityFee: 15000,
    status: 'available',
    views: 480,
    directInquiries: 18,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'prop-2',
    title: 'Delta View Executive Studios',
    location: 'Alakahia, near Delta Park Gate',
    totalUnits: 8,
    availableUnits: 1,
    rentPrice: 280000,
    cautionFee: 25000,
    legalFee: 20000,
    utilityFee: 15000,
    status: 'held',
    views: 310,
    directInquiries: 12,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'prop-3',
    title: 'Sunrise Villa (Shared 2-Bed Flats)',
    location: 'Aluu, University Road',
    totalUnits: 6,
    availableUnits: 0,
    rentPrice: 220000,
    cautionFee: 20000,
    legalFee: 15000,
    utilityFee: 10000,
    status: 'taken',
    views: 195,
    directInquiries: 9,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop',
  },
]

export function LandlordDashboardPage() {
  const [session, setSession] = useState<ActiveSession>(() => getCurrentSession() || FALLBACK_LANDLORD)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [properties, setProperties] = useState<LandlordProperty[]>(INITIAL_PROPERTIES)
  const [filterTab, setFilterTab] = useState<'all' | PropertyStatus>('all')

  useEffect(() => {
    const sync = () => setSession(getCurrentSession() || FALLBACK_LANDLORD)
    window.addEventListener(AUTH_CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setStatus = (id: string, newStatus: PropertyStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    )
  }

  const coverageIds = session.coverageAreas?.length
    ? session.coverageAreas
    : FALLBACK_LANDLORD.coverageAreas || []
  const coverageLabels = coverageIds
    .map((id) => AGENT_LOCATIONS.find((l) => l.id === id)?.label || id)
    .filter(Boolean)

  const totalUnitsCount = properties.reduce((acc, p) => acc + p.totalUnits, 0)
  const totalViews = properties.reduce((acc, p) => acc + p.views, 0)
  const totalInquiries = properties.reduce((acc, p) => acc + p.directInquiries, 0)
  const vacantUnits = properties.reduce((acc, p) => acc + p.availableUnits, 0)

  const filteredProperties =
    filterTab === 'all'
      ? properties
      : properties.filter((p) => p.status === filterTab)

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* ── Top Header / Landlord Profile ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex gap-4 sm:gap-5 items-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-sm shrink-0 overflow-hidden">
              {session.avatarUrl ? (
                <img src={session.avatarUrl} alt={session.fullName} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-9 h-9 text-amber-100" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{session.fullName}</h1>
                {session.approvalStatus === 'approved' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Team Leader Verified Owner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                    <Clock className="w-3.5 h-3.5" /> Verification {session.approvalStatus || 'Pending'}
                  </span>
                )}
              </div>

              {session.agencyName && (
                <p className="text-xs font-bold text-amber-700">{session.agencyName}</p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" />{session.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" />{session.phoneNumber}</span>
                <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-slate-400" />{properties.length} Properties ({totalUnitsCount} Units)</span>
              </div>

              {/* Coverage areas */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {coverageLabels.map((loc) => (
                  <span key={loc} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Landlord Listing + Edit Profile CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm border border-slate-200 transition-all cursor-pointer"
            >
              <UserCog className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <Link
              to="/portal/landlord/new"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>List Property (Direct)</span>
            </Link>
          </div>
        </div>

        {/* ── Key Metrics Overview ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Properties</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{properties.length} Lodges</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{totalUnitsCount} units registered</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Available Rooms</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{vacantUnits} Vacant</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Ready for student move-in</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Direct Inquiries</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{totalInquiries}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Direct student chats</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Views</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{totalViews.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Student video impressions</p>
          </div>
        </div>

        {/* ── Properties Management Section ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span>My Direct Properties &amp; Units</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Track vacancies, inquiries, and zero-agency move-in packages.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              {(['all', 'available', 'held', 'taken'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                    filterTab === tab
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'all' ? `All (${properties.length})` : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Properties List */}
          <div className="space-y-4">
            {filteredProperties.map((prop) => {
              const moveInSum =
                prop.rentPrice + prop.cautionFee + prop.legalFee + prop.utilityFee

              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row gap-5 items-start justify-between"
                >
                  {/* Left: Image & Info */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start flex-1 min-w-0">
                    <img
                      src={prop.imageUrl}
                      alt={prop.title}
                      className="w-full sm:w-36 h-28 rounded-xl object-cover shrink-0"
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {prop.title}
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          Direct Landlord (0% Agency)
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prop.location}</span>
                      </p>

                      {/* Landlord Fee Package Preview */}
                      <div className="pt-2 flex flex-wrap gap-2 text-xs">
                        <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
                          <strong>Rent:</strong> ₦{prop.rentPrice.toLocaleString()}/yr
                        </span>
                        <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
                          <strong>Caution:</strong> ₦{prop.cautionFee.toLocaleString()}
                        </span>
                        <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
                          <strong>Legal:</strong> ₦{prop.legalFee.toLocaleString()}
                        </span>
                        <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
                          <strong>Utilities:</strong> ₦{prop.utilityFee.toLocaleString()}
                        </span>
                        <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-emerald-800 font-bold">
                          Total Move-In: ₦{moveInSum.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats & Availability Status */}
                  <div className="flex flex-row lg:flex-col justify-between items-end gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{prop.views}</strong> views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                        <strong>{prop.directInquiries}</strong> chats
                      </span>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatus(prop.id, 'available')}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          prop.status === 'available'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(prop.id, 'held')}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          prop.status === 'held'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        On Hold
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(prop.id, 'taken')}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          prop.status === 'taken'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Full
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Direct Student Inspection Requests ── */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Upcoming Physical Walkthroughs (Zero Inspection Fees)</span>
              </h3>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Students who scheduled to inspect your lodge physically before making payment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Chinedu Obi (300L Mechanical Eng)</span>
                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">Tomorrow 10:00 AM</span>
              </div>
              <p className="text-xs text-slate-500">
                Lodge: <strong>Eze Royal Lodge (Unit 4)</strong>
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium">WhatsApp verified</span>
                <button
                  type="button"
                  onClick={() => window.open('https://wa.me/2348000000000', '_blank')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  Message Student
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Amara Osei (Computer Science)</span>
                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">In 2 Days 1:30 PM</span>
              </div>
              <p className="text-xs text-slate-500">
                Lodge: <strong>Delta View Executive Studios</strong>
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium">WhatsApp verified</span>
                <button
                  type="button"
                  onClick={() => window.open('https://wa.me/2348000000000', '_blank')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  Message Student
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <EditProfileModal
        session={session}
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSaved={(updated) => setSession(updated)}
      />
    </div>
  )
}
