import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  BadgeCheck,
  Camera,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { PageBackground } from '@/components/shared/PageBackground'
import { HeroSection } from '@/components/shared/HeroSection'
import { CAMPUSES } from '@/lib/campuses'

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  fullName: string
  email: string
  phone: string
  campus: string
  matricNumber: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  campus?: string
  matricNumber?: string
  password?: string
  confirmPassword?: string
  agreeToTerms?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string) {
  // Nigerian mobile: 070/080/081/090/091 + 8 digits
  return /^(0[789][01])\d{8}$/.test(phone.replace(/\s/g, ''))
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: '', color: 'bg-slate-200' },
    { label: 'Weak', color: 'bg-red-400' },
    { label: 'Fair', color: 'bg-amber-400' },
    { label: 'Good', color: 'bg-emerald-400' },
    { label: 'Strong', color: 'bg-emerald-600' },
  ]
  return { score, ...map[score] }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InputField({
  label,
  icon,
  error,
  hint,
  children,
}: {
  label: string
  icon: React.ReactNode
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-400">{icon}</span>
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
      )}
    </div>
  )
}

const INPUT_BASE =
  'w-full pl-10 pr-4 py-3 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
const INPUT_OK = 'border-slate-200 bg-white'
const INPUT_ERR = 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'

// ─── Main Page ────────────────────────────────────────────────────────────────
export function StudentRegisterPage() {
  const navigate = useNavigate()

  // Avatar preview
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Password visibility
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Form state
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    campus: '',
    matricNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const set = (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      // Clear error on change
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email address'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!validatePhone(form.phone)) e.phone = 'Enter a valid Nigerian mobile number (e.g. 08012345678)'
    if (!form.campus) e.campus = 'Please select your university'
    if (!form.matricNumber.trim()) e.matricNumber = 'Matric / Student ID is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.agreeToTerms) e.agreeToTerms = 'You must accept the terms to continue'
    return e
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitted(true)
    // TODO: call auth API here
  }

  const strength = passwordStrength(form.password)

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Account created! 🎉</h2>
        <p className="text-slate-500 max-w-sm mb-8">
          Welcome to Aroom, <span className="font-semibold text-slate-700">{form.fullName.split(' ')[0]}</span>!
          Check your email to verify your account, then start finding your perfect room.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-8 py-3 transition-all"
        >
          Go to Homepage
        </button>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex flex-col">
      <PageBackground image="/images/rooms/room-04-bright-bedroom.jpg" blackOverlayOpacity={54} />

      {/* High-quality Hero Section - inherits unified page background with zero photo division */}
      <HeroSection className="py-12 px-4 min-h-52 sm:min-h-64">
        <div className="text-center max-w-lg mx-auto flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2 backdrop-blur-sm uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>Student Registration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create your free student account
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-200">
            Find verified, scam-free rooms near your university campus.
          </p>
        </div>
      </HeroSection>

      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Back */}
        <div className="w-full max-w-lg mb-4">
          <button
            onClick={() => navigate('/signup')}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to role selection
          </button>
        </div>

        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-8 py-8">

          {/* ── Google Sign-Up ──────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => alert('Google OAuth — coming soon! Connect your backend first.')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-semibold text-slate-700 shadow-sm mb-5"
          >
            {/* Google logo SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or fill in your details</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* ── Form ────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group w-20 h-20 rounded-full border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-100 overflow-hidden transition-all flex items-center justify-center"
                aria-label="Upload profile photo"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-slate-400">Upload photo <span className="text-slate-300">(optional)</span></p>
            </div>

            {/* Full Name */}
            <InputField label="Full Name" icon={<User className="w-4 h-4" />} error={errors.fullName}>
              <input
                type="text"
                placeholder="e.g. Chukwuemeka Obi"
                value={form.fullName}
                onChange={set('fullName')}
                className={`${INPUT_BASE} ${errors.fullName ? INPUT_ERR : INPUT_OK}`}
                autoComplete="name"
              />
            </InputField>

            {/* Email */}
            <InputField label="Email Address" icon={<Mail className="w-4 h-4" />} error={errors.email} hint="Use a personal email you check regularly">
              <input
                type="email"
                placeholder="e.g. chidi@gmail.com"
                value={form.email}
                onChange={set('email')}
                className={`${INPUT_BASE} ${errors.email ? INPUT_ERR : INPUT_OK}`}
                autoComplete="email"
              />
            </InputField>

            {/* Phone */}
            <InputField label="Phone Number" icon={<Phone className="w-4 h-4" />} error={errors.phone} hint="Nigerian mobile (070, 080, 081, 090, 091)">
              <input
                type="tel"
                placeholder="e.g. 08012345678"
                value={form.phone}
                onChange={set('phone')}
                className={`${INPUT_BASE} ${errors.phone ? INPUT_ERR : INPUT_OK}`}
                autoComplete="tel"
                maxLength={11}
              />
            </InputField>

            {/* Campus */}
            <InputField label="University / Campus" icon={<GraduationCap className="w-4 h-4" />} error={errors.campus}>
              <select
                value={form.campus}
                onChange={set('campus')}
                className={`${INPUT_BASE} appearance-none cursor-pointer ${errors.campus ? INPUT_ERR : INPUT_OK}`}
              >
                <option value="">Select your university...</option>
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </InputField>

            {/* Matric Number */}
            <InputField label="Matric / Student ID Number" icon={<BadgeCheck className="w-4 h-4" />} error={errors.matricNumber} hint="Used to verify your student status">
              <input
                type="text"
                placeholder="e.g. U2021/ENG/1234"
                value={form.matricNumber}
                onChange={set('matricNumber')}
                className={`${INPUT_BASE} ${errors.matricNumber ? INPUT_ERR : INPUT_OK} uppercase placeholder:normal-case`}
              />
            </InputField>

            {/* Password */}
            <InputField label="Password" icon={<Lock className="w-4 h-4" />} error={errors.password}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set('password')}
                className={`${INPUT_BASE} pr-10 ${errors.password ? INPUT_ERR : INPUT_OK}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </InputField>

            {/* Password strength bar */}
            {form.password && (
              <div className="-mt-3">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  strength.score <= 1 ? 'text-red-500' :
                  strength.score === 2 ? 'text-amber-500' : 'text-emerald-600'
                }`}>
                  {strength.label && `Password strength: ${strength.label}`}
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <InputField label="Confirm Password" icon={<Lock className="w-4 h-4" />} error={errors.confirmPassword}>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={`${INPUT_BASE} pr-10 ${errors.confirmPassword ? INPUT_ERR : INPUT_OK}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </InputField>

            {/* Terms */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.agreeToTerms}
                  onChange={set('agreeToTerms')}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-emerald-600 cursor-pointer shrink-0"
                />
                <span className="text-sm text-slate-600 leading-relaxed">
                  I agree to Aroom's{' '}
                  <button type="button" className="text-emerald-600 font-semibold hover:underline">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-emerald-600 font-semibold hover:underline">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl py-3.5 text-base transition-all shadow-md hover:shadow-lg mt-1"
            >
              Create Student Account
            </button>

            {/* Login redirect */}
            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
  )
}
