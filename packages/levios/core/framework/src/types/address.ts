/**
 * Generic address structure
 */
export interface Address {
  /**
   * First line of the address
   */
  address1: string

  /**
   * Second line of the address (optional)
   */
  address2?: string

  /**
   * City/town name
   */
  city: string

  /**
   * State/province/region name
   */
  province?: string

  /**
   * Postal/ZIP code
   */
  postalCode: string

  /**
   * Country code (ISO 3166-1 alpha-2)
   */
  countryCode: string

  /**
   * District/neighborhood (optional, used in some countries)
   */
  district?: string

  /**
   * Additional location metadata
   */
  metadata?: Record<string, unknown>
}

/**
 * Address validation result
 */
export interface AddressValidationResult {
  /**
   * Whether the address is valid
   */
  isValid: boolean

  /**
   * Validation errors by field
   */
  errors?: Record<string, string>

  /**
   * Suggestions for address corrections
   */
  suggestions?: Address[]

  /**
   * Normalized/standardized address
   */
  normalizedAddress?: Address
}

/**
 * Formatted address output options
 */
export interface AddressFormatOptions {
  /**
   * Include country name
   */
  includeCountry?: boolean

  /**
   * Use abbreviated state/province names
   */
  useAbbreviations?: boolean

  /**
   * Format style (single_line, multi_line, postal)
   */
  style?: "single_line" | "multi_line" | "postal"

  /**
   * Locale for formatting
   */
  locale?: string
}

/**
 * Interface for region-specific address formatters
 */
export interface IAddressFormatter {
  /**
   * Validate an address
   */
  validate(address: Address): AddressValidationResult

  /**
   * Format an address for display
   */
  format(address: Address, options?: AddressFormatOptions): string

  /**
   * Format an address as multiple lines
   */
  formatLines(address: Address, options?: AddressFormatOptions): string[]

  /**
   * Parse an address string into structured format
   */
  parse(addressString: string): Address | null

  /**
   * Get available provinces/states for the region
   */
  getProvinces(): Array<{ code: string; name: string }>

  /**
   * Get available cities for a province
   */
  getCities(provinceCode: string): Array<{ code: string; name: string }>

  /**
   * Get available districts for a city (if applicable)
   */
  getDistricts?(cityCode: string): Array<{ code: string; name: string }>
}
