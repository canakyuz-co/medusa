import type { ITaxCalculator } from "./tax"
import type { IIdentityValidator } from "./identity"
import type { IAddressFormatter } from "./address"

/**
 * Configuration for a region-specific adapter
 */
export interface RegionConfig {
  /**
   * Region code (e.g., "TR", "EU", "US")
   */
  code: string

  /**
   * Region display name
   */
  name: string

  /**
   * Default currency code for the region
   */
  currencyCode: string

  /**
   * Default locale for the region
   */
  defaultLocale: string

  /**
   * Supported locales for the region
   */
  supportedLocales: string[]

  /**
   * Timezone for the region
   */
  timezone: string
}

/**
 * Interface for region-specific adapters
 * Each region package implements this interface to provide localized functionality
 */
export interface IRegionAdapter {
  /**
   * Region configuration
   */
  readonly config: RegionConfig

  /**
   * Tax calculator for the region
   */
  readonly taxCalculator: ITaxCalculator

  /**
   * Identity validator for the region (e.g., TCKN for Turkey)
   */
  readonly identityValidator: IIdentityValidator

  /**
   * Address formatter for the region
   */
  readonly addressFormatter: IAddressFormatter

  /**
   * Currency code for the region
   */
  readonly currencyCode: string
}

/**
 * Base class for region adapters
 */
export abstract class AbstractRegionAdapter implements IRegionAdapter {
  abstract readonly config: RegionConfig
  abstract readonly taxCalculator: ITaxCalculator
  abstract readonly identityValidator: IIdentityValidator
  abstract readonly addressFormatter: IAddressFormatter

  get currencyCode(): string {
    return this.config.currencyCode
  }
}
