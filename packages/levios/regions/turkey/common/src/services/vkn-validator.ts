import {
  IIdentityValidator,
  IdentityType,
  IdentityValidationInput,
  IdentityValidationResult,
} from "@levios/framework"
import { VKNValidationResult } from "../types"

/**
 * Turkish Tax ID Number (VKN - Vergi Kimlik Numarası) Validator
 *
 * VKN is a 10-digit number with specific validation rules:
 * - 10 digits
 * - Last digit is a checksum calculated from the first 9 digits
 */
export class VKNValidator implements IIdentityValidator {
  /**
   * Get supported identity types
   */
  getSupportedTypes(): IdentityType[] {
    return [IdentityType.BUSINESS]
  }

  /**
   * Validate an identity based on type
   */
  validate(input: IdentityValidationInput): IdentityValidationResult {
    if (input.type !== IdentityType.BUSINESS) {
      return {
        isValid: false,
        errorMessage: "Only business identity validation is supported",
      }
    }

    return this.validateBusinessId(input.value, input.context)
  }

  /**
   * Validate a personal ID (TCKN should be used instead)
   */
  validatePersonalId(
    _value: string,
    _context?: Record<string, unknown>
  ): IdentityValidationResult {
    return {
      isValid: false,
      errorMessage: "Use TCKNValidator for personal identity validation",
    }
  }

  /**
   * Validate a VKN (Turkish Tax ID Number)
   */
  validateBusinessId(
    value: string,
    _context?: Record<string, unknown>
  ): IdentityValidationResult {
    const result = this.validateVKN(value)

    return {
      isValid: result.isValid,
      errorMessage: result.errorMessage,
      normalizedValue: result.formatted,
    }
  }

  /**
   * Format/normalize a VKN
   */
  format(value: string, _type: IdentityType): string {
    // Remove any non-digit characters and ensure 10 digits
    return value.replace(/\D/g, "").padStart(10, "0").slice(0, 10)
  }

  /**
   * Core VKN validation logic
   */
  private validateVKN(vkn: string): VKNValidationResult {
    // Remove any non-digit characters
    const cleaned = vkn.replace(/\D/g, "")

    // Check length
    if (cleaned.length !== 10) {
      return {
        isValid: false,
        errorMessage: "VKN must be exactly 10 digits",
      }
    }

    // Convert to number array
    const digits = cleaned.split("").map(Number)

    // Calculate checksum using the VKN algorithm
    let sum = 0
    for (let i = 0; i < 9; i++) {
      const digit = digits[i]
      const position = 9 - i

      // Calculate intermediate value
      let intermediate = (digit + position) % 10
      intermediate = (intermediate * Math.pow(2, position)) % 9

      // Special case: if intermediate is 0 and original calculation was not 0
      if (intermediate === 0 && (digit + position) % 10 !== 0) {
        intermediate = 9
      }

      sum += intermediate
    }

    // Calculate expected last digit
    const expectedLastDigit = (10 - (sum % 10)) % 10

    if (digits[9] !== expectedLastDigit) {
      return {
        isValid: false,
        errorMessage: "Invalid VKN checksum",
      }
    }

    return {
      isValid: true,
      formatted: cleaned,
    }
  }

  /**
   * Generate a random valid VKN (for testing purposes)
   */
  generateRandomVKN(): string {
    // Generate first 9 random digits
    const digits: number[] = []
    for (let i = 0; i < 9; i++) {
      digits.push(Math.floor(Math.random() * 10))
    }

    // Calculate checksum
    let sum = 0
    for (let i = 0; i < 9; i++) {
      const digit = digits[i]
      const position = 9 - i

      let intermediate = (digit + position) % 10
      intermediate = (intermediate * Math.pow(2, position)) % 9

      if (intermediate === 0 && (digit + position) % 10 !== 0) {
        intermediate = 9
      }

      sum += intermediate
    }

    const lastDigit = (10 - (sum % 10)) % 10
    digits.push(lastDigit)

    return digits.join("")
  }
}

export default VKNValidator
