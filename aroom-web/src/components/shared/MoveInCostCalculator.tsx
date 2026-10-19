import { useState } from 'react'
import { calculateMoveInCost, type MoveInCostBreakdown } from '@/lib/costCalculator'
import { ChevronDown, ChevronUp, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface MoveInCostProps {
  rent: number
  uploaderType?: 'agent' | 'landlord'
  customFees?: {
    agencyFee?: number
    agreementFee?: number
    legalFee?: number
    cautionFee?: number
    otherCharges?: number
    utilityFee?: number
    inspectionFee?: number
  }
  mode?: 'inline' | 'card' | 'modal'
}

export function MoveInCostCalculator({
  rent,
  uploaderType = 'agent',
  customFees,
  mode = 'card',
}: MoveInCostProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isLandlord = uploaderType === 'landlord'
  const breakdown: MoveInCostBreakdown = calculateMoveInCost(rent, customFees, uploaderType)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  if (mode === 'card') {
    return (
      <div className="mt-2.5 relative z-10" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
            isLandlord
              ? 'bg-amber-50/70 text-amber-900 hover:bg-amber-100 border-amber-200/80'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80'
          }`}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span className="text-slate-500 font-medium">Total Move-In:</span>
            <strong className={isLandlord ? 'text-amber-800 font-extrabold' : 'text-emerald-700 font-extrabold'}>
              ₦{breakdown.totalCost.toLocaleString()}
            </strong>
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 shrink-0 ml-1">
            <span>{isOpen ? 'Hide' : 'Breakdown'}</span>
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            )}
          </span>
        </button>

        {/* Floating panel — absolute so it overlays siblings, no layout shift */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1.5 p-3.5 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-xl z-20 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Annual Rent */}
            <div className="flex justify-between items-center text-slate-600">
              <span>Annual Rent</span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.annualRent.toLocaleString()}
              </span>
            </div>

            {/* Caution Fee */}
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1">
                Caution Fee{' '}
                <span className="text-[10px] text-emerald-600 font-medium">(Refundable)</span>
              </span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.cautionFee.toLocaleString()}
              </span>
            </div>

            {/* Legal Fee */}
            <div className="flex justify-between items-center text-slate-600">
              <span>Legal / Agreement Fee</span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.agreementFee.toLocaleString()}
              </span>
            </div>

            {/* Utilities Fee */}
            <div className="flex justify-between items-center text-slate-600">
              <span>Utilities (Borehole/Security/Waste)</span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.utilityFee.toLocaleString()}
              </span>
            </div>

            {/* Role-specific: landlord vs agent */}
            {isLandlord ? (
              <div className="flex justify-between items-center text-amber-800 bg-amber-50 p-1.5 rounded-lg font-medium border border-amber-200">
                <span>👑 Agency Fee (Direct Landlord)</span>
                <span className="font-extrabold text-emerald-700">
                  ₦0{' '}
                  <span className="text-[10px] uppercase font-bold text-emerald-800">
                    (Saved 15%)
                  </span>
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1">
                    Agency Fee{' '}
                    <span className="text-[10px] text-blue-600 font-bold">(15% of Rent)</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    ₦{breakdown.agencyFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Inspection Fee</span>
                  <span className="font-bold">
                    {breakdown.inspectionFee === 0
                      ? '₦0 (Free on Aroom)'
                      : `₦${breakdown.inspectionFee.toLocaleString()}`}
                  </span>
                </div>
              </>
            )}

            {/* Total */}
            <div className="pt-2 mt-1 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">
                {isLandlord ? 'Direct Landlord Total' : 'Total Move-In Package'}
              </span>
              <span
                className={`font-extrabold text-sm ${
                  isLandlord ? 'text-amber-800' : 'text-emerald-700'
                }`}
              >
                ₦{breakdown.totalCost.toLocaleString()}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 italic pt-0.5 text-center">
              {isLandlord
                ? 'Direct from property owner — zero agent commission.'
                : 'Verified agent listing with official 15% agency cap.'}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Detail / Full page inline view
  return (
    <div
      className={`border rounded-xl p-5 shadow-sm ${
        isLandlord ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-lg text-white flex items-center justify-center font-bold text-base shadow-sm ${
              isLandlord ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          >
            {isLandlord ? '👑' : '🏢'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isLandlord
                ? 'Direct Landlord Move-In Cost Breakdown'
                : 'Agent Move-In Cost Breakdown'}
            </h3>
            <p className="text-xs text-slate-500">
              {isLandlord
                ? 'Only landlord-required fees: Rent, Caution, Legal, and Utilities.'
                : 'Includes Rent, Caution, Legal, Utilities, Agency Fee, and Inspection Fee.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 text-sm bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex justify-between items-center text-slate-700">
          <span>Annual Rent</span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.annualRent.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            Caution Fee{' '}
            <span className="text-xs text-emerald-600 font-medium">(Refundable)</span>
          </span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.cautionFee.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span>Legal / Tenancy Agreement Fee</span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.agreementFee.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-700">
          <span>Utilities Fee (Borehole, Waste, Compound Security)</span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.utilityFee.toLocaleString()}
          </span>
        </div>

        {isLandlord ? (
          <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium border border-emerald-200">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Agency Fee (Direct Owner Booking)</span>
            </span>
            <span className="font-extrabold text-emerald-800">₦0 (0% Agency Fee)</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1.5">
                Agency Fee{' '}
                <span className="text-xs font-bold text-blue-600">(15% of Annual Rent)</span>
              </span>
              <span className="font-semibold text-slate-900">
                ₦{breakdown.agencyFee.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-700">
              <span>Inspection Fee</span>
              <span className="font-bold">
                {breakdown.inspectionFee === 0
                  ? '₦0 (Aroom Scam-Free Guarantee)'
                  : `₦${breakdown.inspectionFee.toLocaleString()}`}
              </span>
            </div>
          </>
        )}

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="font-bold text-slate-900">Total Move-In Sum Package</span>
          <span
            className={`font-extrabold text-base ${
              isLandlord ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            ₦{breakdown.totalCost.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          {isLandlord
            ? 'Direct landlord listing verified with property deed/NIN. Free physical walkthrough before payment.'
            : 'Verified agent listing with standard 15% agency cap. Physical walkthrough inspection before payment.'}
        </span>
      </div>
    </div>
  )
}
