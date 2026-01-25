import * as crypto from "crypto"
import {
  IyzicoOptions,
  IyzicoPaymentRequest,
  IyzicoPaymentResponse,
  IyzicoRefundRequest,
  IyzicoRefundResponse,
  IyzicoInstallment,
} from "../types"

/**
 * iyzico API endpoints
 */
const IYZICO_ENDPOINTS = {
  payment: "/payment/auth",
  payment3D: "/payment/3dsecure/initialize",
  retrieve: "/payment/detail",
  refund: "/payment/refund",
  installment: "/payment/iyzipos/installment",
}

/**
 * iyzico base URL configurations
 */
const IYZICO_URLS = {
  sandbox: "https://sandbox-api.iyzipay.com",
  production: "https://api.iyzipay.com",
}

/**
 * iyzico API client base class
 * Handles authentication and HTTP communication with iyzico API
 */
export class IyzicoBase {
  protected readonly apiKey: string
  protected readonly secretKey: string
  protected readonly baseUrl: string
  protected readonly enable3DSecure: boolean

  constructor(options: IyzicoOptions) {
    this.apiKey = options.apiKey
    this.secretKey = options.secretKey
    this.baseUrl = options.baseUrl || IYZICO_URLS.sandbox
    this.enable3DSecure = options.enable3DSecure ?? true
  }

  /**
   * Generate authorization header for iyzico API
   */
  protected generateAuthorizationHeader(
    requestString: string,
    randomKey: string
  ): string {
    // Generate hash
    const hashString = this.apiKey + randomKey + this.secretKey + requestString
    const hash = crypto
      .createHash("sha1")
      .update(hashString, "utf8")
      .digest("base64")

    // Generate authorization string
    const authorizationString = `${this.apiKey}:${hash}`
    const authorization = Buffer.from(authorizationString).toString("base64")

    return `IYZWS ${authorization}`
  }

  /**
   * Generate random string for request
   */
  protected generateRandomString(length: number = 8): string {
    return crypto.randomBytes(length).toString("hex").substring(0, length)
  }

  /**
   * Make HTTP request to iyzico API
   */
  protected async makeRequest<T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> {
    const randomKey = this.generateRandomString()
    const requestBody = JSON.stringify(data)
    const authorization = this.generateAuthorizationHeader(requestBody, randomKey)

    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "x-iyzi-rnd": randomKey,
      },
      body: requestBody,
    })

    if (!response.ok) {
      throw new Error(`iyzico API error: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<T>
  }

  /**
   * Create a payment
   */
  async createPayment(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    const endpoint = this.enable3DSecure
      ? IYZICO_ENDPOINTS.payment3D
      : IYZICO_ENDPOINTS.payment

    return this.makeRequest<IyzicoPaymentResponse>(endpoint, {
      locale: "tr",
      conversationId: this.generateRandomString(12),
      ...request,
    })
  }

  /**
   * Retrieve payment details
   */
  async retrievePayment(paymentId: string): Promise<IyzicoPaymentResponse> {
    return this.makeRequest<IyzicoPaymentResponse>(IYZICO_ENDPOINTS.retrieve, {
      locale: "tr",
      conversationId: this.generateRandomString(12),
      paymentId,
    })
  }

  /**
   * Process refund
   */
  async refundPayment(request: IyzicoRefundRequest): Promise<IyzicoRefundResponse> {
    return this.makeRequest<IyzicoRefundResponse>(IYZICO_ENDPOINTS.refund, {
      locale: "tr",
      conversationId: this.generateRandomString(12),
      ...request,
    })
  }

  /**
   * Get installment options for a price and card
   */
  async getInstallmentOptions(
    price: string,
    binNumber: string
  ): Promise<IyzicoInstallment[]> {
    const response = await this.makeRequest<{
      installmentDetails: Array<{
        installmentPrices: Array<{
          installmentNumber: number
          totalPrice: number
          installmentPrice: number
          commissionRate?: number
        }>
      }>
    }>(IYZICO_ENDPOINTS.installment, {
      locale: "tr",
      conversationId: this.generateRandomString(12),
      price,
      binNumber,
    })

    if (!response.installmentDetails?.[0]?.installmentPrices) {
      return []
    }

    return response.installmentDetails[0].installmentPrices.map((p) => ({
      installmentNumber: p.installmentNumber,
      totalPrice: p.totalPrice,
      installmentPrice: p.installmentPrice,
      commissionRate: p.commissionRate,
    }))
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookSecret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex")

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  /**
   * Format price for iyzico (string with 2 decimal places)
   */
  formatPrice(amount: number): string {
    return (amount / 100).toFixed(2)
  }

  /**
   * Parse price from iyzico format to smallest unit
   */
  parsePrice(price: string | number): number {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price
    return Math.round(numericPrice * 100)
  }
}

export default IyzicoBase
