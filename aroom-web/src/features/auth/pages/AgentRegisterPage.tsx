/**
 * AgentRegisterPage.tsx
 * Pilot multi-step agent sign-up (NO OTP — manual Team Leader verification):
 *   Step 1 — Account & Contact details (full name, email, phone number, agency name, password)
 *   Step 2 — ID Verification & Coverage areas
 *   Step 3 — Application Submitted (Pending Team Leader Approval)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Building2, Upload,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, Clock, ShieldCheck,
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

const STEPS = ['Account & Phone', 'ID & Coverage', 'Pending Approval']
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

export function AgentRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  // Step 1 — Account & Phone (No OTP in pilot)
  const [fullName, setFullName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})

  // Step 2 — ID Photo & Coverage Locations
  const [idPreview, setIdPreview] = useState<string>('')
  const [idFileName, setIdFileName] = useState<string>('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [step2Error, setStep2Error] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 3) errs.fullName = 'Enter your full name (min 3 characters)'
    if (!validateEmail(email)) errs.email = 'Enter a valid email address'
    if (!validatePhone(phone)) errs.phone = 'Enter a valid Nigerian mobile number (e.g. 08012345678)'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirm) errs.confirm = 'Passwords do not match'
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

  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
    setStep2Error('')
  }

  const handleFinish = async () => {
    if (selectedLocations.length === 0) {
      setStep2Error('Select at least one campus area you cover')
      return
    }
    setSubmitting(true)
    setStep2Error('')
    try {
      await registerPartnerApplication({
        fullName,
        email,
        phoneNumber: phone,
        password,
        agentKind: 'agent',
        agencyName: agencyName || undefined,
        idCardImageUrl:
          idPreview ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        coverageAreas: selectedLocations,
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
      <PageBackground image="/images/rooms/house-02-modern.jpg" blackOverlayOpacity={52} />

      <HeroSection className="py-12 px-4 min-h-52 sm:min-h-64">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create your Agent Account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200">
            Register for our pilot team — our Team Leader will verify and approve your account so you can list properties.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-16 -mt-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
          <StepBar current={step} />

          {/* ── Step 1: Account & Phone details (No OTP) ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Agent Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  No SMS OTP required — our Team Leader will manually verify your phone and ID card.
                </p>
              </div>

              <Field label="Full Name" icon={<User className="w-4 h-4" />} error={step1Errors.fullName}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariye Briggs"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </Field>

              <Field label="Agency / Business Name (Optional)" icon={<Building2 className="w-4 h-4" />}>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Choba Campus Homes"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </Field>

              <Field label="Phone Number (WhatsApp / Call)" icon={<Phone className="w-4 h-4" />} error={step1Errors.phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </Field>

              <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={step1Errors.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tariye@agency.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </Field>

              <Field label="Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.password}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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

              <Field label="Confirm Password" icon={<Lock className="w-4 h-4" />} error={step1Errors.confirm}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </Field>

              <button
                type="button"
                onClick={() => { if (validateStep1()) setStep(1) }}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Continue to ID &amp; Coverage <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-green-600 font-semibold hover:underline cursor-pointer">
                  Log in
                </button>
              </p>
            </div>
          )}

          {/* ── Step 2: ID Photo & Coverage areas ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">ID Verification &amp; Coverage</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a valid ID card for our Team Leader to review and select the campus areas you cover.
                </p>
              </div>

              {step2Error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{step2Error}</span>
                </div>
              )}

              {/* ID Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Valid ID Card Photo (NIN, Voter's Card, Driver's License)
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-green-500 rounded-xl p-4 cursor-pointer bg-slate-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    {idFileName ? `Selected: ${idFileName}` : 'Click to upload ID card photo'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5"> Reviewed privately by the Aroom Team Leader</span>
                  <input type="file" accept="image/*" onChange={handleIdFile} className="hidden" />
                </label>
                {idPreview && (
                  <img src={idPreview} alt="ID preview" className="mt-2 h-28 w-full object-cover rounded-lg border border-slate-200" />
                )}
              </div>

              {/* Coverage Areas */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                active
                                  ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-green-400'
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

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting for Team Leader Approval…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Application for Approval</span>
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

          {/* ── Step 3: Submitted & Pending Team Leader Approval ── */}
          {step === 2 && (
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Application Sent to Team Leader!</h2>
              <p className="text-slate-600 text-sm max-w-sm mx-auto">
                Our Team Leader has been notified of your signup. Once they verify and approve your account, you will be able to publish listings on Aroom.
              </p>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/portal/status')}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  View My Approval Status <ChevronRight className="w-4 h-4" />
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
