import {
  FurnitureProductConfig,
  FurnitureSelection,
  FurnitureDeliveryEstimate,
} from "../types"

/**
 * Shipping time estimates by country (from Turkey)
 */
const SHIPPING_TIMES: Record<string, { min: number; max: number }> = {
  TR: { min: 3, max: 7 },
  DE: { min: 10, max: 18 },
  FR: { min: 10, max: 18 },
  GB: { min: 12, max: 21 },
  NL: { min: 10, max: 16 },
  BE: { min: 10, max: 16 },
  AT: { min: 10, max: 16 },
  IT: { min: 10, max: 18 },
  ES: { min: 12, max: 21 },
  US: { min: 21, max: 35 },
  AE: { min: 14, max: 21 },
  SA: { min: 14, max: 21 },
  DEFAULT: { min: 21, max: 45 },
}

/**
 * Furniture delivery service
 * Estimates delivery time including production
 */
export class FurnitureDeliveryService {
  /**
   * Estimate total delivery time
   */
  estimateDelivery(
    config: FurnitureProductConfig,
    selection: FurnitureSelection,
    destinationCountry: string
  ): FurnitureDeliveryEstimate {
    // Calculate production time
    let productionDays = config.productionTime.baseDays

    // Add customization time if custom options selected
    if (!selection.dimensions.isDefault) {
      productionDays += config.productionTime.customizationDays
    }

    // Use express if selected and available
    if (
      selection.expressProduction &&
      config.productionTime.expressAvailable &&
      config.productionTime.expressDays
    ) {
      productionDays = config.productionTime.expressDays
    }

    // Get shipping time for destination
    const shippingDays =
      SHIPPING_TIMES[destinationCountry.toUpperCase()] ||
      SHIPPING_TIMES.DEFAULT

    // Calculate total
    const totalDays = {
      min: productionDays + shippingDays.min,
      max: productionDays + 3 + shippingDays.max, // 3 days buffer for production
    }

    return {
      productionDays,
      shippingDays,
      totalDays,
      displayText: this.formatDeliveryEstimate(totalDays),
    }
  }

  /**
   * Get shipping time for a destination country
   */
  getShippingTime(
    destinationCountry: string
  ): { min: number; max: number } {
    return (
      SHIPPING_TIMES[destinationCountry.toUpperCase()] ||
      SHIPPING_TIMES.DEFAULT
    )
  }

  /**
   * Format delivery estimate for display
   */
  formatDeliveryEstimate(days: { min: number; max: number }): string {
    if (days.min === days.max) {
      return `${days.min} business days`
    }
    return `${days.min}-${days.max} business days`
  }

  /**
   * Check if express delivery is worth it
   */
  isExpressWorthIt(
    config: FurnitureProductConfig,
    _selection: FurnitureSelection
  ): { savedDays: number; surchargePercent: number; recommended: boolean } {
    if (
      !config.productionTime.expressAvailable ||
      !config.productionTime.expressDays
    ) {
      return { savedDays: 0, surchargePercent: 0, recommended: false }
    }

    const normalDays =
      config.productionTime.baseDays +
      config.productionTime.customizationDays
    const savedDays = normalDays - config.productionTime.expressDays
    const surchargePercent =
      config.productionTime.expressSurchargePercent || 0

    // Recommend if saves more than 5 days and surcharge is less than 25%
    const recommended = savedDays > 5 && surchargePercent < 25

    return { savedDays, surchargePercent, recommended }
  }
}

export default FurnitureDeliveryService
