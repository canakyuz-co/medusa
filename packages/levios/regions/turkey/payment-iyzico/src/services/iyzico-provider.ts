import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import { IyzicoBase } from "../core/iyzico-base"
import {
  IyzicoOptions,
  IyzicoPaymentProviderKeys,
  IyzicoPaymentStatus,
  IyzicoBasketItem,
} from "../types"

/**
 * iyzico Payment Provider
 * Implements Medusa payment provider interface for iyzico
 */
export class IyzicoProviderService extends AbstractPaymentProvider<IyzicoOptions> {
  static identifier = IyzicoPaymentProviderKeys.IYZICO

  protected readonly options_: IyzicoOptions
  protected readonly iyzicoClient_: IyzicoBase

  static validateOptions(options: IyzicoOptions): void {
    if (!options.apiKey) {
      throw new Error("iyzico API key is required")
    }
    if (!options.secretKey) {
      throw new Error("iyzico Secret key is required")
    }
  }

  constructor(container: Record<string, unknown>, options: IyzicoOptions) {
    super(container, options)
    this.options_ = options
    this.iyzicoClient_ = new IyzicoBase(options)
  }

  /**
   * Initialize a payment session
   */
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context, data } = input

    const conversationId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Build buyer info from context
    const buyer = {
      id: context?.customer?.id || "guest",
      name: context?.customer?.first_name || "Guest",
      surname: context?.customer?.last_name || "User",
      email: context?.customer?.email || "guest@example.com",
      identityNumber: "11111111111", // Default for testing
      city: context?.billing_address?.city || "Istanbul",
      country: context?.billing_address?.country_code || "Turkey",
      address: context?.billing_address?.address_1 || "Test Address",
      ip: "127.0.0.1",
    }

    // Build shipping address
    const shippingAddress = {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: context?.shipping_address?.city || buyer.city,
      country: context?.shipping_address?.country_code || buyer.country,
      address: context?.shipping_address?.address_1 || buyer.address,
    }

    // Build billing address
    const billingAddress = {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: buyer.city,
      country: buyer.country,
      address: buyer.address,
    }

    // Build basket items from context or use placeholder
    const basketItems: IyzicoBasketItem[] = (
      context?.items as Array<{ id: string; title: string; total: number }> | undefined
    )?.map((item) => ({
      id: item.id,
      name: item.title,
      itemType: "PHYSICAL" as const,
      price: this.iyzicoClient_.formatPrice(item.total),
    })) || [
      {
        id: "item_1",
        name: "Product",
        itemType: "PHYSICAL" as const,
        price: this.iyzicoClient_.formatPrice(amount),
      },
    ]

    // Store payment session data
    const sessionData = {
      conversationId,
      amount: this.iyzicoClient_.formatPrice(amount),
      currency: currency_code.toUpperCase(),
      installment: data?.installment || 1,
      buyer,
      shippingAddress,
      billingAddress,
      basketItems,
      callbackUrl: data?.callbackUrl,
      session_id: data?.session_id,
    }

    // If we have card data, attempt to create payment
    if (data?.paymentCard) {
      try {
        const response = await this.iyzicoClient_.createPayment({
          price: sessionData.amount,
          paidPrice: sessionData.amount,
          currency: sessionData.currency,
          installment: sessionData.installment as number,
          paymentCard: data.paymentCard,
          buyer: sessionData.buyer,
          shippingAddress: sessionData.shippingAddress,
          billingAddress: sessionData.billingAddress,
          basketItems: sessionData.basketItems,
          callbackUrl: sessionData.callbackUrl,
        })

        if (response.status === IyzicoPaymentStatus.SUCCESS) {
          return {
            id: response.paymentId || conversationId,
            status: PaymentSessionStatus.AUTHORIZED,
            data: {
              ...sessionData,
              paymentId: response.paymentId,
              status: response.status,
            },
          }
        }

        // 3D Secure redirect
        if (response.threeDSecureRedirectUrl) {
          return {
            id: conversationId,
            status: PaymentSessionStatus.REQUIRES_MORE,
            data: {
              ...sessionData,
              threeDSecureRedirectUrl: response.threeDSecureRedirectUrl,
              status: IyzicoPaymentStatus.INIT_THREEDS,
            },
          }
        }

        // Payment failed
        return {
          id: conversationId,
          status: PaymentSessionStatus.ERROR,
          data: {
            ...sessionData,
            error: response.errorMessage || "Payment failed",
            errorCode: response.errorCode,
          },
        }
      } catch (error) {
        return {
          id: conversationId,
          status: PaymentSessionStatus.ERROR,
          data: {
            ...sessionData,
            error: error instanceof Error ? error.message : "Payment failed",
          },
        }
      }
    }

    // No card data yet, return pending
    return {
      id: conversationId,
      status: PaymentSessionStatus.PENDING,
      data: sessionData,
    }
  }

  /**
   * Authorize a payment
   */
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const paymentId = input.data?.paymentId as string

    if (!paymentId) {
      return {
        status: PaymentSessionStatus.PENDING,
        data: input.data as Record<string, unknown>,
      }
    }

    try {
      const response = await this.iyzicoClient_.retrievePayment(paymentId)

      if (response.status === IyzicoPaymentStatus.SUCCESS) {
        return {
          status: PaymentSessionStatus.AUTHORIZED,
          data: {
            ...input.data,
            paymentId: response.paymentId,
            authCode: response.authCode,
          } as Record<string, unknown>,
        }
      }

      return {
        status: PaymentSessionStatus.PENDING,
        data: input.data as Record<string, unknown>,
      }
    } catch (error) {
      return {
        status: PaymentSessionStatus.ERROR,
        data: {
          ...input.data,
          error: error instanceof Error ? error.message : "Authorization failed",
        } as Record<string, unknown>,
      }
    }
  }

  /**
   * Capture a payment
   * Note: iyzico typically captures immediately, so this just verifies the payment
   */
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const paymentId = input.data?.paymentId as string

    if (!paymentId) {
      throw new Error("Payment ID is required for capture")
    }

    try {
      const response = await this.iyzicoClient_.retrievePayment(paymentId)

      return {
        data: {
          ...input.data,
          paymentId: response.paymentId,
          captured: true,
        } as Record<string, unknown>,
      }
    } catch (error) {
      throw new Error(
        `Capture failed: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // iyzico doesn't have a cancel endpoint - payments are either completed or not
    return {
      data: {
        ...input.data,
        canceled: true,
      } as Record<string, unknown>,
    }
  }

  /**
   * Delete a payment session
   */
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {
      data: input.data as Record<string, unknown>,
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const paymentId = input.data?.paymentId as string

    if (!paymentId) {
      throw new Error("Payment ID is required for refund")
    }

    try {
      const response = await this.iyzicoClient_.refundPayment({
        paymentTransactionId: paymentId,
        price: this.iyzicoClient_.formatPrice(input.amount),
        currency: (input.data?.currency as string) || "TRY",
      })

      if (response.status !== IyzicoPaymentStatus.SUCCESS) {
        throw new Error(response.errorMessage || "Refund failed")
      }

      return {
        data: {
          ...input.data,
          refundId: response.paymentTransactionId,
          refundAmount: input.amount,
        } as Record<string, unknown>,
      }
    } catch (error) {
      throw new Error(
        `Refund failed: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  /**
   * Retrieve payment details
   */
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const paymentId = input.data?.paymentId as string

    if (!paymentId) {
      return {
        data: input.data as Record<string, unknown>,
      }
    }

    try {
      const response = await this.iyzicoClient_.retrievePayment(paymentId)

      return {
        data: {
          ...input.data,
          ...response,
        } as Record<string, unknown>,
      }
    } catch {
      return {
        data: input.data as Record<string, unknown>,
      }
    }
  }

  /**
   * Update a payment
   */
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // iyzico doesn't support updating payments
    return {
      data: input.data as Record<string, unknown>,
      status: PaymentSessionStatus.PENDING,
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const paymentId = input.data?.paymentId as string

    if (!paymentId) {
      return {
        status: PaymentSessionStatus.PENDING,
      }
    }

    try {
      const response = await this.iyzicoClient_.retrievePayment(paymentId)

      if (response.status === IyzicoPaymentStatus.SUCCESS) {
        return {
          status: PaymentSessionStatus.CAPTURED,
        }
      }

      return {
        status: PaymentSessionStatus.PENDING,
      }
    } catch {
      return {
        status: PaymentSessionStatus.ERROR,
      }
    }
  }

  /**
   * Handle webhook events
   */
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const data = payload.data as Record<string, unknown>
    const status = data?.status as string
    const paymentId = data?.paymentId as string

    if (status === IyzicoPaymentStatus.SUCCESS) {
      return {
        action: PaymentActions.AUTHORIZED,
        data: {
          session_id: data?.conversationId as string,
          amount: this.iyzicoClient_.parsePrice(data?.paidPrice as string),
        },
      }
    }

    if (status === IyzicoPaymentStatus.FAILURE) {
      return {
        action: PaymentActions.FAILED,
        data: {
          session_id: data?.conversationId as string,
          amount: 0,
        },
      }
    }

    // 3D Secure callback
    if (status === IyzicoPaymentStatus.CALLBACK_THREEDS) {
      try {
        const paymentResponse = await this.iyzicoClient_.retrievePayment(paymentId)

        if (paymentResponse.status === IyzicoPaymentStatus.SUCCESS) {
          return {
            action: PaymentActions.AUTHORIZED,
            data: {
              session_id: data?.conversationId as string,
              amount: this.iyzicoClient_.parsePrice(
                paymentResponse.paidPrice?.toString() || "0"
              ),
            },
          }
        }
      } catch {
        // Fall through to NOT_SUPPORTED
      }
    }

    return {
      action: PaymentActions.NOT_SUPPORTED,
    }
  }
}

export default IyzicoProviderService
