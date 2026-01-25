import {
  IPricingEngine,
  PriceCalculationInput,
  PriceCalculationResult,
  PriceModifier,
  PriceModifierType,
  PriceTier,
} from "../types/pricing"

/**
 * Default pricing engine implementation
 * Provides price calculation with modifiers and tiered pricing support
 */
export class PricingEngine implements IPricingEngine {
  /**
   * Calculate final price with modifiers
   */
  calculatePrice(input: PriceCalculationInput): PriceCalculationResult {
    const { basePrice, modifiers = [], context } = input

    let currentPrice = basePrice
    const appliedModifiers: PriceCalculationResult["appliedModifiers"] = []

    for (const modifier of modifiers) {
      const contribution = this.calculateModifierContribution(
        currentPrice,
        modifier
      )
      appliedModifiers.push({ modifier, contribution })

      if (modifier.compound) {
        currentPrice += contribution
      }
    }

    // Apply non-compound modifiers to the base price
    const nonCompoundContribution = appliedModifiers
      .filter((m) => !m.modifier.compound)
      .reduce((sum, m) => sum + m.contribution, 0)

    const compoundContribution = appliedModifiers
      .filter((m) => m.modifier.compound)
      .reduce((sum, m) => sum + m.contribution, 0)

    const finalPrice = basePrice + nonCompoundContribution + compoundContribution

    return {
      basePrice,
      finalPrice: Math.round(finalPrice),
      appliedModifiers,
      currencyCode: context.currencyCode,
    }
  }

  /**
   * Calculate the contribution of a single modifier
   */
  private calculateModifierContribution(
    price: number,
    modifier: PriceModifier
  ): number {
    switch (modifier.type) {
      case PriceModifierType.FIXED:
        return modifier.value

      case PriceModifierType.PERCENTAGE:
        return (price * modifier.value) / 100

      case PriceModifierType.MULTIPLIER:
        return price * (modifier.value - 1)

      default:
        return 0
    }
  }

  /**
   * Apply a single modifier to a price
   */
  applyModifier(price: number, modifier: PriceModifier): number {
    const contribution = this.calculateModifierContribution(price, modifier)
    return Math.round(price + contribution)
  }

  /**
   * Get price tier for a specific quantity
   */
  getPriceTier(tiers: PriceTier[], quantity: number): PriceTier | undefined {
    // Sort tiers by minQuantity descending to find the best matching tier
    const sortedTiers = [...tiers].sort(
      (a, b) => b.minQuantity - a.minQuantity
    )

    return sortedTiers.find((tier) => {
      const meetsMin = quantity >= tier.minQuantity
      const meetsMax = tier.maxQuantity ? quantity <= tier.maxQuantity : true
      return meetsMin && meetsMax
    })
  }

  /**
   * Calculate tiered pricing
   */
  calculateTieredPrice(
    basePrice: number,
    tiers: PriceTier[],
    quantity: number
  ): PriceCalculationResult {
    const tier = this.getPriceTier(tiers, quantity)

    if (!tier) {
      return {
        basePrice,
        finalPrice: basePrice,
        appliedModifiers: [],
        currencyCode: "USD",
      }
    }

    const unitPrice = tier.unitPrice
    const discountAmount = basePrice - unitPrice

    const appliedModifiers: PriceCalculationResult["appliedModifiers"] = []

    if (discountAmount !== 0) {
      appliedModifiers.push({
        modifier: {
          type: PriceModifierType.FIXED,
          value: -discountAmount,
          label: `Bulk discount (${tier.minQuantity}+ units)`,
        },
        contribution: -discountAmount,
      })
    }

    return {
      basePrice,
      finalPrice: unitPrice,
      appliedModifiers,
      currencyCode: "USD",
    }
  }
}

export default PricingEngine
