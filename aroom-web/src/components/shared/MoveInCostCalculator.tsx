import { useState } from 'react'
import { calculateMoveInCost, type MoveInCostBreakdown } from '@/lib/costCalculator'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'

interface MoveInCostProps {
  rent: number
  customFees?: {
    agencyFee?: number
    agreementFee?: number
    cautionFee?: number
    otherCharges?: number
  }
  mode?: 'inline' | 'card' | 'modal'
}

export function MoveInCostCalculator({
  rent,
  customFees,
  mode = 'card',
}: MoveInCostProps) {
  const [isOpen, setIsOpen] = useState(false)
  const breakdown: MoveInCostBreakdown = calculateMoveInCost(rent, customFees)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  if (mode === 'card') {
    return (
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <span>💰</span>
            <span>{isOpen ? 'Hide Move-In Breakdown' : 'See Total Move-In Cost'}</span>
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-emerald-700" />
          ) : (
            <ChevronDown className="h-4 w-4 text-emerald-700" />
          )}
        </button>

        {isOpen && (
          <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex justify-between items-center text-slate-600">
              <span>Annual Rent</span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.annualRent.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1">
                Agency Fee <span className="text-[10px] text-slate-400">(10%)</span>
              </span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.agencyFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Agreement Fee</span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.agreementFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1">
                Caution Fee <span className="text-[10px] text-emerald-600 font-medium">(Refundable)</span>
              </span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.cautionFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Other Charges</span>
              <span className="font-semibold text-slate-800">
                ₦{breakdown.otherCharges.toLocaleString()}
              </span>
            </div>

            <div className="pt-2.5 mt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Estimated Cost</span>
              <span className="font-extrabold text-sm text-emerald-700">
                ₦{breakdown.totalCost.toLocaleString()}
              </span>
            </div>
            
            <p className="text-[10px] text-slate-400 italic pt-1 text-center">
              💡 Full upfront payment typically required before key handover.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Detail / Full page view
  return (
    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            💰
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Total Move-In Cost Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              All estimated fees required before moving in
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 text-sm bg-white p-4 rounded-lg border border-emerald-100 shadow-xs">
        <div className="flex justify-between items-center text-slate-700">
          <span>Annual Rent</span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.annualRent.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            Agency Fee <span className="text-xs text-slate-400">(10%)</span>
          </span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.agencyFee.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-700">
          <span>Agreement Fee</span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.agreementFee.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-700">
          <span className="flex items-center gap-1.5">
            Caution Fee <span className="text-xs text-emerald-600 font-medium">(Refundable)</span>
          </span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.cautionFee.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-700">
          <span>Other Charges</span>
          <span className="font-semibold text-slate-900">
            ₦{breakdown.otherCharges.toLocaleString()}
          </span>
        </div>

        <div className="pt-3 mt-2 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-900 text-base">Total Estimated Cost</span>
            <p className="text-[11px] text-slate-400">Total payable to move in</p>
          </div>
          <span className="font-extrabold text-xl text-emerald-700">
            ₦{breakdown.totalCost.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-100/60 p-2.5 rounded-md">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
        <span>Never pay these fees before physical inspection and agent identity check.</span>
      </div>
    </div>
  )
}
