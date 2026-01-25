/**
 * Delivery time unit
 */
export enum DeliveryTimeUnit {
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
}

/**
 * Delivery time estimate
 */
export interface DeliveryTimeEstimate {
  /**
   * Minimum delivery time
   */
  min: number

  /**
   * Maximum delivery time
   */
  max: number

  /**
   * Time unit
   */
  unit: DeliveryTimeUnit

  /**
   * Human-readable estimate
   */
  displayText: string
}

/**
 * Production time for made-to-order items
 */
export interface ProductionTime {
  /**
   * Base production time in days
   */
  baseDays: number

  /**
   * Additional time for customizations (in days)
   */
  customizationDays?: number

  /**
   * Express production available
   */
  expressAvailable?: boolean

  /**
   * Express production time in days
   */
  expressDays?: number

  /**
   * Express production surcharge
   */
  expressSurcharge?: number
}

/**
 * Delivery estimation input
 */
export interface DeliveryEstimationInput {
  /**
   * Origin location (warehouse/production facility)
   */
  origin: {
    city?: string
    provinceCode?: string
    postalCode?: string
    countryCode: string
  }

  /**
   * Destination location
   */
  destination: {
    city?: string
    provinceCode?: string
    postalCode?: string
    countryCode: string
  }

  /**
   * Production time (for made-to-order items)
   */
  productionTime?: ProductionTime

  /**
   * Shipping method code
   */
  shippingMethod?: string

  /**
   * Package dimensions and weight
   */
  package?: {
    weight: number
    weightUnit: "kg" | "g" | "lb" | "oz"
    length?: number
    width?: number
    height?: number
    dimensionUnit?: "cm" | "m" | "in"
  }
}

/**
 * Delivery estimation result
 */
export interface DeliveryEstimationResult {
  /**
   * Production time estimate (if applicable)
   */
  productionTime?: DeliveryTimeEstimate

  /**
   * Shipping time estimate
   */
  shippingTime: DeliveryTimeEstimate

  /**
   * Total delivery time estimate
   */
  totalTime: DeliveryTimeEstimate

  /**
   * Estimated delivery date range
   */
  estimatedDeliveryDate?: {
    earliest: Date
    latest: Date
  }

  /**
   * Shipping cost estimate (if available)
   */
  shippingCost?: {
    amount: number
    currencyCode: string
  }
}

/**
 * Interface for delivery estimator
 */
export interface IDeliveryEstimator {
  /**
   * Estimate delivery time
   */
  estimateDelivery(input: DeliveryEstimationInput): DeliveryEstimationResult

  /**
   * Calculate shipping time between locations
   */
  calculateShippingTime(
    origin: DeliveryEstimationInput["origin"],
    destination: DeliveryEstimationInput["destination"],
    method?: string
  ): DeliveryTimeEstimate

  /**
   * Calculate total delivery time including production
   */
  calculateTotalDeliveryTime(
    productionTime: ProductionTime | undefined,
    shippingTime: DeliveryTimeEstimate
  ): DeliveryTimeEstimate

  /**
   * Format delivery estimate for display
   */
  formatEstimate(estimate: DeliveryTimeEstimate, locale?: string): string
}
