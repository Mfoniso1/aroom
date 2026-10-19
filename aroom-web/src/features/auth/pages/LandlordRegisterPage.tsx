/**
 * LandlordRegisterPage.tsx
 * Pilot multi-step landlord sign-up (NO OTP — manual Team Leader verification):
 *   Step 1 — Account & Email (with auto-name suggestion, phone number, password)
 *   Step 2 — ID Verification & Property details
 *   Step 3 — Application Submitted (Pending Team Leader Approval)
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, Phone, Home, MapPin, Upload,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, ShieldCheck, Sparkles, Building2, Clock
} from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { AGENT_LOCATIONS, LOCATION_CAMPUS_GROUPS } from '@/lib/agentLocations'
import { registerPartnerApplication, fileToDataUrl } from '@/lib/pilotAuthStore'

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}
function validatePhone(p: string) {
  return /^(\+?234|0)[789][01]\d{8}$/.test(p.replace(/\s/g, ''))
}

function parseNameFromEmail(email: string): { first: string; last: string } | null {
  const localPart = email.split('@')[0]
  if (!localPart || localPart.length < 2) return null
  const cleaned = localPart.replace(/[0-9]+/g, '')
  const parts = cleaned.split(/[._-]+/).filter(Boolean)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  if (parts.length >= 2) {
    return { first: cap(parts[0]), last: cap(parts[1]) }
  } else if (parts.length === 1 && parts[0].length >= 3) {
    return { first: cap(parts[0]), last: '' }
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

const PROPERTY_CATEGORIES = [
  'Self Contain',
  'Single Room',
  'Mini Flat (1 Bedroom)',
  'Shared Apartment (2-3 Bed)',
  'Whole Student Hostel / Building',
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

const STEPS = ['Account & Phone', 'ID & Properties', 'Pending Approval']
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
                done ? 'bg-emerald-600 text-white' : active ? 'bg-emerald-700 text-white ring-4 ring-emerald-200' : 'bg-slate-200 text-slate-500'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-emerald-800 font-bold' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
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

export function LandlordRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  // Step 1: Names, Email, Phone, Password (No OTP in pilot)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [suggestedName, setSuggestedName] = useState<{ first: string; last: string } | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})

  // Step 2: ID Photo & Property Portfolio
  const [idPreview, setIdPreview] = useState('')
  const [idFileName, setIdFileName] = useState('')
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [approxUnits, setApproxUnits] = useState('1 - 4 units')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [step2Error, setStep2Error] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const applyEmailSuggestion = () => {
    if (!suggestedName) return
    if (!firstName && suggestedName.first) setFirstName(suggestedName.first)
    if (!lastName && suggestedName.last) setLastName(suggestedName.last)
    setSuggestedName(null)
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!firstName.trim() || firstName.trim().length < 2) errs.firstName = 'Enter your first name'
    if (!lastName.trim() || lastName.trim().length < 2) errs.lastName = 'Enter your last name'
    if (!validateEmail(email)) errs.email = 'Enter a valid email address'
    if (!validatePhone(phone)) errs.phone = 'Enter a valid Nigerian phone number (e.g. 08012345678)'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setStep1Errors(errs)
    return Object.keys(errs).length === 0
  }

  const handleIdFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIdFileName(file.name)
    const dataUrl = await fileToDataUrl(file)
    setIdPreview(dataUrl)
    setStep2Error('')
  }

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
    setStep2Error('')
  }

  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
    setStep2Error('')
  }

  const handleFinish = async () => {
    if (selectedPropertyTypes.length === 0) {
      setStep2Error('Select at least one property type you own')
      return
    }
    if (selectedLocations.length === 0) {
      setStep2Error('Select at least one campus zone where your property is located')
      return
    }
    setSubmitting(true)
    setStep2Error('')
    try {
      await registerPartnerApplication({
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email,
        phoneNumber: phone,
        password,
        agentKind: 'landlord',
        agencyName: `${lastName.trim()} Properties`,
        idCardImageUrl:
          idPreview ||
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
        coverageAreas: selectedLocations,
        propertyTypes: selectedPropertyTypes,
        approxUnits,
      })
      setStep(2)
    } catch (err: any) {
      setStep2Error(err.message || 'Could not submit application.')
    } finally {
      setSubmitting(false)
    }
  }

  const pw = passwordStrength(password)

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageBackground image="/images/rooms/house-05-villa.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-12 px-4 min-h-52 sm:min-h-64">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-300 text-xs font-bold mb-3 border border-white/20">
            <Building2 className="w-3.5 h-3.5" /> Direct Property Owner Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Register as a Verified Landlord
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200">
            List your properties directly to university students after quick verification by our Team Leader.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-16 -mt-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
          <StepBar current={step} />

          {/* ── STEP 0: Account, Email & Phone (No OTP) ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Landlord Account Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  No SMS OTP needed — our Team Leader will verify your ID and phone number directly.
                </p>
              </div>

              <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={step1Errors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. chinedu.okafor@gmail.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </Field>

              {suggestedName && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    Suggested from email: <strong>{suggestedName.first} {suggestedName.last}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={applyEmailSuggestion}
                    className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="First Name" icon={<User className="w-4 h-4" />} error={step1Errors.firstName}>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Chinedu"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </Field>

                <Field label="Last Name" icon={<User className="w-4 h-4" />} error={step1Errors.lastName}>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Okafor"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </Field>
              </div>

              <Field label="Phone Number" icon={<Phone className="w-4 h-4" />} error={step1Errors.phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </Field>

              <Field label="Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.password}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>

              {password.length > 0 && (
                <div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className={`flex-1 rounded-full ${n <= pw.score ? pw.color : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  {pw.label && <p className="text-xs text-slate-500 mt-1">Password strength: <span className="font-semibold">{pw.label}</span></p>}
                </div>
              )}

              <Field label="Confirm Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.confirmPassword}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </Field>

              <button
                type="button"
                onClick={() => { if (validateStep1()) setStep(1) }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Continue to ID &amp; Properties <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-slate-500">
                Already registered?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-emerald-700 font-semibold hover:underline cursor-pointer">
                  Log in
                </button>
              </p>
            </div>
          )}

          {/* ── STEP 1: ID Photo & Property Portfolio ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Verification ID &amp; Property Info</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your ID for our Team Leader and select the types of accommodation you own.
                </p>
              </div>

              {step2Error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{step2Error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Valid ID Card / Proof of Ownership Photo
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 cursor-pointer bg-slate-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    {idFileName ? `Selected: ${idFileName}` : 'Click to upload ID card photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleIdFile} className="hidden" />
                </label>
                {idPreview && (
                  <img src={idPreview} alt="ID preview" className="mt-2 h-28 w-full object-cover rounded-lg border border-slate-200" />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Property Types You Own
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_CATEGORIES.map((cat) => {
                    const active = selectedPropertyTypes.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => togglePropertyType(cat)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Approximate Number of Units
                </label>
                <select
                  value={approxUnits}
                  onChange={(e) => setApproxUnits(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="1 - 4 units">1 - 4 units</option>
                  <option value="5 - 10 units">5 - 10 units</option>
                  <option value="11 - 25 units">11 - 25 units</option>
                  <option value="25+ units (Full Hostel)">25+ units (Full Hostel)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campus Vicinity Where Your Property is Located
                </label>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/60">
                  {LOCATION_CAMPUS_GROUPS.map((campus) => {
                    const locs = AGENT_LOCATIONS.filter((l) => l.campus === campus)
                    return (
                      <div key={campus}>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{campus}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {locs.map((loc) => {
                            const active = selectedLocations.includes(loc.id)
                            return (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => toggleLocation(loc.id)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                  active
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400'
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
                disabled={submitting}
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting for Team Leader Approval…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Landlord Application</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}

          {/* ── STEP 2: Pending Team Leader Approval ── */}
          {step === 2 && (
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Welcome, {firstName}! Awaiting Approval
              </h2>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                Our Team Leader has been notified of your Landlord registration. Once they verify and approve your account, you can list your properties directly to students.
              </p>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/portal/status')}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Check My Approval Status <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/approvals')}
                  className="w-full py-2.5 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Open Team Leader Approval Console &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
