import { IyzicoBase } from "../core/iyzico-base"
import { IyzicoOptions, IyzicoInstallment } from "../types"

/**
 * Turkish bank BIN ranges for installment detection
 */
const TURKISH_BANKS: Record<string, string> = {
  "4": "visa",
  "5": "mastercard",
  "9792": "troy",
}

/**
 * iyzico Installment Service
 * Handles installment options for Turkish credit cards
 */
export class IyzicoInstallmentService {
  private iyzicoClient: IyzicoBase

  constructor(options: IyzicoOptions) {
    this.iyzicoClient = new IyzicoBase(options)
  }

  /**
   * Get available installment options for a card
   */
  async getInstallmentOptions(
    price: number,
    binNumber: string
  ): Promise<IyzicoInstallment[]> {
    // BIN number should be first 6 digits
    const bin = binNumber.replace(/\D/g, "").substring(0, 6)

    if (bin.length < 6) {
      throw new Error("BIN number must be at least 6 digits")
    }

    const priceString = (price / 100).toFixed(2)

    return this.iyzicoClient.getInstallmentOptions(priceString, bin)
  }

  /**
   * Detect card type from BIN
   */
  detectCardType(binNumber: string): string | null {
    const bin = binNumber.replace(/\D/g, "")

    // Check Troy first (Turkish domestic card)
    if (bin.startsWith("9792")) {
      return "troy"
    }

    // Check Visa
    if (bin.startsWith("4")) {
      return "visa"
    }

    // Check Mastercard
    if (bin.startsWith("5") && ["51", "52", "53", "54", "55"].some((p) => bin.startsWith(p))) {
      return "mastercard"
    }

    // Check Mastercard 2-series
    if (bin.startsWith("2") && parseInt(bin.substring(0, 4)) >= 2221 && parseInt(bin.substring(0, 4)) <= 2720) {
      return "mastercard"
    }

    return null
  }

  /**
   * Format installment option for display
   */
  formatInstallmentOption(
    installment: IyzicoInstallment,
    currency: string = "TRY"
  ): {
    label: string
    description: string
    monthlyAmount: string
    totalAmount: string
    additionalCost: number
  } {
    const formatter = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    })

    const monthlyAmount = formatter.format(installment.installmentPrice)
    const totalAmount = formatter.format(installment.totalPrice)

    let label: string
    let description: string

    if (installment.installmentNumber === 1) {
      label = "Tek cekim"
      description = `${totalAmount} tek seferde odenir`
    } else {
      label = `${installment.installmentNumber} taksit`
      description = `Aylik ${monthlyAmount} x ${installment.installmentNumber} taksit`
    }

    // Calculate additional cost from commission
    const basePrice = installment.totalPrice / (1 + (installment.commissionRate || 0) / 100)
    const additionalCost = Math.round((installment.totalPrice - basePrice) * 100) / 100

    return {
      label,
      description,
      monthlyAmount,
      totalAmount,
      additionalCost,
    }
  }

  /**
   * Get recommended installment option
   * Usually suggests 1 (no installment) for lowest total cost
   */
  getRecommendedInstallment(
    options: IyzicoInstallment[]
  ): IyzicoInstallment | null {
    if (options.length === 0) {
      return null
    }

    // Return single payment option (lowest total cost)
    return options.find((o) => o.installmentNumber === 1) || options[0]
  }

  /**
   * Filter installment options by available months
   */
  filterByMonths(
    options: IyzicoInstallment[],
    allowedMonths: number[]
  ): IyzicoInstallment[] {
    return options.filter((o) => allowedMonths.includes(o.installmentNumber))
  }

  /**
   * Get standard Turkish installment options (2, 3, 6, 9, 12)
   */
  getStandardInstallments(
    options: IyzicoInstallment[]
  ): IyzicoInstallment[] {
    const standardMonths = [1, 2, 3, 6, 9, 12]
    return this.filterByMonths(options, standardMonths)
  }
}

export default IyzicoInstallmentService
