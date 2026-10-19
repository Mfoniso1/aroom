/**
 * StudentDashboardPage.tsx
 * Student portal dashboard:
 * - Profile overview (campus, matric number, verification badge)
 * - Saved listings (bookmarks)
 * - Scheduled physical inspections with WhatsApp reminders
 * - Automated "Room Taken" alert with instant similar-budget alternatives
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Heart, Calendar, MapPin,
  ShieldCheck, Clock, ArrowUpRight,
  MessageSquare, XCircle, ArrowRight,
  GraduationCap, Mail, Phone, UserCog
} from 'lucide-react'
import { TrustBadge } from '@/components/shared/TrustBadge'
import { InspectionScheduleModal } from '@/components/shared/InspectionScheduleModal'
import { EditProfileModal } from '@/components/shared/EditProfileModal'
import {
  getCurrentSession,
  AUTH_CHANGE_EVENT,
  type ActiveSession,
} from '@/lib/pilotAuthStore'
import { CAMPUSES } from '@/lib/campuses'

const FALLBACK_STUDENT: ActiveSession = {
  userId: 'd3333333-3333-3333-3333-333333333333',
  role: 'student',
  fullName: 'Amara Nwosu',
  email: 'amara.nwosu@uniport.edu.ng',
  phoneNumber: '+2348055556666',
  campus: 'uniport',
  matricNumber: 'U2022/5570042',
  agentProfileId: null,
  agentKind: null,
  approvalStatus: null,
  rejectionReason: null,
}

const INITIAL_SAVED_LISTINGS = [
  {
    id: 'uniport-1',
    title: 'Executive Self-Contain in Choba',
    price: 280000,
    period: 'yr',
    landmark: '5 mins walk to UNIPORT Choba Gate',
    verificationStatus: 'verified' as const,
    availabilityStatus: 'available' as const,
    campus: 'UNIPORT',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
    inspectionSlot: 'Thu, Oct 15 at 1:30 PM',
    hasWhatsappReminder: true,
  },
  {
    id: 'uniport-5',
    title: 'Standard Single Room at Delta Park',
    price: 160000,
    period: 'yr',
    landmark: '10 mins to Choba Gate, Delta Park',
    verificationStatus: 'verified' as const,
    availabilityStatus: 'available' as const,
    campus: 'UNIPORT',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
    inspectionSlot: null,
    hasWhatsappReminder: false,
  },
  {
    id: 'uniport-2',
    title: 'Modern Studio at Alakahia (UPTH Road)',
    price: 320000,
    period: 'yr',
    landmark: '8 mins to UPTH Gate & Delta Park',
    verificationStatus: 'verified' as const,
    availabilityStatus: 'available' as const,
    campus: 'UNIPORT',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
    inspectionSlot: 'Fri, Oct 16 at 10:00 AM',
    hasWhatsappReminder: true,
  },
]

// Mock alert for a room that was taken right before student inspection
const INITIAL_TAKEN_ALERT = {
  originalTitle: 'Single Room near Choba Gate',
  originalLocation: 'Choba Gate',
  originalPrice: 170000,
  takenTime: '25 mins ago',
  suggestedAlternatives: [
    {
      id: 'uniport-5',
      title: 'Standard Single Room at Delta Park',
      price: 160000,
      landmark: '10 mins to Choba Gate, Delta Park',
      imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=400&auto=format&fit=crop',
      verificationStatus: 'unverified_new' as const,
    },
    {
      id: 'uniport-7',
      title: 'Neat Self-Contain at Rumuosi',
      price: 200000,
      landmark: 'Rumuosi, off East-West Road',
      imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=400&auto=format&fit=crop',
      verificationStatus: 'verified' as const,
    },
  ]
}

export function StudentDashboardPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<ActiveSession>(() => getCurrentSession() || FALLBACK_STUDENT)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savedListings, setSavedListings] = useState(INITIAL_SAVED_LISTINGS)
  const [takenAlert, setTakenAlert] = useState<typeof INITIAL_TAKEN_ALERT | null>(INITIAL_TAKEN_ALERT)
  const [activeSchedulingListing, setActiveSchedulingListing] = useState<typeof INITIAL_SAVED_LISTINGS[0] | null>(null)

  useEffect(() => {
    const sync = () => setSession(getCurrentSession() || FALLBACK_STUDENT)
    window.addEventListener(AUTH_CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const campusName =
    CAMPUSES.find((c) => c.id === session.campus)?.name ||
    session.campus?.toUpperCase() ||
    'University of Port Harcourt (UNIPORT)'

  const handleRemove = (id: string) => {
    setSavedListings((prev) => prev.filter((l) => l.id !== id))
  }

  const bookedInspections = savedListings.filter((l) => l.inspectionSlot !== null)

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* ── Minimalist Student Profile Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-3.5 sm:gap-4 items-center min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white text-xl sm:text-2xl font-extrabold shadow-xs shrink-0 overflow-hidden">
              {session.avatarUrl ? (
                <img src={session.avatarUrl} alt={session.fullName} className="w-full h-full object-cover" />
              ) : (
                session.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">{session.fullName}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Student
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{campusName}</span>
                </span>
                {session.matricNumber && (
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    {session.matricNumber}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{session.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{session.phoneNumber}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-200 transition-all cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => navigate('/whatsapp-ai')}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-[#075e54] hover:bg-[#064e46] text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp AI
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Explore
            </button>
          </div>
        </div>

        {/* ── COMPACT "ROOM TAKEN" NOTICE WITH SIMILAR ALTERNATIVES ── */}
        {takenAlert && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    "{takenAlert.originalTitle}" was rented ({takenAlert.takenTime}) — matching alternatives ready:
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setTakenAlert(null)}
                className="text-xs text-slate-400 hover:text-slate-700 px-1 cursor-pointer"
                title="Dismiss alert"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {takenAlert.suggestedAlternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={alt.imageUrl} alt={alt.title} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{alt.title}</h4>
                      <p className="text-[11px] font-extrabold text-emerald-700">₦{alt.price.toLocaleString()}/yr</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/listings/${alt.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Scheduled Physical Inspections Alert ── */}
        {bookedInspections.length > 0 && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" /> Upcoming Physical Inspections
                </h2>
                <p className="text-xs text-slate-500">
                  WhatsApp reminders will be dispatched <strong>45 mins</strong> and <strong>15 mins</strong> before each slot.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full self-start sm:self-auto flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookedInspections.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-col justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{item.title}</h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        {item.inspectionSlot?.includes('Today') ? 'TODAY' : 'Confirmed'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item.inspectionSlot}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {item.landmark}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <MessageSquare className="w-3 h-3" />
                      <span>Alert 15m before</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveSchedulingListing(item)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => navigate(`/listings/${item.id}`)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Saved Listings (Bookmarks) ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Saved Accommodations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Rooms you have shortlisted for inspection</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Browse more rooms &rarr;
            </button>
          </div>

          {savedListings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No saved rooms yet</p>
              <p className="text-xs text-slate-400 mt-1">Browse campus listings and tap the heart icon to save.</p>
              <button
                onClick={() => navigate('/search')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Find Rooms
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="relative h-44">
                    <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemove(listing.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-red-500 hover:bg-white shadow-xs cursor-pointer"
                      title="Remove from saved"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </button>
                    <div className="absolute bottom-2.5 left-2.5">
                      <TrustBadge status={listing.verificationStatus} />
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{listing.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {listing.landmark}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-emerald-700">
                          ₦{listing.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">/{listing.period}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveSchedulingListing(listing)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
                          title="Schedule inspection"
                        >
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{listing.inspectionSlot ? 'Reschedule' : 'Inspect'}</span>
                        </button>
                        <button
                          onClick={() => navigate(`/listings/${listing.id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Student Safety Tips ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Aroom Student Protection Policy
          </h3>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>Never pay any form of inspection fee or upfront cash before seeing the apartment physically.</li>
            <li>All agents on Aroom are required to conduct free physical walkthroughs for verified students.</li>
            <li>If a house is taken, we message you directly on WhatsApp with matching available rooms so you never make a wasted trip.</li>
          </ul>
        </div>

      </div>

      {/* Interactive Modal for scheduling / immediate calling */}
      {activeSchedulingListing && (
        <InspectionScheduleModal
          isOpen={!!activeSchedulingListing}
          onClose={() => setActiveSchedulingListing(null)}
          listing={{
            id: activeSchedulingListing.id,
            title: activeSchedulingListing.title,
            landmark: activeSchedulingListing.landmark,
          }}
          onConfirm={(booking) => {
            if (booking.type === 'immediate_call') {
              const newSlot = 'Today (Immediate Call Initiated)'
              setSavedListings((prev) =>
                prev.map((l) =>
                  l.id === activeSchedulingListing.id ? { ...l, inspectionSlot: newSlot } : l
                )
              )
            } else {
              const newSlot = `${booking.date} at ${booking.timeSlot}`
              setSavedListings((prev) =>
                prev.map((l) =>
                  l.id === activeSchedulingListing.id ? { ...l, inspectionSlot: newSlot } : l
                )
              )
            }
          }}
        />
      )}

      <EditProfileModal
        session={session}
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSaved={(updated) => setSession(updated)}
      />
    </div>
  )
}
