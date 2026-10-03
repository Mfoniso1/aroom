import { Link, NavLink } from 'react-router-dom'

export function AgentLayout({ children }: { children: React.ReactNode }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/portal" className="text-lg font-bold">
            Aroom <span className="font-light">Agent</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/portal/dashboard" className={linkClass}>Listings</NavLink>
            <NavLink to="/portal/listings/new" className={linkClass}>New</NavLink>
            <NavLink to="/portal/onboarding" className={linkClass}>Onboarding</NavLink>
            <Link to="/" className="text-sm text-slate-400 hover:text-white ml-3">Marketplace</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
