import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrustBadge } from '@/components/shared/TrustBadge'

type Status = 'available' | 'held' | 'taken'

type AgentListing = {
  id: string
  title: string
  price: number
  verificationStatus: 'verified' | 'unverified_new'
  status: Status
  inquiries: number
}

const INITIAL: AgentListing[] = [
  { id: '1', title: 'Spacious Self-Contain at Akoka', price: 350000, verificationStatus: 'verified', status: 'available', inquiries: 4 },
  { id: '2', title: 'Standard Single Room in Yaba', price: 180000, verificationStatus: 'unverified_new', status: 'available', inquiries: 1 },
  { id: '3', title: '2-Bedroom Shared Flat Onike', price: 450000, verificationStatus: 'verified', status: 'held', inquiries: 2 },
]

const STATUSES: Status[] = ['available', 'held', 'taken']

export function DashboardPage() {
  const [listings, setListings] = useState(INITIAL)

  // TODO: PATCH /api/v1/listings/:id/status
  const setStatus = (id: string, status: Status) =>
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
        <Link to="/portal/listings/new" className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-md">
          + New listing
        </Link>
      </div>

      <div className="space-y-4">
        {listings.map((l) => (
          <div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{l.title}</h2>
                <p className="text-green-700 font-bold mt-1">₦{l.price.toLocaleString()}/yr</p>
              </div>
              <TrustBadge status={l.verificationStatus} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-md border border-slate-200 overflow-hidden">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(l.id, s)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize ${
                      l.status === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <span className="text-sm text-slate-500">{l.inquiries} inquiries</span>
            </div>

            {l.verificationStatus === 'unverified_new' && (
              <button className="mt-3 text-sm text-green-700 font-medium hover:underline">
                Request spot-check for Verified badge
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
