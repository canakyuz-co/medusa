/**
 * Identity type enumeration
 */
export enum IdentityType {
  /**
   * Personal identification number
   */
  PERSONAL = "personal",

  /**
   * Business/Tax identification number
   */
  BUSINESS = "business",

  /**
   * Passport number
   */
  PASSPORT = "passport",

  /**
   * Driver's license
   */
  DRIVERS_LICENSE = "drivers_license",
}

/**
 * Identity validation input
 */
export interface IdentityValidationInput {
  /**
   * The identity number/value to validate
   */
  value: string

  /**
   * Type of identity
   */
  type: IdentityType

  /**
   * Additional context for validation (e.g., birth year for TCKN)
   */
  context?: Record<string, unknown>
}

/**
 * Identity validation result
 */
export interface IdentityValidationResult {
  /**
   * Whether the identity is valid
   */
  isValid: boolean

  /**
   * Error message if invalid
   */
  errorMessage?: string

  /**
   * Normalized/formatted identity value
   */
  normalizedValue?: string

  /**
   * Additional metadata extracted from the identity
   */
  metadata?: Record<string, unknown>
}

/**
 * Interface for region-specific identity validators
 */
export interface IIdentityValidator {
  /**
   * Get supported identity types for the region
   */
  getSupportedTypes(): IdentityType[]

  /**
   * Validate an identity
   */
  validate(input: IdentityValidationInput): IdentityValidationResult

  /**
   * Validate a personal identity number (e.g., TCKN, SSN)
   */
  validatePersonalId(value: string, context?: Record<string, unknown>): IdentityValidationResult

  /**
   * Validate a business/tax identity number (e.g., VKN, EIN)
   */
  validateBusinessId(value: string, context?: Record<string, unknown>): IdentityValidationResult

  /**
   * Format/normalize an identity value
   */
  format(value: string, type: IdentityType): string
}
