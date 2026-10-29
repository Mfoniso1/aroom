import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { BackButton } from '@/components/shared/BackButton'
import { Home, Search, LogOut, LayoutDashboard, ShieldCheck, MessageSquare, User } from 'lucide-react'
import {
  getCurrentSession,
  logoutPilotUser,
  getDashboardPathForSession,
  AUTH_CHANGE_EVENT,
  type ActiveSession,
} from '@/lib/pilotAuthStore'

const CURRENT_YEAR = new Date().getFullYear()

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState<ActiveSession | null>(() => getCurrentSession())

  useEffect(() => {
    const sync = () => setSession(getCurrentSession())
    window.addEventListener(AUTH_CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [location.pathname])

  const isHomePage = location.pathname === '/'
  const isSearchPage = location.pathname.startsWith('/search')
  const isWhatsAppPage = location.pathname.startsWith('/whatsapp-ai')

  const roleBadgeLabel =
    session?.role === 'admin'
      ? 'Team Leader'
      : session?.role === 'landlord' || session?.agentKind === 'landlord'
      ? 'Landlord'
      : session?.role === 'agent'
      ? 'Agent'
      : 'Student'

  const roleBadgeStyle =
    session?.role === 'admin'
      ? 'bg-indigo-950 text-indigo-200 border-indigo-700'
      : session?.role === 'landlord' || session?.agentKind === 'landlord'
      ? 'bg-amber-100 text-amber-900 border-amber-200'
      : session?.role === 'agent'
      ? 'bg-teal-100 text-teal-900 border-teal-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200'

  const dashboardHref = getDashboardPathForSession(session)

  return (
    <div className="min-h-screen font-sans flex flex-col relative pb-16 sm:pb-0">
      {/* ── Minimalist Top Navbar ─────────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            to="/"
            id="app-header-logo"
            className="inline-flex items-center shrink-0"
            aria-label="Aroom Home"
          >
            <Logo variant="light" size="sm" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1.5">
            <Link
              to="/"
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                isHomePage
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </Link>

            <Link
              to="/search"
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                isSearchPage
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Explore Rooms</span>
            </Link>

            <Link
              to="/whatsapp-ai"
              className={`text-sm font-bold px-3.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
                isWhatsAppPage
                  ? 'bg-[#075e54] text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title="Find Trusted Agents & Houses on WhatsApp AI"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp AI</span>
            </Link>
          </nav>

          {/* Right User / Auth Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {session ? (
              <>
                <Link
                  to={dashboardHref}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all"
                  title="Open your dashboard"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center overflow-hidden shrink-0">
                    {session.avatarUrl ? (
                      <img
                        src={session.avatarUrl}
                        alt={session.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      session.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-24 truncate">
                    {session.fullName.split(' ')[0]}
                  </span>
                  <span
                    className={`hidden md:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleBadgeStyle}`}
                  >
                    {roleBadgeLabel}
                  </span>
                  {session.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                  ) : (
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    logoutPilotUser()
                    navigate('/login')
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 p-2 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Log out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 sm:px-4 py-1.5 rounded-lg shadow-2xs transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* ── Back button at bottom of every page (except root home) ── */}
      {!isHomePage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center">
          <BackButton />
        </div>
      )}

      {/* ── Minimalist Footer ───────────────────────────────────── */}
      <footer className="bg-slate-900 py-8 text-center text-slate-400 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <Link to="/" aria-label="Aroom Home">
            <Logo variant="dark" size="sm" showTagline />
          </Link>
          <p className="text-xs text-slate-500">
            &copy; {CURRENT_YEAR} Aroom. Verified campus accommodation &amp; transparent move-in pricing.
          </p>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation Bar (< 640px) ──────────────── */}
      <nav
        aria-label="Mobile Navigation"
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 grid grid-cols-4 gap-1 shadow-lg"
      >
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[11px] font-bold transition-colors ${
            isHomePage ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[11px] font-bold transition-colors ${
            isSearchPage ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>Explore</span>
        </Link>

        <Link
          to="/whatsapp-ai"
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[11px] font-bold transition-colors ${
            isWhatsAppPage
              ? 'text-white bg-[#075e54]'
              : 'text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>WhatsApp AI</span>
        </Link>

        <Link
          to={session ? dashboardHref : '/login'}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[11px] font-bold transition-colors ${
            location.pathname.startsWith('/student') ||
            location.pathname.startsWith('/login') ||
            location.pathname.startsWith('/signup')
              ? 'text-emerald-700 bg-emerald-50/80'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          <span className="truncate max-w-16">
            {session ? session.fullName.split(' ')[0] : 'Sign In'}
          </span>
        </Link>
      </nav>
    </div>
  )
}
