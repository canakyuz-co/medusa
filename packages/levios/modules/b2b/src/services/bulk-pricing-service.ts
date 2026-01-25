import { PriceTierDTO, BulkPriceResult, DealerDTO } from "../types"

/**
 * Bulk pricing service for B2B pricing calculations
 */
export class BulkPricingService {
  /**
   * Calculate bulk price for a product
   */
  calculateBulkPrice(
    originalUnitPrice: number,
    quantity: number,
    priceTiers: PriceTierDTO[],
    dealer?: DealerDTO
  ): BulkPriceResult {
    // Find applicable price tier
    const applicableTier = this.getApplicablePriceTier(quantity, priceTiers)

    // Start with original price
    let unitPrice = originalUnitPrice
    let discountPercentage = 0

    // Apply tier discount
    if (applicableTier) {
      discountPercentage = applicableTier.discountPercentage
      unitPrice = Math.round(
        originalUnitPrice * (1 - discountPercentage / 100)
      )
    }

    // Apply dealer discount (additional)
    let dealerDiscount: number | undefined
    if (dealer && dealer.discountPercentage > 0) {
      dealerDiscount = dealer.discountPercentage
      unitPrice = Math.round(unitPrice * (1 - dealerDiscount / 100))
    }

    const totalPrice = unitPrice * quantity

    return {
      unitPrice,
      originalUnitPrice,
      discountPercentage: discountPercentage + (dealerDiscount || 0),
      quantity,
      totalPrice,
      appliedTier: applicableTier,
      dealerDiscount,
    }
  }

  /**
   * Get applicable price tier for a quantity
   */
  getApplicablePriceTier(
    quantity: number,
    priceTiers: PriceTierDTO[]
  ): PriceTierDTO | undefined {
    // Filter active tiers and sort by min quantity descending
    const activeTiers = priceTiers
      .filter((t) => t.isActive)
      .sort((a, b) => b.minQuantity - a.minQuantity)

    // Find the tier with the highest min quantity that the order qualifies for
    return activeTiers.find((tier) => {
      const meetsMin = quantity >= tier.minQuantity
      const meetsMax = tier.maxQuantity ? quantity <= tier.maxQuantity : true
      return meetsMin && meetsMax
    })
  }

  /**
   * Get all applicable discounts for display
   */
  getDiscountBreakdown(
    originalPrice: number,
    result: BulkPriceResult
  ): Array<{ label: string; amount: number; percentage: number }> {
    const breakdown: Array<{ label: string; amount: number; percentage: number }> = []

    if (result.appliedTier) {
      const tierDiscount = Math.round(
        originalPrice * (result.appliedTier.discountPercentage / 100)
      )
      breakdown.push({
        label: `Bulk discount (${result.appliedTier.name})`,
        amount: tierDiscount * result.quantity,
        percentage: result.appliedTier.discountPercentage,
      })
    }

    if (result.dealerDiscount) {
      const dealerDiscountAmount = Math.round(
        (originalPrice -
          (result.appliedTier
            ? originalPrice * (1 - result.appliedTier.discountPercentage / 100)
            : originalPrice)) *
          (result.dealerDiscount / 100)
      )
      breakdown.push({
        label: "Dealer discount",
        amount: dealerDiscountAmount * result.quantity,
        percentage: result.dealerDiscount,
      })
    }

    return breakdown
  }

  /**
   * Suggest optimal quantity for better pricing
   */
  suggestOptimalQuantity(
    currentQuantity: number,
    priceTiers: PriceTierDTO[]
  ): { quantity: number; savings: number; tier: PriceTierDTO } | null {
    const activeTiers = priceTiers
      .filter((t) => t.isActive && t.minQuantity > currentQuantity)
      .sort((a, b) => a.minQuantity - b.minQuantity)

    if (activeTiers.length === 0) {
      return null
    }

    const nextTier = activeTiers[0]
    const additionalUnits = nextTier.minQuantity - currentQuantity

    // Only suggest if the increase is reasonable (less than 50% more)
    if (additionalUnits / currentQuantity > 0.5) {
      return null
    }

    return {
      quantity: nextTier.minQuantity,
      savings: nextTier.discountPercentage,
      tier: nextTier,
    }
  }
}

export default BulkPricingService
