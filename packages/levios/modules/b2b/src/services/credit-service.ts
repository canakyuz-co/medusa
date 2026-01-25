import { CreditTransactionType, CreditTransactionDTO, DealerDTO } from "../types"

/**
 * Credit service for dealer credit account management
 */
export class CreditService {
  /**
   * Validate credit operation
   */
  validateCreditOperation(
    dealer: DealerDTO,
    amount: number,
    type: CreditTransactionType
  ): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: "Amount must be positive" }
    }

    if (type === CreditTransactionType.DEBIT) {
      const availableCredit = dealer.creditLimit - dealer.currentBalance
      if (amount > availableCredit) {
        return {
          valid: false,
          error: `Insufficient credit. Available: ${availableCredit}, Required: ${amount}`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Calculate new balance after transaction
   */
  calculateNewBalance(
    currentBalance: number,
    amount: number,
    type: CreditTransactionType
  ): number {
    switch (type) {
      case CreditTransactionType.DEBIT:
        return currentBalance + amount
      case CreditTransactionType.CREDIT:
      case CreditTransactionType.PAYMENT:
        return currentBalance - amount
      case CreditTransactionType.ADJUSTMENT:
        // Amount can be positive (increase balance) or negative (decrease)
        return currentBalance + amount
      default:
        return currentBalance
    }
  }

  /**
   * Get credit summary for a dealer
   */
  getCreditSummary(dealer: DealerDTO): {
    creditLimit: number
    currentBalance: number
    availableCredit: number
    utilizationPercentage: number
  } {
    const availableCredit = dealer.creditLimit - dealer.currentBalance
    const utilizationPercentage =
      dealer.creditLimit > 0
        ? (dealer.currentBalance / dealer.creditLimit) * 100
        : 0

    return {
      creditLimit: dealer.creditLimit,
      currentBalance: dealer.currentBalance,
      availableCredit,
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
    }
  }

  /**
   * Check if credit utilization is high
   */
  isHighUtilization(dealer: DealerDTO, threshold: number = 80): boolean {
    if (dealer.creditLimit === 0) return false
    const utilization = (dealer.currentBalance / dealer.creditLimit) * 100
    return utilization >= threshold
  }

  /**
   * Calculate payment required to bring balance below threshold
   */
  calculatePaymentToTarget(
    dealer: DealerDTO,
    targetUtilization: number = 50
  ): number {
    const targetBalance = (dealer.creditLimit * targetUtilization) / 100
    const paymentRequired = dealer.currentBalance - targetBalance

    return Math.max(0, paymentRequired)
  }

  /**
   * Format transaction for display
   */
  formatTransaction(transaction: CreditTransactionDTO): string {
    const sign = [CreditTransactionType.DEBIT].includes(transaction.type)
      ? "+"
      : "-"

    return `${sign}${transaction.amount} - ${transaction.description}`
  }
}

export default CreditService
