/**
 * Weight unit types
 */
export type WeightUnit = "kg" | "g" | "lb" | "oz"

/**
 * Dimension unit types
 */
export type DimensionUnit = "cm" | "m" | "in" | "ft"

/**
 * Weight conversion factors (to grams)
 */
const WEIGHT_TO_GRAMS: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
}

/**
 * Dimension conversion factors (to centimeters)
 */
const DIMENSION_TO_CM: Record<DimensionUnit, number> = {
  cm: 1,
  m: 100,
  in: 2.54,
  ft: 30.48,
}

/**
 * Package dimensions
 */
export interface PackageDimensions {
  length: number
  width: number
  height: number
  unit: DimensionUnit
}

/**
 * Package weight
 */
export interface PackageWeight {
  value: number
  unit: WeightUnit
}

/**
 * Desi calculation result (volumetric weight)
 */
export interface DesiResult {
  /**
   * Actual weight in grams
   */
  actualWeight: number

  /**
   * Volumetric weight (desi) in grams
   */
  volumetricWeight: number

  /**
   * Chargeable weight (higher of actual and volumetric)
   */
  chargeableWeight: number

  /**
   * Desi value (volume / desi factor)
   */
  desi: number
}

/**
 * Convert weight between units
 */
export function convertWeight(
  value: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): number {
  const grams = value * WEIGHT_TO_GRAMS[fromUnit]
  return grams / WEIGHT_TO_GRAMS[toUnit]
}

/**
 * Convert dimensions between units
 */
export function convertDimension(
  value: number,
  fromUnit: DimensionUnit,
  toUnit: DimensionUnit
): number {
  const cm = value * DIMENSION_TO_CM[fromUnit]
  return cm / DIMENSION_TO_CM[toUnit]
}

/**
 * Calculate volume in cubic centimeters
 */
export function calculateVolume(dimensions: PackageDimensions): number {
  const lengthCm = dimensions.length * DIMENSION_TO_CM[dimensions.unit]
  const widthCm = dimensions.width * DIMENSION_TO_CM[dimensions.unit]
  const heightCm = dimensions.height * DIMENSION_TO_CM[dimensions.unit]

  return lengthCm * widthCm * heightCm
}

/**
 * Calculate desi (volumetric weight)
 * Used by Turkish carriers for shipping cost calculation
 *
 * @param dimensions - Package dimensions
 * @param actualWeight - Actual weight
 * @param desiFactor - Desi factor (default 3000 for standard shipping, 5000 for air)
 */
export function calculateDesi(
  dimensions: PackageDimensions,
  actualWeight: PackageWeight,
  desiFactor: number = 3000
): DesiResult {
  // Calculate volume in cm³
  const volume = calculateVolume(dimensions)

  // Calculate desi value
  const desi = volume / desiFactor

  // Convert actual weight to grams
  const actualWeightGrams = actualWeight.value * WEIGHT_TO_GRAMS[actualWeight.unit]

  // Volumetric weight in grams (desi * 1000)
  const volumetricWeight = desi * 1000

  // Chargeable weight is the higher of actual and volumetric
  const chargeableWeight = Math.max(actualWeightGrams, volumetricWeight)

  return {
    actualWeight: actualWeightGrams,
    volumetricWeight,
    chargeableWeight,
    desi,
  }
}

/**
 * Calculate furniture-specific desi
 * Furniture often uses a different desi factor
 */
export function calculateFurnitureDesi(
  dimensions: PackageDimensions,
  actualWeight: PackageWeight
): DesiResult {
  // Furniture typically uses 6000 as desi factor for bulky items
  return calculateDesi(dimensions, actualWeight, 6000)
}

/**
 * Format weight for display
 */
export function formatWeight(
  weight: PackageWeight,
  locale?: string
): string {
  const formatter = new Intl.NumberFormat(locale || "en-US", {
    maximumFractionDigits: 2,
  })

  return `${formatter.format(weight.value)} ${weight.unit}`
}

/**
 * Format dimensions for display
 */
export function formatDimensions(
  dimensions: PackageDimensions,
  locale?: string
): string {
  const formatter = new Intl.NumberFormat(locale || "en-US", {
    maximumFractionDigits: 1,
  })

  return `${formatter.format(dimensions.length)} x ${formatter.format(dimensions.width)} x ${formatter.format(dimensions.height)} ${dimensions.unit}`
}
