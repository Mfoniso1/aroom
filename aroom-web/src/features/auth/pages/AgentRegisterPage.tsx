/**
 * AgentRegisterPage.tsx
 * Multi-step agent sign-up:
 *   Step 1 — Account details (full name, email, password)
 *   Step 2 — Phone number + simulated OTP verification
 *   Step 3 — Coverage areas the agent operates in
 *   Step 4 — Success / redirect to portal dashboard
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, Phone, MapPin,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, ShieldCheck,
} from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { AGENT_LOCATIONS, LOCATION_CAMPUS_GROUPS } from '@/lib/agentLocations'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}
function validatePhone(p: string) {
  return /^(0[789][01])\d{8}$/.test(p.replace(/\s/g, ''))
}
function passwordStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const map = [
    { label: '', color: 'bg-slate-200' },
    { label: 'Weak', color: 'bg-red-400' },
    { label: 'Fair', color: 'bg-amber-400' },
    { label: 'Good', color: 'bg-emerald-400' },
    { label: 'Strong', color: 'bg-emerald-600' },
  ]
  return { score: s, ...map[s] }
}

// ─── Shared Field wrapper ─────────────────────────────────────────────────────
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

// ─── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ['Account', 'Verify Phone', 'Coverage', 'Done']
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-emerald-600 text-white' : active ? 'bg-green-600 text-white ring-4 ring-green-200' : 'bg-slate-200 text-slate-500'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-green-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 mb-4 rounded ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AgentRegisterPage() {
  const navigate = useNavigate()

  // Step state
  const [step, setStep] = useState(0)

  // Step 1 — Account
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})

  // Step 2 — Phone + OTP
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpVerified, setOtpVerified] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [otpError, setOtpError] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Step 3 — Locations
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [locationError, setLocationError] = useState('')

  // ── Step 1 validation ──
  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 3) errs.fullName = 'Enter your full name (min 3 characters)'
    if (!validateEmail(email)) errs.email = 'Enter a valid email address'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirm) errs.confirm = 'Passwords do not match'
    setStep1Errors(errs)
    return Object.keys(errs).length === 0
  }

  // ── OTP helpers ──
  const sendOtp = async () => {
    if (!validatePhone(phone)) {
      setPhoneError('Enter a valid Nigerian mobile number (e.g. 08012345678)')
      return
    }
    setPhoneError('')
    setOtpLoading(true)
    // Simulated 1.5s network delay
    await new Promise((r) => setTimeout(r, 1500))
    setOtpLoading(false)
    setOtpSent(true)
  }

  const handleOtpKey = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const verifyOtp = () => {
    const code = otp.join('')
    // Simulated: any 6-digit code passes
    if (code.length < 6) {
      setOtpError('Enter the 6-digit code sent to your phone')
      return
    }
    setOtpError('')
    setOtpVerified(true)
  }

  // ── Location toggle ──
  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
    setLocationError('')
  }

  // ── Final submit ──
  const handleFinish = () => {
    if (selectedLocations.length === 0) {
      setLocationError('Select at least one area you cover')
      return
    }
    // TODO: POST /api/v1/agents/register
    setStep(3)
  }

  const pw = passwordStrength(password)

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-12 px-4 min-h-52 sm:min-h-64">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create your Agent Account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200">
            Join Aroom as a verified agent — list properties and connect with students.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-16 -mt-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
          <StepBar current={step} />

          {/* ── Step 1: Account details ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Your account details</h2>

              <Field label="Full Name" icon={<User className="w-4 h-4" />} error={step1Errors.fullName}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Femi Adeyemi"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </Field>

              <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={step1Errors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </Field>

              <Field label="Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.password}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
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

              {/* Password strength */}
              {password.length > 0 && (
                <div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className={`flex-1 rounded-full transition-all ${pw.score >= n ? pw.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  {pw.label && <p className="text-xs text-slate-500 mt-1">Password strength: <span className="font-semibold">{pw.label}</span></p>}
                </div>
              )}

              <Field label="Confirm Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.confirm}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </Field>

              <button
                onClick={() => { if (validateStep1()) setStep(1) }}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <button onClick={() => navigate('/portal/login')} className="text-green-600 font-semibold hover:underline">
                  Log in
                </button>
              </p>
            </div>
          )}

          {/* ── Step 2: Phone + OTP ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Verify your phone number</h2>
              <p className="text-sm text-slate-500">
                We'll send a one-time code to confirm your number. This helps protect students from fake agents.
              </p>

              <Field label="Phone Number" icon={<Phone className="w-4 h-4" />} error={phoneError}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  disabled={otpSent}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </Field>

              {!otpSent && (
                <button
                  onClick={sendOtp}
                  disabled={otpLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  {otpLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</> : 'Send Verification Code'}
                </button>
              )}

              {otpSent && !otpVerified && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 text-center">
                    Enter the 6-digit code sent to <strong>{phone}</strong>
                  </p>

                  {/* OTP boxes */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpKey(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otp[i] && i > 0) {
                            otpRefs.current[i - 1]?.focus()
                          }
                        }}
                        className="w-11 h-13 text-center text-xl font-bold border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-xs text-red-600 text-center flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />{otpError}
                    </p>
                  )}

                  <button
                    onClick={verifyOtp}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" /> Verify Code
                  </button>

                  <button
                    onClick={() => { setOtpSent(false); setOtp(['','','','','','']); setOtpError('') }}
                    className="w-full text-sm text-slate-500 hover:text-slate-700 underline"
                  >
                    Change number / Resend
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    Phone verified successfully!
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep(0)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}

          {/* ── Step 3: Coverage areas ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900">Where do you operate?</h2>
              <p className="text-sm text-slate-500">
                Select all the areas you have listings in. This helps students find the right agent faster.
              </p>

              {locationError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{locationError}
                </p>
              )}

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {LOCATION_CAMPUS_GROUPS.map((campus) => {
                  const locs = AGENT_LOCATIONS.filter((l) => l.campus === campus)
                  return (
                    <div key={campus}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{campus}</p>
                      <div className="flex flex-wrap gap-2">
                        {locs.map((loc) => {
                          const active = selectedLocations.includes(loc.id)
                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => toggleLocation(loc.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                active
                                  ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700'
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              {loc.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedLocations.length > 0 && (
                <p className="text-xs text-emerald-700 font-medium">
                  ✓ {selectedLocations.length} area{selectedLocations.length > 1 ? 's' : ''} selected
                </p>
              )}

              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Create Agent Account <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 3 && (
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">You're in!</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Your agent account has been created. Go to your dashboard to create your first listing.
              </p>
              <button
                onClick={() => navigate('/portal/dashboard')}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
              >
                Go to Agent Dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
