import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-slate-900">Aroom</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/search" className="text-sm font-medium text-slate-600 hover:text-green-600">Browse Rooms</Link>
            <Link to="/portal" className="text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
              Agent Portal
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-900 py-8 text-center text-slate-400 mt-12">
        <p className="text-sm">&copy; {new Date().getFullYear()} Aroom. Safe Student Housing.</p>
      </footer>
    </div>
  )
}
