import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import {
  LayoutDashboard,
  Plus,
  LogOut,
  ShieldCheck,
  Clock,
  Lock,
  ArrowRight,
  Store,
} from 'lucide-react'
import { BackButton } from '@/components/shared/BackButton'
import {
  getCurrentSession,
  logoutPilotUser,
  AUTH_CHANGE_EVENT,
  type ActiveSession,
} from '@/lib/pilotAuthStore'

export function AgentLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<ActiveSession | null>(() => getCurrentSession())

  useEffect(() => {
    const reload = () => setSession(getCurrentSession())
    window.addEventListener(AUTH_CHANGE_EVENT, reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, reload)
      window.removeEventListener('storage', reload)
    }
  }, [location.pathname])

  const isLandlord = location.pathname.includes('/landlord') || session?.agentKind === 'landlord'
  const isRootDashboard =
    location.pathname === '/portal/dashboard' || location.pathname === '/portal/landlord/dashboard'
  const isNewListingPage =
    location.pathname === '/portal/listings/new' || location.pathname === '/portal/landlord/new'
  const dashboardPath = isLandlord ? '/portal/landlord/dashboard' : '/portal/dashboard'
  const newListingPath = isLandlord ? '/portal/landlord/new' : '/portal/listings/new'
  const portalBadge = isLandlord ? 'Landlord' : 'Agent'

  const isUnapprovedPartner =
    session !== null &&
    session.role !== 'admin' &&
    session.approvalStatus !== null &&
    session.approvalStatus !== 'approved'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
      isActive ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-300 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link
            to={dashboardPath}
            id="app-header-logo"
            aria-label={`Aroom ${portalBadge} Portal`}
            className="shrink-0"
          >
            <Logo variant="dark" size="sm" badge={portalBadge} />
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <NavLink to={dashboardPath} className={linkClass} end>
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Dashboard</span>
            </NavLink>
            <NavLink to={newListingPath} className={linkClass}>
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{isLandlord ? 'Add Room' : 'Add Listing'}</span>
            </NavLink>

            <NavLink to="/portal/status" className={linkClass} title="Verification Status">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Status</span>
            </NavLink>

            {session?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-indigo-200 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-400/30 transition-colors whitespace-nowrap"
                title="Return to Team Leader Command Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Command</span>
              </Link>
            )}

            <Link
              to="/"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              title="Back to Marketplace"
            >
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Market</span>
            </Link>

            <button
              onClick={() => {
                logoutPilotUser()
                navigate('/login')
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 px-2 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Compact Banner if logged-in agent/landlord is awaiting Team Leader approval */}
      {isUnapprovedPartner && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-medium">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                Account status: <strong className="uppercase">{session.approvalStatus}</strong> — Team Leader verification required to publish.
              </span>
            </span>
            <Link to="/portal/status" className="underline font-extrabold">
              Check Status →
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1">
        {isNewListingPage && isUnapprovedPartner ? (
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Verification Pending
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hi <strong>{session.fullName}</strong>, all partners are verified by the Aroom Team Leader before publishing accommodations.
              </p>
              <Link
                to="/portal/status"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm"
              >
                View Approval Status <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center">
        <BackButton
          to={isRootDashboard ? '/' : undefined}
          label={isRootDashboard ? 'Back to Marketplace' : 'Back'}
        />
      </div>
    </div>
  )
}
