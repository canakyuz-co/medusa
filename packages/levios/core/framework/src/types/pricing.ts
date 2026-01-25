/**
 * Price modifier type
 */
export enum PriceModifierType {
  /**
   * Fixed amount modifier
   */
  FIXED = "fixed",

  /**
   * Percentage modifier
   */
  PERCENTAGE = "percentage",

  /**
   * Multiplier modifier
   */
  MULTIPLIER = "multiplier",
}

/**
 * Price modifier definition
 */
export interface PriceModifier {
  /**
   * Modifier type
   */
  type: PriceModifierType

  /**
   * Modifier value
   */
  value: number

  /**
   * Modifier label for display
   */
  label?: string

  /**
   * Whether this modifier should compound with others
   */
  compound?: boolean
}

/**
 * Pricing context for calculations
 */
export interface PricingContext {
  /**
   * Currency code
   */
  currencyCode: string

  /**
   * Quantity
   */
  quantity?: number

  /**
   * Customer group/tier
   */
  customerGroup?: string

  /**
   * Region code
   */
  regionCode?: string

  /**
   * Additional context data
   */
  metadata?: Record<string, unknown>
}

/**
 * Price calculation input
 */
export interface PriceCalculationInput {
  /**
   * Base price (in smallest currency unit)
   */
  basePrice: number

  /**
   * Price modifiers to apply
   */
  modifiers?: PriceModifier[]

  /**
   * Pricing context
   */
  context: PricingContext
}

/**
 * Price calculation result
 */
export interface PriceCalculationResult {
  /**
   * Original base price
   */
  basePrice: number

  /**
   * Final calculated price
   */
  finalPrice: number

  /**
   * Applied modifiers with their contributions
   */
  appliedModifiers: Array<{
    modifier: PriceModifier
    contribution: number
  }>

  /**
   * Currency code
   */
  currencyCode: string
}

/**
 * Price tier for bulk/wholesale pricing
 */
export interface PriceTier {
  /**
   * Minimum quantity for this tier
   */
  minQuantity: number

  /**
   * Maximum quantity for this tier (optional)
   */
  maxQuantity?: number

  /**
   * Price per unit for this tier
   */
  unitPrice: number

  /**
   * Discount percentage compared to base price
   */
  discountPercentage?: number
}

/**
 * Interface for pricing engine
 */
export interface IPricingEngine {
  /**
   * Calculate final price with modifiers
   */
  calculatePrice(input: PriceCalculationInput): PriceCalculationResult

  /**
   * Apply a single modifier to a price
   */
  applyModifier(price: number, modifier: PriceModifier): number

  /**
   * Get price for a specific tier
   */
  getPriceTier(tiers: PriceTier[], quantity: number): PriceTier | undefined

  /**
   * Calculate tiered pricing
   */
  calculateTieredPrice(
    basePrice: number,
    tiers: PriceTier[],
    quantity: number
  ): PriceCalculationResult
}
