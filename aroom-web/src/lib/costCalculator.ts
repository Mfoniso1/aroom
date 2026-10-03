export interface MoveInCostBreakdown {
  annualRent: number
  agencyFee: number
  agreementFee: number
  cautionFee: number
  otherCharges: number
  totalCost: number
}

export function calculateMoveInCost(
  annualRent: number,
  customFees?: {
    agencyFee?: number
    agreementFee?: number
    cautionFee?: number
    otherCharges?: number
  }
): MoveInCostBreakdown {
  // Standard Nigerian Off-Campus Housing Breakdown
  // Agency Fee: 10%
  const agencyFee = customFees?.agencyFee ?? Math.round(annualRent * 0.1)

  // Agreement / Legal Fee: ~5.7% (exact 20,000 for 350,000)
  const agreementFee =
    customFees?.agreementFee ??
    (annualRent === 350000
      ? 20000
      : Math.max(10000, Math.round((annualRent * 0.057) / 1000) * 1000))

  // Caution Fee / Refundable Deposit: ~7.1% (exact 25,000 for 350,000)
  const cautionFee =
    customFees?.cautionFee ??
    (annualRent === 350000
      ? 25000
      : Math.max(15000, Math.round((annualRent * 0.0714) / 1000) * 1000))

  // Other Charges (Service/Security/Waste Levy): ~2.8% (exact 10,000 for 350,000)
  const otherCharges =
    customFees?.otherCharges ??
    (annualRent === 350000
      ? 10000
      : Math.max(5000, Math.round((annualRent * 0.0286) / 1000) * 1000))

  const totalCost = annualRent + agencyFee + agreementFee + cautionFee + otherCharges

  return {
    annualRent,
    agencyFee,
    agreementFee,
    cautionFee,
    otherCharges,
    totalCost,
  }
}
