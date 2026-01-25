import {
  ITaxCalculator,
  TaxRate,
  TaxCalculationInput,
  TaxCalculationResult,
} from "@levios/framework"
import { KDVRate, KDVRateInfo } from "../types"

/**
 * KDV rate definitions
 */
const KDV_RATES: TaxRate[] = [
  {
    id: "kdv_standard",
    name: "KDV Standard",
    rate: KDVRate.STANDARD,
    isDefault: true,
    code: "KDV_20",
  },
  {
    id: "kdv_reduced",
    name: "KDV Reduced",
    rate: KDVRate.REDUCED,
    isDefault: false,
    code: "KDV_10",
  },
  {
    id: "kdv_low",
    name: "KDV Low",
    rate: KDVRate.LOW,
    isDefault: false,
    code: "KDV_1",
  },
]

/**
 * Product type to KDV rate mapping
 */
const PRODUCT_TYPE_TAX_MAP: Record<string, string> = {
  // Standard rate (20%)
  electronics: "KDV_20",
  furniture: "KDV_20",
  clothing: "KDV_20",
  cosmetics: "KDV_20",
  automotive: "KDV_20",

  // Reduced rate (10%)
  food_processed: "KDV_10",
  restaurant: "KDV_10",
  hotel: "KDV_10",
  transportation: "KDV_10",
  medical_equipment: "KDV_10",

  // Low rate (1%)
  food_basic: "KDV_1",
  newspaper: "KDV_1",
  magazine: "KDV_1",
  agricultural: "KDV_1",
}

/**
 * Turkey KDV (VAT) Calculator
 * Implements Turkish tax calculation rules
 */
export class KDVCalculator implements ITaxCalculator {
  /**
   * Get all available KDV rates
   */
  getTaxRates(): TaxRate[] {
    return KDV_RATES
  }

  /**
   * Get default KDV rate (20%)
   */
  getDefaultTaxRate(): TaxRate {
    return KDV_RATES.find((r) => r.isDefault)!
  }

  /**
   * Get KDV rate by ID or code
   */
  getTaxRate(idOrCode: string): TaxRate | undefined {
    return KDV_RATES.find(
      (r) => r.id === idOrCode || r.code === idOrCode
    )
  }

  /**
   * Get applicable KDV rate for a product type
   */
  getTaxRateForProductType(productType: string): TaxRate {
    const code = PRODUCT_TYPE_TAX_MAP[productType.toLowerCase()]
    if (code) {
      const rate = this.getTaxRate(code)
      if (rate) return rate
    }
    return this.getDefaultTaxRate()
  }

  /**
   * Calculate KDV for an amount
   */
  calculateTax(input: TaxCalculationInput): TaxCalculationResult {
    const taxRate = input.taxRateId
      ? this.getTaxRate(input.taxRateId) || this.getDefaultTaxRate()
      : input.productType
        ? this.getTaxRateForProductType(input.productType)
        : this.getDefaultTaxRate()

    let netAmount: number
    let taxAmount: number
    let grossAmount: number

    if (input.isTaxInclusive) {
      // Amount includes tax, calculate net
      grossAmount = input.amount
      netAmount = Math.round((input.amount * 100) / (100 + taxRate.rate))
      taxAmount = grossAmount - netAmount
    } else {
      // Amount excludes tax, calculate gross
      netAmount = input.amount
      taxAmount = Math.round((input.amount * taxRate.rate) / 100)
      grossAmount = netAmount + taxAmount
    }

    return {
      taxAmount,
      netAmount,
      grossAmount,
      taxRate,
      breakdown: [
        {
          taxRate,
          taxableAmount: netAmount,
          taxAmount,
        },
      ],
    }
  }

  /**
   * Add KDV to an amount
   */
  addTax(amount: number, taxRateIdOrCode?: string): number {
    const taxRate = taxRateIdOrCode
      ? this.getTaxRate(taxRateIdOrCode) || this.getDefaultTaxRate()
      : this.getDefaultTaxRate()

    return amount + Math.round((amount * taxRate.rate) / 100)
  }

  /**
   * Remove KDV from an amount (when amount is tax-inclusive)
   */
  removeTax(amount: number, taxRateIdOrCode?: string): number {
    const taxRate = taxRateIdOrCode
      ? this.getTaxRate(taxRateIdOrCode) || this.getDefaultTaxRate()
      : this.getDefaultTaxRate()

    return Math.round((amount * 100) / (100 + taxRate.rate))
  }

  /**
   * Get detailed KDV rate information
   */
  getKDVRateInfo(rate: KDVRate): KDVRateInfo {
    switch (rate) {
      case KDVRate.STANDARD:
        return {
          rate: KDVRate.STANDARD,
          name: "Standard KDV",
          description: "Standard rate applied to most goods and services",
          applicableCategories: [
            "electronics",
            "furniture",
            "clothing",
            "cosmetics",
          ],
        }
      case KDVRate.REDUCED:
        return {
          rate: KDVRate.REDUCED,
          name: "Reduced KDV",
          description: "Reduced rate for certain goods and services",
          applicableCategories: [
            "processed food",
            "restaurants",
            "hotels",
            "transportation",
          ],
        }
      case KDVRate.LOW:
        return {
          rate: KDVRate.LOW,
          name: "Low KDV",
          description: "Low rate for basic necessities",
          applicableCategories: [
            "basic food",
            "newspapers",
            "magazines",
            "agricultural products",
          ],
        }
    }
  }
}

export default KDVCalculator
