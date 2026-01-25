import {
  IDeliveryEstimator,
  DeliveryEstimationInput,
  DeliveryEstimationResult,
  DeliveryTimeEstimate,
  DeliveryTimeUnit,
  ProductionTime,
} from "../types/delivery"

/**
 * Default delivery estimator implementation
 * Provides delivery time estimation with production time support
 */
export class DeliveryEstimator implements IDeliveryEstimator {
  /**
   * Default shipping times by scenario (in days)
   */
  private defaultShippingTimes = {
    local: { min: 1, max: 3 },
    regional: { min: 3, max: 5 },
    national: { min: 5, max: 10 },
    international: { min: 10, max: 21 },
  }

  /**
   * Estimate delivery time
   */
  estimateDelivery(input: DeliveryEstimationInput): DeliveryEstimationResult {
    const shippingTime = this.calculateShippingTime(
      input.origin,
      input.destination,
      input.shippingMethod
    )

    const productionTimeEstimate = input.productionTime
      ? this.calculateProductionTimeEstimate(input.productionTime)
      : undefined

    const totalTime = this.calculateTotalDeliveryTime(
      input.productionTime,
      shippingTime
    )

    const now = new Date()
    const earliestDelivery = new Date(now)
    const latestDelivery = new Date(now)

    earliestDelivery.setDate(
      now.getDate() + this.convertToDays(totalTime.min, totalTime.unit)
    )
    latestDelivery.setDate(
      now.getDate() + this.convertToDays(totalTime.max, totalTime.unit)
    )

    return {
      productionTime: productionTimeEstimate,
      shippingTime,
      totalTime,
      estimatedDeliveryDate: {
        earliest: earliestDelivery,
        latest: latestDelivery,
      },
    }
  }

  /**
   * Calculate production time estimate
   */
  private calculateProductionTimeEstimate(
    production: ProductionTime
  ): DeliveryTimeEstimate {
    const totalDays =
      production.baseDays + (production.customizationDays || 0)

    return {
      min: totalDays,
      max: totalDays + 2, // Allow 2 days buffer
      unit: DeliveryTimeUnit.DAYS,
      displayText: this.formatDays(totalDays, totalDays + 2),
    }
  }

  /**
   * Calculate shipping time between locations
   */
  calculateShippingTime(
    origin: DeliveryEstimationInput["origin"],
    destination: DeliveryEstimationInput["destination"],
    method?: string
  ): DeliveryTimeEstimate {
    // Determine shipping scenario
    const scenario = this.determineShippingScenario(origin, destination)
    const times = this.defaultShippingTimes[scenario]

    // Apply method modifiers
    let { min, max } = times
    if (method === "express") {
      min = Math.max(1, Math.floor(min / 2))
      max = Math.max(2, Math.floor(max / 2))
    } else if (method === "economy") {
      min = min + 2
      max = max + 5
    }

    return {
      min,
      max,
      unit: DeliveryTimeUnit.DAYS,
      displayText: this.formatDays(min, max),
    }
  }

  /**
   * Determine shipping scenario based on origin and destination
   */
  private determineShippingScenario(
    origin: DeliveryEstimationInput["origin"],
    destination: DeliveryEstimationInput["destination"]
  ): "local" | "regional" | "national" | "international" {
    if (origin.countryCode !== destination.countryCode) {
      return "international"
    }

    if (origin.provinceCode === destination.provinceCode) {
      if (origin.city === destination.city) {
        return "local"
      }
      return "regional"
    }

    return "national"
  }

  /**
   * Calculate total delivery time including production
   */
  calculateTotalDeliveryTime(
    productionTime: ProductionTime | undefined,
    shippingTime: DeliveryTimeEstimate
  ): DeliveryTimeEstimate {
    if (!productionTime) {
      return shippingTime
    }

    const productionDays =
      productionTime.baseDays + (productionTime.customizationDays || 0)

    const minShippingDays = this.convertToDays(shippingTime.min, shippingTime.unit)
    const maxShippingDays = this.convertToDays(shippingTime.max, shippingTime.unit)

    const totalMin = productionDays + minShippingDays
    const totalMax = productionDays + 2 + maxShippingDays // 2 days buffer for production

    return {
      min: totalMin,
      max: totalMax,
      unit: DeliveryTimeUnit.DAYS,
      displayText: this.formatDays(totalMin, totalMax),
    }
  }

  /**
   * Format delivery estimate for display
   */
  formatEstimate(estimate: DeliveryTimeEstimate, locale?: string): string {
    return estimate.displayText
  }

  /**
   * Format days range for display
   */
  private formatDays(min: number, max: number): string {
    if (min === max) {
      return `${min} ${min === 1 ? "day" : "days"}`
    }
    return `${min}-${max} days`
  }

  /**
   * Convert time to days
   */
  private convertToDays(value: number, unit: DeliveryTimeUnit): number {
    switch (unit) {
      case DeliveryTimeUnit.HOURS:
        return Math.ceil(value / 24)
      case DeliveryTimeUnit.WEEKS:
        return value * 7
      case DeliveryTimeUnit.DAYS:
      default:
        return value
    }
  }
}

export default DeliveryEstimator
