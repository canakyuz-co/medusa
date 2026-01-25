import {
  IIdentityValidator,
  IdentityType,
  IdentityValidationInput,
  IdentityValidationResult,
} from "@levios/framework"
import { TCKNValidationResult } from "../types"

/**
 * Turkish Citizen ID Number (TCKN) Validator
 *
 * TCKN is an 11-digit number with specific validation rules:
 * - First digit cannot be 0
 * - 10th digit = ((sum of odd positions * 7) - (sum of even positions)) mod 10
 * - 11th digit = (sum of first 10 digits) mod 10
 */
export class TCKNValidator implements IIdentityValidator {
  /**
   * Get supported identity types
   */
  getSupportedTypes(): IdentityType[] {
    return [IdentityType.PERSONAL]
  }

  /**
   * Validate an identity based on type
   */
  validate(input: IdentityValidationInput): IdentityValidationResult {
    if (input.type !== IdentityType.PERSONAL) {
      return {
        isValid: false,
        errorMessage: "Only personal identity validation is supported",
      }
    }

    return this.validatePersonalId(input.value, input.context)
  }

  /**
   * Validate a TCKN (Turkish Citizen ID Number)
   */
  validatePersonalId(
    value: string,
    _context?: Record<string, unknown>
  ): IdentityValidationResult {
    const result = this.validateTCKN(value)

    return {
      isValid: result.isValid,
      errorMessage: result.errorMessage,
      normalizedValue: result.isValid ? this.format(value, IdentityType.PERSONAL) : undefined,
      metadata: result.metadata,
    }
  }

  /**
   * Validate a business identity (VKN should be used instead)
   */
  validateBusinessId(
    _value: string,
    _context?: Record<string, unknown>
  ): IdentityValidationResult {
    return {
      isValid: false,
      errorMessage: "Use VKNValidator for business identity validation",
    }
  }

  /**
   * Format/normalize a TCKN
   */
  format(value: string, _type: IdentityType): string {
    // Remove any non-digit characters and ensure 11 digits
    return value.replace(/\D/g, "").padStart(11, "0").slice(0, 11)
  }

  /**
   * Core TCKN validation logic
   */
  private validateTCKN(tckn: string): TCKNValidationResult {
    // Remove any non-digit characters
    const cleaned = tckn.replace(/\D/g, "")

    // Check length
    if (cleaned.length !== 11) {
      return {
        isValid: false,
        errorMessage: "TCKN must be exactly 11 digits",
      }
    }

    // First digit cannot be 0
    if (cleaned[0] === "0") {
      return {
        isValid: false,
        errorMessage: "TCKN cannot start with 0",
      }
    }

    // Convert to number array
    const digits = cleaned.split("").map(Number)

    // Calculate sum of odd positions (1, 3, 5, 7, 9 - indices 0, 2, 4, 6, 8)
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]

    // Calculate sum of even positions (2, 4, 6, 8 - indices 1, 3, 5, 7)
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7]

    // Validate 10th digit
    const tenthDigitCalc = ((oddSum * 7) - evenSum) % 10
    const expectedTenth = tenthDigitCalc < 0 ? tenthDigitCalc + 10 : tenthDigitCalc

    if (digits[9] !== expectedTenth) {
      return {
        isValid: false,
        errorMessage: "Invalid TCKN checksum (10th digit)",
      }
    }

    // Validate 11th digit
    const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
    const expectedEleventh = sumFirst10 % 10

    if (digits[10] !== expectedEleventh) {
      return {
        isValid: false,
        errorMessage: "Invalid TCKN checksum (11th digit)",
      }
    }

    return {
      isValid: true,
    }
  }

  /**
   * Generate a random valid TCKN (for testing purposes)
   */
  generateRandomTCKN(): string {
    // Generate first 9 random digits (first cannot be 0)
    const digits: number[] = []
    digits.push(Math.floor(Math.random() * 9) + 1) // First digit: 1-9

    for (let i = 1; i < 9; i++) {
      digits.push(Math.floor(Math.random() * 10))
    }

    // Calculate 10th digit
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
    let tenthDigit = ((oddSum * 7) - evenSum) % 10
    if (tenthDigit < 0) tenthDigit += 10
    digits.push(tenthDigit)

    // Calculate 11th digit
    const sumFirst10 = digits.reduce((a, b) => a + b, 0)
    digits.push(sumFirst10 % 10)

    return digits.join("")
  }
}

export default TCKNValidator
