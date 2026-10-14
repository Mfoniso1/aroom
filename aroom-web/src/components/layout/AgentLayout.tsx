import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { LayoutDashboard, Plus, LogOut, User } from 'lucide-react'
import { BackButton } from '@/components/shared/BackButton'

export function AgentLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isLandlord = location.pathname.includes('/landlord')
  const isRootDashboard = location.pathname === '/portal/dashboard' || location.pathname === '/portal/landlord/dashboard'
  const dashboardPath = isLandlord ? '/portal/landlord/dashboard' : '/portal/dashboard'
  const newListingPath = isLandlord ? '/portal/landlord/new' : '/portal/listings/new'
  const portalBadge = isLandlord ? 'Landlord' : 'Agent'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive ? 'bg-slate-800 text-green-400 border border-slate-700' : 'text-slate-300 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to={dashboardPath} id="app-header-logo" aria-label={`Aroom ${portalBadge} Portal`}>
            <Logo variant="dark" size="sm" badge={portalBadge} />
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to={dashboardPath} className={linkClass} end>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink to={newListingPath} className={linkClass}>
              <Plus className="w-4 h-4" />
              {isLandlord ? 'Add Property' : 'New Listing'}
            </NavLink>

            {/* Divider */}
            <span className="h-5 w-px bg-slate-700 mx-1" />

            <NavLink to="/portal/onboarding" className={linkClass}>
              <User className="w-4 h-4" />
              Profile
            </NavLink>

            <Link
              to="/"
              className="text-xs sm:text-sm text-slate-400 hover:text-white ml-1 pl-3 border-l border-slate-700 transition-colors"
            >
              Marketplace →
            </Link>

            <button
              onClick={() => navigate('/portal/login')}
              className="ml-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              aria-label="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Back button row below the page content in portal */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center">
        <BackButton to={isRootDashboard ? '/' : undefined} label={isRootDashboard ? 'Back to Marketplace' : 'Back to previous page'} />
      </div>
    </div>
  )
}
