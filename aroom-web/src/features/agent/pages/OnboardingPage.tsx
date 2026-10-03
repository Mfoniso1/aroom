import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

const signupSchema = z.object({
  fullName: z.string().min(3, 'Enter your full name'),
  phone: z.string().regex(/^(\+234|0)\d{10}$/, 'Enter a valid Nigerian phone number'),
  idCard: z.custom<FileList>((v) => v instanceof FileList && v.length > 0, 'Upload a photo of your ID'),
})
type SignupValues = z.infer<typeof signupSchema>

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  // TODO: POST /api/v1/auth/agent/signup (multipart) once backend is wired
  const onSubmit = () => setStep('otp')

  // TODO: POST /api/v1/auth/agent/verify-otp
  const verifyOtp = () => {
    if (otp.length !== 6) return setOtpError('Enter the 6-digit code')
    navigate('/portal/dashboard')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Become a verified agent</h1>
      <p className="text-slate-500 mt-1 text-sm">Phone OTP and ID are checked once, not per listing.</p>

      <div className="bg-white mt-6 p-6 rounded-xl border border-slate-200 shadow-sm">
        {step === 'details' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input {...register('fullName')} className="w-full border border-slate-200 rounded-md p-3 text-sm outline-none focus:border-green-500" />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone number</label>
              <input {...register('phone')} placeholder="08012345678" className="w-full border border-slate-200 rounded-md p-3 text-sm outline-none focus:border-green-500" />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID card photo</label>
              <input type="file" accept="image/*" {...register('idCard')} className="w-full text-sm" />
              {errors.idCard && <p className="text-xs text-red-600 mt-1">{String(errors.idCard.message)}</p>}
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors">
              Send OTP
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">We sent a 6-digit code to your phone.</p>
            <input
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError('') }}
              inputMode="numeric"
              placeholder="000000"
              className="w-full border border-slate-200 rounded-md p-3 text-center tracking-[0.5em] text-lg outline-none focus:border-green-500"
            />
            {otpError && <p className="text-xs text-red-600">{otpError}</p>}
            <button onClick={verifyOtp} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors">
              Verify &amp; continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
