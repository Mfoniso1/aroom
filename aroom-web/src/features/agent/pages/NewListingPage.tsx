import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CAMPUSES } from '@/lib/campuses'
import { Calculator, ShieldCheck, Camera, CheckCircle2 } from 'lucide-react'

const ROOM_TYPES = [
  { value: 'self_contain', label: 'Self Contain' },
  { value: 'single_room', label: 'Single Room' },
  { value: 'flat_shared', label: 'Shared Flat' },
  { value: 'flat_entire', label: 'Entire Flat' },
]

export function NewListingPage() {
  const [step, setStep] = useState(1)

  // Core Details
  const [campusId, setCampusId] = useState('uniport')
  const [roomType, setRoomType] = useState('self_contain')
  const [landmark, setLandmark] = useState('')

  // Fee Details
  const [annualRent, setAnnualRent] = useState<string>('300000')
  const [cautionFee, setCautionFee] = useState<string>('30000')
  const [legalFee, setLegalFee] = useState<string>('20000')
  const [utilityFee, setUtilityFee] = useState<string>('15000')
  const [inspectionFee, setInspectionFee] = useState<string>('0') // 100% Free on Aroom policy
  const [hasUtilityFee, setHasUtilityFee] = useState(true)

  // Numeric computations
  const rentNum = Number(annualRent) || 0
  const cautionNum = Number(cautionFee) || 0
  const legalNum = Number(legalFee) || 0
  const utilityNum = hasUtilityFee ? (Number(utilityFee) || 0) : 0
  const inspectionNum = Number(inspectionFee) || 0

  // Agency fee: automatically 15% of the annual rent
  const agencyFee = Math.round(rentNum * 0.15)

  // Total move-in package
  const totalPackage = rentNum + cautionNum + legalNum + agencyFee + utilityNum + inspectionNum

  const selectedCampus = CAMPUSES.find((c) => c.id === campusId)

  const handleNext = () => {
    if (rentNum <= 0) return
    setStep(2)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded-full transition-all ${
              n <= step ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
        
        {/* ── STEP 1: Core Details & Detailed Move-In Package Calculation ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Agent Space Listing
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1.5">
                Property &amp; Fee Breakdown
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Enter the rent and mandatory fee items. Agency fee (15%) and the total sum package are computed automatically.
              </p>
            </div>

            {/* Target Campus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                University Campus
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 bg-slate-50 font-medium"
              >
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Room Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setRoomType(t.value)}
                    className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                      roomType === t.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
                Campus Landmark / Neighborhood
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={selectedCampus ? `e.g., Near ${selectedCampus.popularLandmarks[0] || 'Campus Gate'}` : 'Choba Gate / Alakahia'}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            {/* ── Fee Inputs ── */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Fee Breakdown &amp; Package Calculation
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Annual Rent */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Annual Rent (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={annualRent}
                    onChange={(e) => setAnnualRent(e.target.value)}
                    placeholder="300000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 2. Caution Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caution / Security Deposit (₦)
                  </label>
                  <input
                    type="number"
                    value={cautionFee}
                    onChange={(e) => setCautionFee(e.target.value)}
                    placeholder="30000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 3. Legal / Agreement Fee */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Legal &amp; Tenancy Agreement Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={legalFee}
                    onChange={(e) => setLegalFee(e.target.value)}
                    placeholder="20000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 4. Agency Fee (Calculated 15%) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Agency Fee (15%)
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Auto-calculated
                    </span>
                  </div>
                  <div className="w-full border border-emerald-200 bg-emerald-50/50 rounded-xl p-2.5 text-sm font-extrabold text-emerald-900 flex items-center justify-between">
                    <span>₦{agencyFee.toLocaleString()}</span>
                    <span className="text-[11px] text-emerald-700 font-normal">15% of annual rent</span>
                  </div>
                </div>

                {/* 5. Utility Fee (if applied) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasUtilityFee}
                        onChange={(e) => setHasUtilityFee(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                      />
                      <span>Utility / Service Charge (Water, Waste, Prepaid Meter)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  {hasUtilityFee && (
                    <input
                      type="number"
                      value={utilityFee}
                      onChange={(e) => setUtilityFee(e.target.value)}
                      placeholder="15000"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
                    />
                  )}
                </div>

                {/* 6. Inspection Fee Policy */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physical Inspection Fee (₦)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={inspectionFee}
                      onChange={(e) => setInspectionFee(e.target.value)}
                      disabled
                      className="w-32 border border-slate-200 bg-slate-100 rounded-xl p-2.5 text-sm font-bold text-slate-500 outline-none"
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Free on Aroom (Zero student inspection charge)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── AUTOMATIC TOTAL SUM PACKAGE CARD ── */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                  Total Move-In Sum Package
                </span>
                <span className="text-[11px] text-slate-300">All fees included</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Annual Rent:</span>
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
                <div className="flex justify-between text-emerald-400">
                  <span>Agency Fee (15%):</span>
                  <span className="font-bold">₦{agencyFee.toLocaleString()}</span>
                </div>
                {hasUtilityFee && (
                  <div className="flex justify-between">
                    <span>Utilities / Waste &amp; Light:</span>
                    <span className="font-semibold text-white">₦{utilityNum.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Inspection Fee:</span>
                  <span className="text-emerald-400 font-semibold">₦0 (Free)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Payable by Student</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    ₦{totalPackage.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  1st Year Package
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Next: Upload Property Photos
            </button>
          </div>
        )}

        {/* ── STEP 2: Photos ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upload Property Photos</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload clear room, bathroom, and compound photos. Physical camera photos are verified faster.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Click to select photos or take snapshot</p>
              <p className="text-xs text-slate-400">PNG, JPG up to 10MB each</p>
              <input type="file" multiple accept="image/*" className="hidden" />
            </div>

            {/* Quick summary of the package before publish */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
              <p><strong>Campus:</strong> {selectedCampus?.name || 'Selected Campus'}</p>
              <p><strong>Room:</strong> {roomType}</p>
              <p><strong>Total Move-in Package:</strong> <span className="font-bold text-emerald-700">₦{totalPackage.toLocaleString()}</span> (Rent ₦{rentNum.toLocaleString()} + 15% Agency ₦{agencyFee.toLocaleString()})</p>
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
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Publish Listing
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Complete ── */}
        {step === 3 && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Your space is now live!</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Students near {selectedCampus?.shortCode || 'campus'} can now see your listing and request free physical walkthroughs.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs space-y-1.5 text-emerald-900">
              <p><strong>Annual Rent:</strong> ₦{rentNum.toLocaleString()}</p>
              <p><strong>Total Move-in Package:</strong> ₦{totalPackage.toLocaleString()}</p>
              <p><strong>Your 15% Agency Commission:</strong> ₦{agencyFee.toLocaleString()}</p>
            </div>

            <Link
              to="/portal/dashboard"
              className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md"
            >
              Go to Agent Dashboard &rarr;
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
