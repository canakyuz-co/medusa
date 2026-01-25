/**
 * Tax rate definition
 */
export interface TaxRate {
  /**
   * Tax rate identifier
   */
  id: string

  /**
   * Tax rate name (e.g., "Standard VAT", "Reduced VAT")
   */
  name: string

  /**
   * Tax rate percentage (e.g., 20 for 20%)
   */
  rate: number

  /**
   * Whether this is the default tax rate for the region
   */
  isDefault: boolean

  /**
   * Tax code (e.g., "VAT_STANDARD", "VAT_REDUCED")
   */
  code: string
}

/**
 * Tax calculation input
 */
export interface TaxCalculationInput {
  /**
   * Amount to calculate tax for (in smallest currency unit)
   */
  amount: number

  /**
   * Currency code
   */
  currencyCode: string

  /**
   * Product type or category code (used to determine tax rate)
   */
  productType?: string

  /**
   * Whether the amount is inclusive of tax
   */
  isTaxInclusive?: boolean

  /**
   * Specific tax rate to apply (if not using automatic rate selection)
   */
  taxRateId?: string
}

/**
 * Tax calculation result
 */
export interface TaxCalculationResult {
  /**
   * Total tax amount (in smallest currency unit)
   */
  taxAmount: number

  /**
   * Net amount (excluding tax, in smallest currency unit)
   */
  netAmount: number

  /**
   * Gross amount (including tax, in smallest currency unit)
   */
  grossAmount: number

  /**
   * Applied tax rate
   */
  taxRate: TaxRate

  /**
   * Breakdown of tax by rate (for multiple tax rates)
   */
  breakdown?: TaxBreakdownItem[]
}

/**
 * Tax breakdown item for multiple tax rates
 */
export interface TaxBreakdownItem {
  taxRate: TaxRate
  taxableAmount: number
  taxAmount: number
}

/**
 * Interface for region-specific tax calculators
 */
export interface ITaxCalculator {
  /**
   * Get all available tax rates for the region
   */
  getTaxRates(): TaxRate[]

  /**
   * Get default tax rate for the region
   */
  getDefaultTaxRate(): TaxRate

  /**
   * Get tax rate by ID or code
   */
  getTaxRate(idOrCode: string): TaxRate | undefined

  /**
   * Get applicable tax rate for a product type
   */
  getTaxRateForProductType(productType: string): TaxRate

  /**
   * Calculate tax for an amount
   */
  calculateTax(input: TaxCalculationInput): TaxCalculationResult

  /**
   * Add tax to an amount
   */
  addTax(amount: number, taxRateIdOrCode?: string): number

  /**
   * Remove tax from an amount (when amount is tax-inclusive)
   */
  removeTax(amount: number, taxRateIdOrCode?: string): number
}
