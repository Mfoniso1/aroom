/**
 * costCalculator.ts
 * Calculation logic for True Total Move-In Cost on Aroom listings:
 * - Agent Listings: Rent + Caution + Legal + 15% Agency Fee + Utility (No inspection fee)
 * - Landlord Listings: Rent + Caution + Legal + Utilities + 0% Agency Fee (Direct Landlord Savings)
 * Per Engineering Brief Workstream B: No per-student inspection fee exists.
 */

export interface MoveInCostBreakdown {
  annualRent: number
  agencyFee: number
  agencyRate: number // 0 for landlord, 0.15 for agent
  agreementFee: number // Legal fee
  cautionFee: number
  utilityFee: number
  totalCost: number
  uploaderType: 'agent' | 'landlord'
}

export function calculateMoveInCost(
  annualRent: number,
  customFees?: {
    agencyFee?: number
    agreementFee?: number // Legal
    legalFee?: number
    cautionFee?: number
    otherCharges?: number
    utilityFee?: number
    inspectionFee?: number
  },
  uploaderType: 'agent' | 'landlord' = 'agent'
): MoveInCostBreakdown {
  // 1. Caution Fee (Refundable Deposit)
  const cautionFee =
    customFees?.cautionFee ??
    (annualRent === 350000
      ? 25000
      : Math.max(15000, Math.round((annualRent * 0.08) / 1000) * 1000))

  // 2. Legal / Tenancy Agreement Fee
  const agreementFee =
    customFees?.legalFee ??
    customFees?.agreementFee ??
    (annualRent === 350000
      ? 20000
      : Math.max(15000, Math.round((annualRent * 0.06) / 1000) * 1000))

  // 3. Utility Fee (water, borehole, waste, gate security levy)
  const utilityFee =
    customFees?.utilityFee ??
    customFees?.otherCharges ??
    (annualRent === 350000
      ? 15000
      : Math.max(10000, Math.round((annualRent * 0.04) / 1000) * 1000))

  // 4. Agency Fee:
  // - For Landlord uploads: ₦0 (0% agency fee, saving 15% for student)
  // - For Agent uploads: 15% of annual rent (strictly capped at 15%)
  const agencyRate = uploaderType === 'landlord' ? 0 : 0.15
  const agencyFee =
    uploaderType === 'landlord'
      ? 0
      : (customFees?.agencyFee ?? Math.round(annualRent * 0.15))

  // 5. True Total Move-In Package: Base Rent + Caution + Legal + Utility + Agency
  const totalCost = annualRent + cautionFee + agreementFee + utilityFee + agencyFee

  return {
    annualRent,
    agencyFee,
    agencyRate,
    agreementFee,
    cautionFee,
    utilityFee,
    totalCost,
    uploaderType,
  }
}
