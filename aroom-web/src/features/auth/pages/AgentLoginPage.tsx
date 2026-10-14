/**
 * AgentLoginPage.tsx
 * Simple email + password login for agents.
 * On success, redirects to /portal/dashboard.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, UserCheck } from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'

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

export function AgentLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (password.length < 6) e.password = 'Enter your password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simulated auth — replace with real API call
    await new Promise((r) => setTimeout(r, 1400))
    setLoading(false)
    // TODO: check credentials against backend; on success store token
    navigate('/portal/dashboard')
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-12 px-4 min-h-52 sm:min-h-64">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Agent Portal Login
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200">
            Sign in to manage your listings and track student enquiries.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-16 -mt-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Welcome back</h2>
              <p className="text-xs text-slate-500">Agent account login</p>
            </div>
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-5">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errors.general}
              </div>
            )}

            <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </Field>

            <Field label="Password" icon={<Lock className="w-4 h-4" />} error={errors.password}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2 text-center text-sm text-slate-500">
            <span>
              Don't have an agent account?{' '}
              <button
                onClick={() => navigate('/signup/agent')}
                className="text-green-600 font-semibold hover:underline"
              >
                Register here
              </button>
            </span>
            <button className="text-slate-400 hover:text-slate-600 text-xs">
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
