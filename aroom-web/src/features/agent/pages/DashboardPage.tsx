/**
 * DashboardPage.tsx
 * Agent portal dashboard — profile overview, listing manager with view/inquiry counts.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Eye, MessageCircle, TrendingUp, Plus,
  User, Star, ShieldCheck, Phone, Mail,
  CheckCircle2, Clock, XCircle, BarChart2,
} from 'lucide-react'
import { TrustBadge } from '@/components/shared/TrustBadge'
import { AGENT_LOCATIONS } from '@/lib/agentLocations'

// ─── Types ────────────────────────────────────────────────────────────────────
type AvailStatus = 'available' | 'held' | 'taken'
type VerifyStatus = 'verified' | 'unverified_new'

interface AgentListing {
  id: string
  title: string
  location: string
  price: number
  roomType: string
  verificationStatus: VerifyStatus
  status: AvailStatus
  views: number
  inquiries: number
  postedDate: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_AGENT = {
  name: 'Femi Adeyemi',
  email: 'femi.adeyemi@gmail.com',
  phone: '08012345678',
  joinedDate: 'October 2026',
  rating: 4.8,
  reviewCount: 14,
  responseRate: 97,
  coverageAreas: ['choba', 'alakahia', 'back_of_chem'],
  isVerified: true,
}

const INITIAL_LISTINGS: AgentListing[] = [
  {
    id: '1',
    title: 'Spacious Self-Contain at Choba',
    location: 'Choba',
    price: 300000,
    roomType: 'Self Contain',
    verificationStatus: 'verified',
    status: 'available',
    views: 128,
    inquiries: 7,
    postedDate: '10 Oct 2026',
  },
  {
    id: '2',
    title: 'Clean Single Room — Back of Chem',
    location: 'Back of Chem',
    price: 160000,
    roomType: 'Single Room',
    verificationStatus: 'verified',
    status: 'held',
    views: 94,
    inquiries: 4,
    postedDate: '8 Oct 2026',
  },
  {
    id: '3',
    title: 'Modern Studio, Alakahia Road',
    location: 'Alakahia',
    price: 280000,
    roomType: 'Self Contain',
    verificationStatus: 'unverified_new',
    status: 'available',
    views: 31,
    inquiries: 2,
    postedDate: '12 Oct 2026',
  },
  {
    id: '4',
    title: '2-Bedroom Flat (Shared) Aluu',
    location: 'Aluu',
    price: 220000,
    roomType: 'Shared Flat',
    verificationStatus: 'unverified_new',
    status: 'taken',
    views: 57,
    inquiries: 5,
    postedDate: '5 Oct 2026',
  },
]

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<AvailStatus, { label: string; color: string; icon: React.ReactNode }> = {
  available: { label: 'Available', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  held:      { label: 'On Hold',   color: 'bg-amber-100 text-amber-700 border-amber-200',       icon: <Clock className="w-3.5 h-3.5" /> },
  taken:     { label: 'Taken',     color: 'bg-red-100 text-red-600 border-red-200',             icon: <XCircle className="w-3.5 h-3.5" /> },
}

const AVAIL_STATUSES: AvailStatus[] = ['available', 'held', 'taken']

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
      <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function DashboardPage() {
  const [listings, setListings] = useState(INITIAL_LISTINGS)
  const [activeTab, setActiveTab] = useState<'all' | AvailStatus>('all')

  const setStatus = (id: string, status: AvailStatus) =>
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))

  const coverageLabels = MOCK_AGENT.coverageAreas
    .map((id) => AGENT_LOCATIONS.find((l) => l.id === id)?.label)
    .filter(Boolean)

  const totalViews = listings.reduce((s, l) => s + l.views, 0)
  const totalInquiries = listings.reduce((s, l) => s + l.inquiries, 0)
  const activeCount = listings.filter((l) => l.status === 'available').length

  const filtered = activeTab === 'all' ? listings : listings.filter((l) => l.status === activeTab)

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Agent Profile Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-3xl font-extrabold shrink-0">
            {MOCK_AGENT.name.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-slate-900">{MOCK_AGENT.name}</h2>
              {MOCK_AGENT.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Agent
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{MOCK_AGENT.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{MOCK_AGENT.phone}</span>
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Joined {MOCK_AGENT.joinedDate}</span>
            </div>

            {/* Rating + Response */}
            <div className="flex flex-wrap gap-3 mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {MOCK_AGENT.rating} ({MOCK_AGENT.reviewCount} reviews)
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                {MOCK_AGENT.responseRate}% response rate
              </span>
            </div>

            {/* Coverage areas */}
            <div className="flex flex-wrap items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {coverageLabels.map((label) => (
                <span key={label} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Edit profile CTA */}
          <button className="shrink-0 text-sm font-semibold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors">
            Edit Profile
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<BarChart2 className="w-5 h-5" />} label="Total Listings" value={listings.length} sub="all time" />
          <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} label="Active Listings" value={activeCount} sub="currently available" />
          <StatCard icon={<Eye className="w-5 h-5 text-blue-500" />} label="Total Views" value={totalViews.toLocaleString()} sub="across all listings" />
          <StatCard icon={<MessageCircle className="w-5 h-5 text-violet-500" />} label="Enquiries" value={totalInquiries} sub="student contacts" />
        </div>

        {/* ── Listings Manager ── */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" /> My Listings
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">Manage availability and track performance</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/portal/listings/new"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agent Listing (15% Agency)
              </Link>
              <Link
                to="/portal/landlord/new"
                className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Landlord Listing (Direct)
              </Link>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {(['all', 'available', 'held', 'taken'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {tab === 'all' ? `All (${listings.length})` : `${STATUS_CONFIG[tab].label} (${listings.filter((l) => l.status === tab).length})`}
              </button>
            ))}
          </div>

          {/* Listing cards */}
          <div className="space-y-4">
            {filtered.map((listing) => {
              const sc = STATUS_CONFIG[listing.status]
              return (
                <div key={listing.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-base truncate">{listing.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location}</span>
                        <span>·</span>
                        <span>{listing.roomType}</span>
                        <span>·</span>
                        <span>Posted {listing.postedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TrustBadge status={listing.verificationStatus} />
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.color}`}>
                        {sc.icon}{sc.label}
                      </span>
                    </div>
                  </div>

                  {/* Price + stats row */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-green-700 font-extrabold text-lg">
                      ₦{listing.price.toLocaleString()}<span className="text-sm font-medium text-slate-400">/yr</span>
                    </p>

                    {/* View + inquiry counts */}
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <strong className="text-slate-800">{listing.views.toLocaleString()}</strong> views
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MessageCircle className="w-4 h-4 text-violet-400" />
                        <strong className="text-slate-800">{listing.inquiries}</strong> enquiries
                      </span>
                    </div>
                  </div>

                  {/* Status toggle */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 mr-1">Change status:</span>
                    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                      {AVAIL_STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(listing.id, s)}
                          className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                            listing.status === s
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {s === 'held' ? 'On Hold' : s}
                        </button>
                      ))}
                    </div>

                    {listing.verificationStatus === 'unverified_new' && (
                      <button className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline ml-2">
                        + Request Verification
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
