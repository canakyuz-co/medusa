import {
  DealerDTO,
  DealerStatus,
  DealerTier,
  CreateDealerDTO,
  UpdateDealerDTO,
} from "../types"

/**
 * Default discount percentages by tier
 */
const TIER_DISCOUNTS: Record<DealerTier, number> = {
  [DealerTier.BRONZE]: 5,
  [DealerTier.SILVER]: 10,
  [DealerTier.GOLD]: 15,
  [DealerTier.PLATINUM]: 20,
}

/**
 * Default credit limits by tier
 */
const TIER_CREDIT_LIMITS: Record<DealerTier, number> = {
  [DealerTier.BRONZE]: 500000, // $5,000
  [DealerTier.SILVER]: 1500000, // $15,000
  [DealerTier.GOLD]: 5000000, // $50,000
  [DealerTier.PLATINUM]: 20000000, // $200,000
}

/**
 * Dealer service for business logic
 */
export class DealerService {
  /**
   * Get default discount percentage for a tier
   */
  getDefaultDiscountForTier(tier: DealerTier): number {
    return TIER_DISCOUNTS[tier]
  }

  /**
   * Get default credit limit for a tier
   */
  getDefaultCreditLimitForTier(tier: DealerTier): number {
    return TIER_CREDIT_LIMITS[tier]
  }

  /**
   * Validate dealer data
   */
  validateDealerData(data: CreateDealerDTO | UpdateDealerDTO): string[] {
    const errors: string[] = []

    if ("companyName" in data && (!data.companyName || data.companyName.trim().length < 2)) {
      errors.push("Company name must be at least 2 characters")
    }

    if ("taxId" in data && data.taxId) {
      if (!/^[A-Z0-9]{8,15}$/i.test(data.taxId.replace(/[-\s]/g, ""))) {
        errors.push("Invalid tax ID format")
      }
    }

    if ("contactEmail" in data && data.contactEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
        errors.push("Invalid email format")
      }
    }

    return errors
  }

  /**
   * Check if dealer can place an order
   */
  canPlaceOrder(dealer: DealerDTO): { canPlace: boolean; reason?: string } {
    if (dealer.status !== DealerStatus.APPROVED) {
      return {
        canPlace: false,
        reason: `Dealer account is ${dealer.status}`,
      }
    }

    return { canPlace: true }
  }

  /**
   * Check if dealer has sufficient credit
   */
  hasSufficientCredit(
    dealer: DealerDTO,
    orderAmount: number
  ): { sufficient: boolean; available: number; required: number } {
    const availableCredit = dealer.creditLimit - dealer.currentBalance

    return {
      sufficient: availableCredit >= orderAmount,
      available: availableCredit,
      required: orderAmount,
    }
  }

  /**
   * Determine tier upgrade eligibility based on order history
   */
  checkTierUpgradeEligibility(
    currentTier: DealerTier,
    totalOrderAmount: number,
    orderCount: number
  ): { eligible: boolean; nextTier?: DealerTier } {
    const tierThresholds = {
      [DealerTier.BRONZE]: { amount: 0, orders: 0 },
      [DealerTier.SILVER]: { amount: 5000000, orders: 10 }, // $50,000, 10 orders
      [DealerTier.GOLD]: { amount: 25000000, orders: 50 }, // $250,000, 50 orders
      [DealerTier.PLATINUM]: { amount: 100000000, orders: 100 }, // $1,000,000, 100 orders
    }

    const tierOrder = [
      DealerTier.BRONZE,
      DealerTier.SILVER,
      DealerTier.GOLD,
      DealerTier.PLATINUM,
    ]

    const currentIndex = tierOrder.indexOf(currentTier)
    if (currentIndex === tierOrder.length - 1) {
      return { eligible: false }
    }

    const nextTier = tierOrder[currentIndex + 1]
    const threshold = tierThresholds[nextTier]

    const eligible =
      totalOrderAmount >= threshold.amount && orderCount >= threshold.orders

    return { eligible, nextTier: eligible ? nextTier : undefined }
  }
}

export default DealerService
