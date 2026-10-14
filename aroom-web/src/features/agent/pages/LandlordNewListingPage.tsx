import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CAMPUSES } from '@/lib/campuses'
import { Calculator, Camera, CheckCircle2 } from 'lucide-react'

const LANDLORD_ROOM_TYPES = [
  { value: 'self_contain', label: 'Self Contain' },
  { value: 'single_room', label: 'Single Student Room' },
  { value: 'flat_2bed', label: '2-Bedroom Flat' },
  { value: 'flat_3bed', label: '3-Bedroom Flat' },
  { value: 'full_lodge', label: 'Entire Student Lodge / Hostel' },
]

export function LandlordNewListingPage() {
  const [step, setStep] = useState(1)

  // Property Details
  const [campusId, setCampusId] = useState('uniport')
  const [roomType, setRoomType] = useState('self_contain')
  const [lodgeName, setLodgeName] = useState('')
  const [landmark, setLandmark] = useState('')

  // Landlord Fee Items (Direct from landlord — No agency fee required!)
  const [rent, setRent] = useState<string>('280000')
  const [cautionFee, setCautionFee] = useState<string>('25000')
  const [legalFee, setLegalFee] = useState<string>('15000')
  const [utilityFee, setUtilityFee] = useState<string>('10000')
  const [hasUtilities, setHasUtilities] = useState(true)

  const rentNum = Number(rent) || 0
  const cautionNum = Number(cautionFee) || 0
  const legalNum = Number(legalFee) || 0
  const utilityNum = hasUtilities ? (Number(utilityFee) || 0) : 0

  // Direct Landlord package sum
  const totalPackage = rentNum + cautionNum + legalNum + utilityNum

  const selectedCampus = CAMPUSES.find((c) => c.id === campusId)

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full transition-all ${
              n <= step ? 'bg-amber-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
        
        {/* ── STEP 1: Landlord Property Details & Cost Breakdown ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Direct Landlord Listing
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1.5">
                Post Property &amp; Set Rent
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                List directly as the property owner. Rent, caution, legal, and utilities will be combined into a transparent move-in sum.
              </p>
            </div>

            {/* Target Campus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nearest University Campus
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-amber-500 bg-slate-50 font-medium"
              >
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Lodge / Building Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lodge / Compound Name (Optional)
              </label>
              <input
                type="text"
                value={lodgeName}
                onChange={(e) => setLodgeName(e.target.value)}
                placeholder="e.g. Grace Villa / Winners Lodge"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-amber-500"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Property / Unit Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LANDLORD_ROOM_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setRoomType(t.value)}
                    className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                      roomType === t.value
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exact Street / Campus Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Alakahia back gate, beside Market square"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-amber-500"
              />
            </div>

            {/* ── Landlord Fees Breakdown ── */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-600" />
                Landlord Fee Schedule
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Rent */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Annual Rent (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder="280000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>

                {/* 2. Caution Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caution Deposit (₦)
                  </label>
                  <input
                    type="number"
                    value={cautionFee}
                    onChange={(e) => setCautionFee(e.target.value)}
                    placeholder="25000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>

                {/* 3. Legal Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Legal &amp; Tenancy Agreement (₦)
                  </label>
                  <input
                    type="number"
                    value={legalFee}
                    onChange={(e) => setLegalFee(e.target.value)}
                    placeholder="15000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>

                {/* 4. Utilities Fee */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasUtilities}
                        onChange={(e) => setHasUtilities(e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-600 rounded cursor-pointer"
                      />
                      <span>Utilities Fee</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Water &amp; Waste</span>
                  </div>
                  {hasUtilities && (
                    <input
                      type="number"
                      value={utilityFee}
                      onChange={(e) => setUtilityFee(e.target.value)}
                      placeholder="10000"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-amber-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ── Direct Landlord Total Sum Card ── */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
                  Landlord Total Move-In Sum
                </span>
                <span className="text-[11px] text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded-full">
                  Zero Agency Fee (Direct Owner)
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Base Rent:</span>
                  <span className="font-semibold text-white">₦{rentNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caution Deposit:</span>
                  <span className="font-semibold text-white">₦{cautionNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Legal &amp; Tenancy Agreement:</span>
                  <span className="font-semibold text-white">₦{legalNum.toLocaleString()}</span>
                </div>
                {hasUtilities && (
                  <div className="flex justify-between">
                    <span>Utilities Fee:</span>
                    <span className="font-semibold text-white">₦{utilityNum.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-amber-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Package Payable</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                    ₦{totalPackage.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] text-amber-200 bg-amber-900/40 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  Direct From Landlord
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Next: Property Photos
            </button>
          </div>
        )}

        {/* ── STEP 2: Photos ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Property Photos</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload clear photos of the room, entrance gate, and facilities to build trust with student tenants.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2 hover:border-amber-500 hover:bg-amber-50/20 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Click to upload photos</p>
              <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
              <input type="file" multiple accept="image/*" className="hidden" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
              <p><strong>Campus:</strong> {selectedCampus?.name || 'Selected Campus'}</p>
              <p><strong>Property:</strong> {lodgeName || roomType}</p>
              <p><strong>Total Package:</strong> <span className="font-bold text-amber-800">₦{totalPackage.toLocaleString()}</span> (Rent ₦{rentNum.toLocaleString()})</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Publish as Landlord
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Live ── */}
        {step === 3 && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Your property is now listed!</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Students near {selectedCampus?.shortCode || 'campus'} can contact you directly without middleman cuts.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs space-y-1.5 text-amber-950">
              <p><strong>Annual Rent:</strong> ₦{rentNum.toLocaleString()}</p>
              <p><strong>Caution Fee:</strong> ₦{cautionNum.toLocaleString()}</p>
              <p><strong>Legal Fee:</strong> ₦{legalNum.toLocaleString()}</p>
              {hasUtilities && <p><strong>Utilities:</strong> ₦{utilityNum.toLocaleString()}</p>}
              <p className="pt-1 border-t border-amber-200 font-extrabold text-amber-900">
                <strong>Total Move-in Package:</strong> ₦{totalPackage.toLocaleString()}
              </p>
            </div>

            <Link
              to="/portal/dashboard"
              className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
            >
              Go to Landlord Dashboard &rarr;
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
