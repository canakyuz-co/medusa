import {
  AbstractRegionAdapter,
  RegionConfig,
  ITaxCalculator,
  IIdentityValidator,
  IAddressFormatter,
  IdentityType,
  IdentityValidationInput,
  IdentityValidationResult,
} from "@levios/framework"
import { KDVCalculator } from "../services/kdv-calculator"
import { TCKNValidator } from "../services/tckn-validator"
import { VKNValidator } from "../services/vkn-validator"
import { TurkishAddressFormatter } from "../services/turkish-address-formatter"

/**
 * Turkey region configuration
 */
const TURKEY_CONFIG: RegionConfig = {
  code: "TR",
  name: "Turkiye",
  currencyCode: "TRY",
  defaultLocale: "tr-TR",
  supportedLocales: ["tr-TR", "en-US"],
  timezone: "Europe/Istanbul",
}

/**
 * Combined identity validator for Turkey
 * Delegates to TCKN or VKN validator based on identity type
 */
class TurkeyIdentityValidator implements IIdentityValidator {
  private tcknValidator: TCKNValidator
  private vknValidator: VKNValidator

  constructor() {
    this.tcknValidator = new TCKNValidator()
    this.vknValidator = new VKNValidator()
  }

  getSupportedTypes(): IdentityType[] {
    return [IdentityType.PERSONAL, IdentityType.BUSINESS]
  }

  validate(input: IdentityValidationInput): IdentityValidationResult {
    if (input.type === IdentityType.PERSONAL) {
      return this.tcknValidator.validate(input)
    } else if (input.type === IdentityType.BUSINESS) {
      return this.vknValidator.validate(input)
    }

    return {
      isValid: false,
      errorMessage: `Unsupported identity type: ${input.type}`,
    }
  }

  validatePersonalId(
    value: string,
    context?: Record<string, unknown>
  ): IdentityValidationResult {
    return this.tcknValidator.validatePersonalId(value, context)
  }

  validateBusinessId(
    value: string,
    context?: Record<string, unknown>
  ): IdentityValidationResult {
    return this.vknValidator.validateBusinessId(value, context)
  }

  format(value: string, type: IdentityType): string {
    if (type === IdentityType.PERSONAL) {
      return this.tcknValidator.format(value, type)
    }
    return this.vknValidator.format(value, type)
  }
}

/**
 * Turkey Region Adapter
 * Implements all Turkey-specific functionality for the Levios platform
 */
export class TurkeyRegionAdapter extends AbstractRegionAdapter {
  readonly config: RegionConfig = TURKEY_CONFIG
  readonly taxCalculator: ITaxCalculator
  readonly identityValidator: IIdentityValidator
  readonly addressFormatter: IAddressFormatter

  constructor() {
    super()
    this.taxCalculator = new KDVCalculator()
    this.identityValidator = new TurkeyIdentityValidator()
    this.addressFormatter = new TurkishAddressFormatter()
  }

  /**
   * Validate a TCKN (convenience method)
   */
  validateTCKN(value: string): IdentityValidationResult {
    return this.identityValidator.validatePersonalId(value)
  }

  /**
   * Validate a VKN (convenience method)
   */
  validateVKN(value: string): IdentityValidationResult {
    return this.identityValidator.validateBusinessId(value)
  }

  /**
   * Calculate KDV for an amount (convenience method)
   */
  calculateKDV(
    amount: number,
    isTaxInclusive: boolean = false,
    productType?: string
  ): { netAmount: number; taxAmount: number; grossAmount: number } {
    const result = this.taxCalculator.calculateTax({
      amount,
      currencyCode: "TRY",
      isTaxInclusive,
      productType,
    })

    return {
      netAmount: result.netAmount,
      taxAmount: result.taxAmount,
      grossAmount: result.grossAmount,
    }
  }
}

export default TurkeyRegionAdapter
