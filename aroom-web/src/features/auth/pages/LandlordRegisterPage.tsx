/**
 * LandlordRegisterPage.tsx
 * Multi-step landlord registration form:
 *   - Quick suggestion from email to auto-fill First Name and Last Name
 *   - Phone number requirement with OTP verification
 *   - Kind of properties owned (Self-Contain, Single Rooms, Flats, Entire Compound/Hostel)
 *   - Location coverage (Choba, Alakahia, Aluu, Back of Chem, and others)
 *   - Verification & immediate onboarding
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, Phone, Home, MapPin,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, ShieldCheck, Sparkles, Building2, Check,
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

// Extract suggestions for first/last name from email (e.g. emeka.okafor@gmail.com -> Emeka Okafor)
function parseNameFromEmail(email: string): { first: string; last: string } | null {
  const localPart = email.split('@')[0]
  if (!localPart) return null
  const clean = localPart.replace(/[0-9_.-]+/g, ' ').trim()
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    return {
      first: capitalize(parts[0]),
      last: capitalize(parts[1]),
    }
  } else if (parts.length === 1 && parts[0].length >= 3) {
    return {
      first: parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase(),
      last: '',
    }
  }
  return null
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

const STEPS = ['Account & Email', 'Phone & OTP', 'Properties & Area', 'Completed']

const PROPERTY_TYPES = [
  { id: 'self_contain', label: 'Self-Contain Units', desc: 'Private kitchen and bathroom' },
  { id: 'single_rooms', label: 'Single Student Rooms', desc: 'Shared amenities / hostel style' },
  { id: 'flats', label: '2–3 Bedroom Flats', desc: 'Full apartment for students/roommates' },
  { id: 'hostel_complex', label: 'Entire Hostel / Lodge', desc: 'Multi-unit student residential building' },
  { id: 'studio', label: 'Modern Studio / Mini Flat', desc: 'Premium executive self-serviced unit' },
]

export function LandlordRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  // Step 1: Names, Email, Password + Email auto-suggest
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [suggestedName, setSuggestedName] = useState<{ first: string; last: string } | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})

  // Detect name suggestions when email changes
  useEffect(() => {
    if (email.includes('@')) {
      const parsed = parseNameFromEmail(email)
      if (parsed && (!firstName || !lastName)) {
        setSuggestedName(parsed)
      } else {
        setSuggestedName(null)
      }
    } else {
      setSuggestedName(null)
    }
  }, [email, firstName, lastName])

  const applySuggestedName = () => {
    if (suggestedName) {
      if (suggestedName.first) setFirstName(suggestedName.first)
      if (suggestedName.last) setLastName(suggestedName.last)
      setSuggestedName(null)
    }
  }

  // Step 2: Phone & OTP
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Step 3: Properties & Locations
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [approxUnits, setApproxUnits] = useState('1 - 4 units')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({})

  // ── Step 1 Validation ──
  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'Enter your first name'
    if (!lastName.trim()) errs.lastName = 'Enter your last name'
    if (!validateEmail(email)) errs.email = 'Enter a valid email address'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setStep1Errors(errs)
    return Object.keys(errs).length === 0
  }

  // ── OTP Handlers ──
  const sendOtp = async () => {
    if (!validatePhone(phone)) {
      setPhoneError('Enter a valid 11-digit Nigerian mobile number (e.g. 08012345678)')
      return
    }
    setPhoneError('')
    setOtpLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
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
    if (code.length < 6) {
      setOtpError('Please enter the complete 6-digit verification code')
      return
    }
    setOtpError('')
    setOtpVerified(true)
  }

  // ── Property & Location Handlers ──
  const togglePropertyType = (id: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  const validateStep3 = () => {
    const errs: Record<string, string> = {}
    if (selectedPropertyTypes.length === 0) errs.properties = 'Select at least one property type you own'
    if (selectedLocations.length === 0) errs.locations = 'Select at least one location where your property is situated'
    setStep3Errors(errs)
    return Object.keys(errs).length === 0
  }

  const handleFinish = () => {
    if (validateStep3()) {
      setStep(3)
    }
  }

  const pw = passwordStrength(password)

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-12 px-4 min-h-52 sm:min-h-60">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" /> Direct Landlord Onboarding
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Register as a Verified Landlord
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200">
            List your campus lodge or apartment, receive direct verified student requests, and eliminate fake middlemen.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-16 -mt-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((label, i) => {
              const done = i < step
              const active = i === step
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done ? 'bg-amber-600 text-white' : active ? 'bg-amber-500 text-white ring-4 ring-amber-100' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {done ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:inline ${
                      active ? 'text-amber-800 font-bold' : done ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 w-6 sm:w-10 mb-3 sm:mb-4 rounded ${done ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── STEP 0: Account & Email with Auto Suggestion ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal & Account Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Start with your email to quickly auto-suggest your name details.</p>
              </div>

              {/* Email with suggestion banner */}
              <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={step1Errors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. emeka.okafor@gmail.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </Field>

              {/* Quick suggestion banner if name extracted */}
              {suggestedName && (suggestedName.first || suggestedName.last) && (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Detected name: <strong>{suggestedName.first} {suggestedName.last}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={applySuggestedName}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Use name
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" icon={<User className="w-4 h-4" />} error={step1Errors.firstName}>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Emeka"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </Field>

                <Field label="Last Name" icon={<User className="w-4 h-4" />} error={step1Errors.lastName}>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Okafor"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </Field>
              </div>

              {/* Password */}
              <Field label="Create Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.password}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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

              {password.length > 0 && (
                <div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`flex-1 rounded-full transition-all ${pw.score >= n ? pw.color : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  {pw.label && <p className="text-xs text-slate-500 mt-1">Strength: <span className="font-semibold">{pw.label}</span></p>}
                </div>
              )}

              <Field label="Confirm Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.confirmPassword}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </Field>

              <button
                type="button"
                onClick={() => { if (validateStep1()) setStep(1) }}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Proceed to Phone Verification <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-slate-500">
                Already registered as a landlord or agent?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-amber-700 font-semibold hover:underline">
                  Log in here
                </button>
              </p>
            </div>
          )}

          {/* ── STEP 1: Phone & OTP ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Phone Verification (OTP)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified landlord phone numbers ensure safe transactions and prevent impersonation.
                </p>
              </div>

              <Field label="Phone Number" icon={<Phone className="w-4 h-4" />} error={phoneError}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08023456789"
                  disabled={otpSent}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </Field>

              {!otpSent && (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading}
                  className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  {otpLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending verification code…</> : 'Send 6-Digit OTP'}
                </button>
              )}

              {otpSent && !otpVerified && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600 text-center">
                    Enter the 6-digit code sent via SMS to <strong>{phone}</strong>
                  </p>

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
                        className="w-11 h-13 text-center text-xl font-bold border-2 border-slate-200 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-xs text-red-600 text-center flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />{otpError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4" /> Confirm &amp; Verify Code
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(['','','','','','']); setOtpError('') }}
                    className="w-full text-xs text-slate-500 hover:text-slate-800 underline text-center cursor-pointer"
                  >
                    Change phone number or resend
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    Phone number verified! Direct student inspection requests will reach this line.
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Continue to Property Information <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 py-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Account Details
              </button>
            </div>
          )}

          {/* ── STEP 2: Properties Owned & Locations ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Property &amp; Location Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tell us what kind of properties you own and where they are located.</p>
              </div>

              {/* Property types */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  What kind of properties do you own?
                </label>
                {step3Errors.properties && (
                  <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{step3Errors.properties}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PROPERTY_TYPES.map((pt) => {
                    const active = selectedPropertyTypes.includes(pt.id)
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => togglePropertyType(pt.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                          active
                            ? 'border-amber-600 bg-amber-50/70 text-amber-950 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm flex items-center gap-1.5">
                            <Home className="w-3.5 h-3.5 text-amber-600" /> {pt.label}
                          </span>
                          {active && <Check className="w-4 h-4 text-amber-700 stroke-[3]" />}
                        </div>
                        <span className="text-xs text-slate-500">{pt.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Approximate unit size */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Estimated number of rooms/units available
                </label>
                <select
                  value={approxUnits}
                  onChange={(e) => setApproxUnits(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="1 - 2 units">1 – 2 units</option>
                  <option value="3 - 6 units">3 – 6 units</option>
                  <option value="7 - 15 units">7 – 15 units (Full Lodge)</option>
                  <option value="16+ units">16+ units (Large Student Hostel)</option>
                </select>
              </div>

              {/* Locations covered */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    Where is your property located?
                  </label>
                  <span className="text-xs text-amber-700 font-semibold">
                    {selectedLocations.length} selected
                  </span>
                </div>
                {step3Errors.locations && (
                  <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{step3Errors.locations}
                  </p>
                )}
                <div className="max-h-60 overflow-y-auto space-y-3 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  {LOCATION_CAMPUS_GROUPS.map((campus) => {
                    const locs = AGENT_LOCATIONS.filter((l) => l.campus === campus)
                    return (
                      <div key={campus}>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">{campus} Area</p>
                        <div className="flex flex-wrap gap-1.5">
                          {locs.map((loc) => {
                            const isPicked = selectedLocations.includes(loc.id)
                            return (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => toggleLocation(loc.id)}
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                                  isPicked
                                    ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-800'
                                }`}
                              >
                                <MapPin className="w-3 h-3" />
                                {loc.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Complete Registration <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 py-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Phone Step
              </button>
            </div>
          )}

          {/* ── STEP 3: Complete / Success ── */}
          {step === 3 && (
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Welcome, {firstName || 'Landlord'}!
              </h2>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                Your landlord profile has been registered. You can now access your dashboard to post listings, set inspection availability, and view student inquiries.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1 text-slate-600">
                <p><strong>Registered Email:</strong> {email}</p>
                <p><strong>Verified Phone:</strong> {phone}</p>
                <p><strong>Properties:</strong> {selectedPropertyTypes.join(', ')} ({approxUnits})</p>
                <p><strong>Locations:</strong> {selectedLocations.join(', ')}</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/portal/dashboard')}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Go to Landlord Dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
