import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'

const listingSchema = z.object({
  roomType: z.enum(['self_contain', 'single_room', 'flat_shared', 'flat_entire']),
  price: z.string().regex(/^\d{4,9}$/, 'Enter the annual price in naira (digits only)'),
  landmark: z.string().min(3, 'Add a landmark near the campus'),
  photos: z.custom<FileList>((v) => v instanceof FileList && v.length > 0, 'Add at least one photo'),
})
type ListingValues = z.infer<typeof listingSchema>

const ROOM_TYPES = [
  { value: 'self_contain', label: 'Self Contain' },
  { value: 'single_room', label: 'Single Room' },
  { value: 'flat_shared', label: 'Shared Flat' },
  { value: 'flat_entire', label: 'Entire Flat' },
] as const

export function NewListingPage() {
  const [step, setStep] = useState(1)
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: { roomType: 'self_contain' },
  })

  const roomType = watch('roomType')
  const price = watch('price')

  const next = async () => {
    if (await trigger(['roomType', 'price', 'landmark'])) setStep(2)
  }

  // TODO: POST /api/v1/listings — goes live immediately as "Unverified - New"
  const onSubmit = () => setStep(3)

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-green-600' : 'bg-slate-300'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        {/* Step 1 and 2 stay mounted (hidden) so field values persist */}
        <div className={step === 1 ? 'space-y-5' : 'hidden'}>
          <h1 className="text-xl font-bold text-slate-900">Core details</h1>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Room type</label>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setValue('roomType', t.value)}
                  className={`py-2.5 text-sm rounded-md border transition-colors ${
                    roomType === t.value ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual price (₦)</label>
            <input {...register('price')} inputMode="numeric" placeholder="350000" className="w-full border border-slate-200 rounded-md p-3 text-sm outline-none focus:border-green-500" />
            {price && /^\d+$/.test(price) && <p className="text-xs text-slate-500 mt-1">₦{Number(price).toLocaleString()} / year</p>}
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campus landmark</label>
            <input {...register('landmark')} placeholder="Akoka Gate, 5 mins walk" className="w-full border border-slate-200 rounded-md p-3 text-sm outline-none focus:border-green-500" />
            {errors.landmark && <p className="text-xs text-red-600 mt-1">{errors.landmark.message}</p>}
          </div>
          <button type="button" onClick={next} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md">
            Next: photos
          </button>
        </div>

        <div className={step === 2 ? 'space-y-5' : 'hidden'}>
          <h1 className="text-xl font-bold text-slate-900">Photos</h1>
          <p className="text-sm text-slate-500">Take photos at the property. Live camera shots help you get the Verified badge faster.</p>
          <input type="file" accept="image/*" capture="environment" multiple {...register('photos')} className="w-full text-sm" />
          {errors.photos && <p className="text-xs text-red-600">{String(errors.photos.message)}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="flex-1 border border-slate-300 text-slate-700 font-medium py-3 rounded-md">Back</button>
            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md">Publish</button>
          </div>
        </div>

        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="text-4xl">🎉</div>
            <h1 className="text-xl font-bold text-slate-900">Your room is live!</h1>
            <p className="text-sm text-slate-600">It is visible as <b>Unverified - New</b>. Students can see it right now.</p>
            <p className="text-sm text-slate-600">Want the Verified badge for more enquiries? Request a spot-check.</p>
            <Link to="/portal/dashboard" className="block w-full bg-slate-900 text-white font-medium py-3 rounded-md">Go to my listings</Link>
          </div>
        )}
      </form>
    </div>
  )
}
