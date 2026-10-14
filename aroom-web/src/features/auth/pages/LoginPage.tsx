/**
 * LoginPage.tsx
 * Unified login portal for:
 *   - Students -> redirects to /student/dashboard
 *   - Agents -> redirects to /portal/dashboard
 *   - Landlords -> redirects to /portal/dashboard
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, UserCheck, Building2,
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ChevronRight
} from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'

type Role = 'student' | 'agent' | 'landlord'

interface RoleTab {
  id: Role
  label: string
  icon: React.ReactNode
  destination: string
  subtext: string
}

const ROLES: RoleTab[] = [
  {
    id: 'student',
    label: 'Student',
    icon: <GraduationCap className="w-5 h-5" />,
    destination: '/student/dashboard',
    subtext: 'Access saved campus rooms & scheduled inspections',
  },
  {
    id: 'agent',
    label: 'Agent',
    icon: <UserCheck className="w-5 h-5" />,
    destination: '/portal/dashboard',
    subtext: 'Manage property listings & student inquiries',
  },
  {
    id: 'landlord',
    label: 'Landlord',
    icon: <Building2 className="w-5 h-5" />,
    destination: '/portal/landlord/dashboard',
    subtext: 'Manage owned properties & direct zero-agency listings',
  },
]

function Field({
  label, icon, error, children,
}: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (password.length < 6) e.password = 'Enter your password (at least 6 characters)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simulated authentication delay
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)

    const targetRole = ROLES.find((r) => r.id === role)
    if (targetRole) {
      navigate(targetRole.destination)
    }
  }

  const currentRoleConfig = ROLES.find((r) => r.id === role)!

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-12 px-4 min-h-52 sm:min-h-60">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Log in to Aroom
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200">
            Sign in to access your personal dashboard and manage your accommodations.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-16 -mt-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8">
          
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Your Account Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const isSelected = role === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white'
                    }`}
                  >
                    {r.icon}
                    <span>{r.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              {currentRoleConfig.subtext}
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errors.general}
              </div>
            )}

            <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'e.g. name@uniport.edu.ng' : 'e.g. you@example.com'}
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </Field>

            <Field label="Password" icon={<Lock className="w-4 h-4" />} error={errors.password}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in to {currentRoleConfig.label} Portal…</span>
                </>
              ) : (
                <>
                  <span>Log in as {currentRoleConfig.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sign Up Links based on selected role */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
            <p>
              Don't have an account yet?{' '}
              {role === 'student' && (
                <button
                  type="button"
                  onClick={() => navigate('/signup/student')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Register as Student
                </button>
              )}
              {role === 'agent' && (
                <button
                  type="button"
                  onClick={() => navigate('/signup/agent')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Register as Agent
                </button>
              )}
              {role === 'landlord' && (
                <button
                  type="button"
                  onClick={() => navigate('/signup/landlord')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Register as Landlord
                </button>
              )}
            </p>
            <p>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                View all account options
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
