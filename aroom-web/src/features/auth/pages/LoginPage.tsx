/**
 * LoginPage.tsx
 * Standard Unified Login Portal with Automatic Role Detection:
 *   - Team Leader (admin) -> redirects to unique Team Leader Command Center (/admin)
 *   - Student -> redirects to /student/dashboard
 *   - Approved Agent -> redirects to /portal/dashboard
 *   - Approved Landlord -> redirects to /portal/landlord/dashboard
 *   - Pending / Rejected / Suspended Partner -> redirects to /portal/status
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import {
  loginPilotUser,
  getDashboardPathForSession,
} from '@/lib/pilotAuthStore'

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDemoDrawer, setShowDemoDrawer] = useState(false)
  const [errors, setErrors] = useState<{
    identifier?: string
    password?: string
    general?: string
  }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (identifier.trim().length < 3) {
      e.identifier = 'Enter your registered email address or phone number'
    }
    if (password.length < 6) {
      e.password = 'Enter your password (at least 6 characters)'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      const session = await loginPilotUser(identifier, password)
      navigate(getDashboardPathForSession(session))
    } catch (err: any) {
      setErrors({
        general: err.message || 'Sign in failed. Please check your credentials.',
      })
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (
    demoRole:
      | 'admin'
      | 'approved_agent'
      | 'approved_landlord'
      | 'pending_landlord'
      | 'student'
  ) => {
    if (demoRole === 'admin') {
      setIdentifier('teamleader@aroom.ng')
      setPassword('TeamLead@12345')
    } else if (demoRole === 'approved_agent') {
      setIdentifier('david.opubo@aroomagents.ng')
      setPassword('Agent@12345')
    } else if (demoRole === 'approved_landlord') {
      setIdentifier('emeka.nwosu@directlodge.ng')
      setPassword('Agent@12345')
    } else if (demoRole === 'pending_landlord') {
      setIdentifier('tariye.briggs@uniportagents.ng')
      setPassword('Agent@12345')
    } else {
      setIdentifier('amara.nwosu@uniport.edu.ng')
      setPassword('Student@12345')
    }
    setErrors({})
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-8 sm:py-12 px-4 min-h-0">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Unified Campus Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sign in to Aroom
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-200">
            One login for Students, Landlords, Verified Agents &amp; Team Leader.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-3.5 sm:px-4 pb-12 -mt-2">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              For Students, Verified Agents, Landlords &amp; Operations Team
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            <Field
              label="Email Address or Phone Number"
              icon={<Mail className="w-4 h-4" />}
              error={errors.identifier}
            >
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. you@example.com or 08012345678"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </Field>

            <Field
              label="Password"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password}
            >
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create Account CTA */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to Aroom?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-emerald-700 font-extrabold hover:underline cursor-pointer"
              >
                Create an Account
              </button>
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => navigate('/signup/student')}
                className="hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Student Signup
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/signup/agent')}
                className="hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Agent Application
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/signup/landlord')}
                className="hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Landlord Application
              </button>
            </div>
          </div>

          {/* Collapsible Pilot Quick-Fill Switcher */}
          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDemoDrawer((v) => !v)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Demo Accounts</span>
              </span>
              {showDemoDrawer ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showDemoDrawer && (
              <div className="px-3.5 pb-3 pt-1 border-t border-slate-200/70 space-y-2">
                <p className="text-[11px] text-slate-500">
                  Click any role below to auto-fill credentials, then press <strong>Sign In</strong>:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemo('admin')}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-indigo-950 text-indigo-100 hover:bg-indigo-900 cursor-pointer shadow-2xs"
                  >
                    Team Leader (Unique UI)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('student')}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer"
                  >
                    Student (Amara)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('approved_agent')}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-teal-100 text-teal-800 hover:bg-teal-200 cursor-pointer"
                  >
                    Verified Agent (David)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('approved_landlord')}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer"
                  >
                    Verified Landlord (Emeka)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('pending_landlord')}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 cursor-pointer"
                  >
                    Pending Agent (Tariye)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
