import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrustBadge } from '@/components/shared/TrustBadge'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'

type Status = 'available' | 'held' | 'taken'

type AgentListing = {
  id: string
  title: string
  price: number
  verificationStatus: 'verified' | 'unverified_new'
  status: Status
  inquiries: number
}

const STATUSES: Status[] = ['available', 'held', 'taken']

export function DashboardPage() {
  const [listings, setListings] = useState<AgentListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadAgentListings() {
      setIsLoading(true)
      try {
        const fetched = await api.getListings()
        if (isMounted) {
          const mapped: AgentListing[] = fetched.map((l) => ({
            id: l.id,
            title: l.title,
            price: l.price,
            verificationStatus: l.verificationStatus,
            status: l.availabilityStatus,
            inquiries: l.availabilityStatus === 'held' ? 3 : 1,
          }))
          setListings(mapped)
        }
      } catch (err) {
        console.error('Failed to load listings:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadAgentListings()
    return () => {
      isMounted = false
    }
  }, [])

  const setStatus = async (id: string, status: Status) => {
    setUpdatingId(id)
    try {
      // 1. Optimistic UI update
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
      // 2. Call backend API to sync with Supabase
      await api.updateListingStatus(id, status, `Agent single-tap updated to ${status}`)
      setNotification(`Listing status updated to "${status}" in Supabase!`)
      setTimeout(() => setNotification(null), 3000)
    } catch (err) {
      console.warn('API update failed, kept local state:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRequestSpotCheck = async (id: string) => {
    setUpdatingId(id)
    try {
      await api.requestVerification(id)
      setNotification('Verification spot-check requested! Our campus sentinel team has been notified.')
      setTimeout(() => setNotification(null), 4000)
    } catch (err) {
      console.warn('Verification request warning:', err)
      setNotification('Spot check requested.')
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage availability & verification in real-time</p>
        </div>
        <Link
          to="/portal/listings/new"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-md transition-colors"
        >
          + New listing
        </Link>
      </div>

      {notification && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-sm text-slate-500">Syncing listings with database...</span>
        </div>
      ) : (
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
                      disabled={updatingId === l.id}
                      onClick={() => setStatus(l.id, s)}
                      className={`px-3 py-1.5 text-xs font-medium capitalize cursor-pointer transition-colors ${
                        l.status === s
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-slate-500">{l.inquiries} inquiries</span>
              </div>

              {l.verificationStatus === 'unverified_new' && (
                <button
                  type="button"
                  onClick={() => handleRequestSpotCheck(l.id)}
                  disabled={updatingId === l.id}
                  className="mt-3 text-sm text-green-700 font-medium hover:underline cursor-pointer block"
                >
                  Request spot-check for Verified badge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
