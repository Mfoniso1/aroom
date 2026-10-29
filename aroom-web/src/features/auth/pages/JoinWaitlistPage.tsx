import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Phone,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { AGENT_LOCATIONS } from '@/lib/agentLocations'

export function JoinWaitlistPage() {
  const [role, setRole] = useState<'landlord' | 'agent'>('landlord')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [area, setArea] = useState('uniport-choba')
  const [unitsCount, setUnitsCount] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save to local waitlist store for pilot
    const waitlist = JSON.parse(localStorage.getItem('aroom_waitlist') || '[]')
    waitlist.push({
      fullName,
      phone,
      email,
      role,
      area,
      unitsCount,
      note,
      submittedAt: new Date().toISOString(),
    })
    localStorage.setItem('aroom_waitlist', JSON.stringify(waitlist))
    setSubmitted(true)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={55} />

      <HeroSection className="py-8 sm:py-12 px-4 min-h-0">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>UNIPORT Closed Pilot Cohort</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Join the Aroom Partner Waitlist
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-200">
            Aroom is operating with an invite-only team of 15–20 curated agents and landlords. Apply below to join our next onboarding wave.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-3.5 sm:px-6 pb-12 max-w-lg mx-auto w-full">
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 shadow-2xl">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Application Received</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Thank you for your interest, <strong>{fullName}</strong>. Our UNIPORT Team Leader reviews waitlist submissions as active quota slots expand.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Return to Home
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs border border-emerald-200"
                >
                  Go to Partner Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'landlord'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>Direct Landlord (0% Fee)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('agent')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'agent'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Campus Agent (15% Cap)</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Chief / Mr / Ms..."
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="080 1234 5678"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Operational Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Location near UNIPORT
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none font-medium bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                >
                  {AGENT_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated units */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Properties / Units Available
                </label>
                <input
                  type="text"
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(e.target.value)}
                  placeholder="e.g. 10 self-contain units or 15 listings/month"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Note on Experience / Lodge Name
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tell us about your lodge or student housing network..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Submit Waitlist Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-500 hover:text-emerald-700">
                  Already have an invited partner account? <strong>Sign In</strong>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
