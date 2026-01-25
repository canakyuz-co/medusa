/**
 * KDV (VAT) rates in Turkey
 */
export enum KDVRate {
  /**
   * Standard rate - 20%
   * Applied to most goods and services
   */
  STANDARD = 20,

  /**
   * Reduced rate - 10%
   * Applied to certain food items, transportation, etc.
   */
  REDUCED = 10,

  /**
   * Low rate - 1%
   * Applied to basic food items, newspapers, etc.
   */
  LOW = 1,
}

/**
 * KDV rate information
 */
export interface KDVRateInfo {
  rate: KDVRate
  name: string
  description: string
  applicableCategories: string[]
}

/**
 * Turkish city (il)
 */
export interface TurkishCity {
  code: string
  name: string
  plateCode: number
}

/**
 * Turkish district (ilce)
 */
export interface TurkishDistrict {
  code: string
  name: string
  cityCode: string
}

/**
 * Turkish neighborhood (mahalle)
 */
export interface TurkishNeighborhood {
  code: string
  name: string
  districtCode: string
  postalCode: string
}

/**
 * Turkish address structure
 */
export interface TurkishAddress {
  addressLine1: string
  addressLine2?: string
  neighborhood: string
  district: string
  city: string
  postalCode: string
  countryCode: "TR"
}

/**
 * TCKN validation result
 */
export interface TCKNValidationResult {
  isValid: boolean
  errorMessage?: string
  metadata?: {
    birthYear?: number
  }
}

/**
 * VKN validation result
 */
export interface VKNValidationResult {
  isValid: boolean
  errorMessage?: string
  formatted?: string
}
