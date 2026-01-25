/**
 * Currency conversion rates (base: USD)
 * In production, these would be fetched from an API
 */
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  TRY: 32.5,
  JPY: 149.5,
  CNY: 7.24,
  AED: 3.67,
  SAR: 3.75,
}

/**
 * Currency information
 */
export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  decimalDigits: number
}

/**
 * Currency definitions
 */
const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", decimalDigits: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", decimalDigits: 2 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", decimalDigits: 2 },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira", decimalDigits: 2 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", decimalDigits: 0 },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", decimalDigits: 2 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", decimalDigits: 2 },
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal", decimalDigits: 2 },
}

/**
 * Convert amount between currencies
 * @param amount - Amount in smallest currency unit
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount in smallest currency unit
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const fromRate = EXCHANGE_RATES[fromCurrency.toUpperCase()]
  const toRate = EXCHANGE_RATES[toCurrency.toUpperCase()]

  if (!fromRate || !toRate) {
    throw new Error(
      `Unsupported currency: ${!fromRate ? fromCurrency : toCurrency}`
    )
  }

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  const convertedAmount = usdAmount * toRate

  return Math.round(convertedAmount)
}

/**
 * Get currency information
 */
export function getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
  return CURRENCIES[currencyCode.toUpperCase()]
}

/**
 * Format amount for display
 * @param amount - Amount in smallest currency unit
 * @param currencyCode - Currency code
 * @param locale - Locale for formatting
 */
export function formatAmount(
  amount: number,
  currencyCode: string,
  locale?: string
): string {
  const currency = getCurrencyInfo(currencyCode)
  if (!currency) {
    throw new Error(`Unsupported currency: ${currencyCode}`)
  }

  const divisor = Math.pow(10, currency.decimalDigits)
  const value = amount / divisor

  return new Intl.NumberFormat(locale || "en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currency.decimalDigits,
    maximumFractionDigits: currency.decimalDigits,
  }).format(value)
}

/**
 * Convert amount to smallest currency unit
 */
export function toSmallestUnit(
  amount: number,
  currencyCode: string
): number {
  const currency = getCurrencyInfo(currencyCode)
  if (!currency) {
    throw new Error(`Unsupported currency: ${currencyCode}`)
  }

  const multiplier = Math.pow(10, currency.decimalDigits)
  return Math.round(amount * multiplier)
}

/**
 * Convert amount from smallest currency unit
 */
export function fromSmallestUnit(
  amount: number,
  currencyCode: string
): number {
  const currency = getCurrencyInfo(currencyCode)
  if (!currency) {
    throw new Error(`Unsupported currency: ${currencyCode}`)
  }

  const divisor = Math.pow(10, currency.decimalDigits)
  return amount / divisor
}
