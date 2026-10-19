import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  Phone,
  Mail,
  UserCheck,
  Building2,
  ShieldCheck,
} from 'lucide-react'
import {
  getCurrentSession,
  getTeamLeaderProfile,
  syncFromSupabase,
  AUTH_CHANGE_EVENT,
  type ActiveSession,
} from '@/lib/pilotAuthStore'

export function ApprovalStatusPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<ActiveSession | null>(() => getCurrentSession())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const reload = () => setSession(getCurrentSession())
    window.addEventListener(AUTH_CHANGE_EVENT, reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, reload)
      window.removeEventListener('storage', reload)
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await syncFromSupabase()
    setSession(getCurrentSession())
    setRefreshing(false)
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to check your approval status</h1>
          <p className="text-sm text-slate-500">
            Log in with the email or phone number you used when registering as an Agent or Landlord.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  const status = session.approvalStatus || 'pending'
  const isLandlord = session.agentKind === 'landlord' || session.role === 'landlord'
  const dashboardUrl = isLandlord ? '/portal/landlord/dashboard' : '/portal/dashboard'
  const newListingUrl = isLandlord ? '/portal/landlord/new' : '/portal/listings/new'

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Status Banner */}
        {status === 'pending' && (
          <div className="bg-amber-500 text-white px-6 py-5 flex items-center gap-3">
            <Clock className="w-7 h-7 shrink-0" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Partner Verification
              </span>
              <h1 className="text-xl font-extrabold">Awaiting Team Leader Approval</h1>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="bg-emerald-600 text-white px-6 py-5 flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 shrink-0" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Verified Aroom Partner
              </span>
              <h1 className="text-xl font-extrabold">Your Account is Approved!</h1>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-600 text-white px-6 py-5 flex items-center gap-3">
            <XCircle className="w-7 h-7 shrink-0" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Verification Update
              </span>
              <h1 className="text-xl font-extrabold">Application Not Approved</h1>
            </div>
          </div>
        )}

        {status === 'suspended' && (
          <div className="bg-slate-800 text-white px-6 py-5 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 shrink-0 text-amber-400" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Account Status
              </span>
              <h1 className="text-xl font-extrabold">Account Temporarily Suspended</h1>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Applicant details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                {isLandlord ? (
                  <Building2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                )}
                {session.fullName}
              </span>
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {isLandlord ? 'Landlord' : 'Agent'}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {session.phoneNumber}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {session.email}
              </span>
            </div>
          </div>

          {status === 'pending' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                To keep students safe, every <strong>{isLandlord ? 'Landlord' : 'Agent'}</strong> on Aroom is personally
                verified and approved by our <strong>Team Leader</strong> before listing properties.
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold">What happens next?</p>
                <p>1. Our Team Leader has received your registration details.</p>
                <p>2. They will review your uploaded ID card and may call your phone number ({session.phoneNumber}).</p>
                <p>3. Once approved, you can immediately publish listings on Aroom.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing status…' : 'Check Approval Status'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(dashboardUrl)}
                  className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Preview Dashboard (Read-only)
                </button>
              </div>
            </div>
          )}

          {status === 'approved' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                The Aroom Team Leader has verified and approved your profile. You now have full access to publish and
                manage accommodation listings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(newListingUrl)}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Post a Property Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(dashboardUrl)}
                  className="flex-1 py-3.5 px-5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900">
                <p className="font-bold text-xs uppercase tracking-wider text-red-700 mb-1">
                  Reason from Team Leader:
                </p>
                <p>{session.rejectionReason || 'Your ID photo or contact details could not be verified.'}</p>
              </div>
              <p className="text-xs text-slate-500">
                You cannot publish listings while your application is unapproved. Please re-apply with a clear ID card
                or contact the Aroom Team Leader.
              </p>
              <div className="flex gap-3">
                <Link
                  to={isLandlord ? '/signup/landlord' : '/signup/agent'}
                  className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm"
                >
                  Submit New Application
                </Link>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {status === 'suspended' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                <p className="font-bold mb-1">Reason:</p>
                <p>{session.rejectionReason || 'Account suspended by Team Leader.'}</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Check Status Again
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified by {getTeamLeaderProfile().fullName}</span>
            </span>
            <a
              href={`tel:${getTeamLeaderProfile().whatsappSupport}`}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Support: {getTeamLeaderProfile().whatsappSupport}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

