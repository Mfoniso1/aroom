import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { BackButton } from '@/components/shared/BackButton'
import { DashboardTicker } from '@/components/shared/DashboardTicker'
import { Home, Search, LogOut } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isStudentPortal = location.pathname.startsWith('/student')
  const isPartnerPortal = location.pathname.startsWith('/portal')

  return (
    <div className="min-h-screen font-sans flex flex-col relative">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Student Ticker */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
            <Link to="/" id="app-header-logo" className="inline-flex items-center shrink-0" aria-label="Aroom Home">
              <Logo variant="light" size="md" />
            </Link>

            {/* Continuous right-to-left-middle animated ticker for Student Dashboard */}
            {isStudentPortal && (
              <div className="flex items-center overflow-hidden min-w-0">
                <DashboardTicker />
              </div>
            )}
          </div>

          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Home - always maintained */}
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-md hover:bg-slate-100 transition-all inline-flex items-center gap-1.5"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </Link>

            {/* Explore */}
            <Link
              to="/search"
              className="text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 sm:px-3.5 py-1.5 rounded-md transition-all hidden sm:inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore</span>
            </Link>

            {/* Divider */}
            <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

            {/* If user is inside student or portal dashboard, do not show Login / Sign Up */}
            {isStudentPortal ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  Student Portal
                </span>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors inline-flex items-center gap-1"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log out</span>
                </Link>
              </div>
            ) : isPartnerPortal ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Partner Portal
                </span>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded transition-colors"
                >
                  Log out
                </Link>
              </div>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-all"
                >
                  Log In
                </Link>

                {/* Sign Up */}
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-md shadow-sm hover:shadow-emerald-200 hover:shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* ── Back button at bottom of every page (except root home) ── */}
      {!isHomePage && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <BackButton />
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-slate-900/95 backdrop-blur-md py-10 text-center text-slate-400 mt-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
          <Link to="/" aria-label="Aroom Home">
            <Logo variant="dark" size="sm" showTagline />
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            &copy; {CURRENT_YEAR} Aroom. Direct physical verification &amp; scam-free campus housing.
          </p>
        </div>
      </footer>
    </div>
  )
}
