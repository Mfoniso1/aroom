/**
 * costCalculator.ts
 * Calculation logic for Total Move-In Cost on Aroom listings:
 * - Agent Listings: Rent + Caution + Legal + 15% Agency Fee + Utility + Free Inspection (₦0)
 * - Landlord Listings: Rent + Caution + Legal + Utilities + 0% Agency Fee (Direct Landlord Savings)
 */

export interface MoveInCostBreakdown {
  annualRent: number
  agencyFee: number
  agencyRate: number // 0 for landlord, 0.15 for agent
  agreementFee: number // Legal fee
  cautionFee: number
  utilityFee: number
  inspectionFee: number
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
  // - For Agent uploads: 15% of annual rent
  const agencyRate = uploaderType === 'landlord' ? 0 : 0.15
  const agencyFee =
    uploaderType === 'landlord'
      ? 0
      : (customFees?.agencyFee ?? Math.round(annualRent * 0.15))

  // 5. Inspection Fee:
  // Aroom default: ₦0 (free). Agents can set a custom inspection fee which will be included in the total.
  const inspectionFee = customFees?.inspectionFee ?? 0

  // 6. Total Move-In Sum Package (includes inspection fee when agent sets it)
  const totalCost = annualRent + cautionFee + agreementFee + utilityFee + agencyFee + inspectionFee

  return {
    annualRent,
    agencyFee,
    agencyRate,
    agreementFee,
    cautionFee,
    utilityFee,
    inspectionFee,
    totalCost,
    uploaderType,
  }
}
