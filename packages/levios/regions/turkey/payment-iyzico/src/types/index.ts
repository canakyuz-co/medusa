/**
 * iyzico provider configuration options
 */
export interface IyzicoOptions {
  /**
   * iyzico API key
   */
  apiKey: string

  /**
   * iyzico Secret key
   */
  secretKey: string

  /**
   * iyzico base URL (sandbox or production)
   */
  baseUrl?: string

  /**
   * Enable 3D Secure by default
   */
  enable3DSecure?: boolean

  /**
   * Webhook secret for verifying callbacks
   */
  webhookSecret?: string

  /**
   * Default currency code
   */
  currencyCode?: string
}

/**
 * iyzico payment provider keys
 */
export enum IyzicoPaymentProviderKeys {
  IYZICO = "iyzico",
  IYZICO_3D = "iyzico-3d",
}

/**
 * iyzico payment status
 */
export enum IyzicoPaymentStatus {
  SUCCESS = "success",
  FAILURE = "failure",
  INIT_THREEDS = "init_threeds",
  CALLBACK_THREEDS = "callback_threeds",
}

/**
 * iyzico installment option
 */
export interface IyzicoInstallment {
  /**
   * Number of installments (1 = no installment)
   */
  installmentNumber: number

  /**
   * Total amount to be paid
   */
  totalPrice: number

  /**
   * Amount per installment
   */
  installmentPrice: number

  /**
   * Commission rate applied
   */
  commissionRate?: number
}

/**
 * iyzico card information
 */
export interface IyzicoCardInfo {
  cardHolderName: string
  cardNumber: string
  expireMonth: string
  expireYear: string
  cvc: string
  registerCard?: boolean
}

/**
 * iyzico buyer information
 */
export interface IyzicoBuyerInfo {
  id: string
  name: string
  surname: string
  email: string
  phone?: string
  identityNumber?: string
  city?: string
  country?: string
  address?: string
  ip?: string
}

/**
 * iyzico billing address
 */
export interface IyzicoBillingAddress {
  contactName: string
  city: string
  country: string
  address: string
  zipCode?: string
}

/**
 * iyzico basket item
 */
export interface IyzicoBasketItem {
  id: string
  name: string
  category1?: string
  category2?: string
  itemType: "PHYSICAL" | "VIRTUAL"
  price: string
}

/**
 * iyzico payment request
 */
export interface IyzicoPaymentRequest {
  price: string
  paidPrice: string
  currency: string
  installment: number
  basketId?: string
  paymentChannel?: string
  paymentGroup?: string
  paymentCard?: IyzicoCardInfo
  buyer: IyzicoBuyerInfo
  shippingAddress: IyzicoBillingAddress
  billingAddress: IyzicoBillingAddress
  basketItems: IyzicoBasketItem[]
  callbackUrl?: string
}

/**
 * iyzico payment response
 */
export interface IyzicoPaymentResponse {
  status: string
  errorCode?: string
  errorMessage?: string
  errorGroup?: string
  locale?: string
  systemTime: number
  conversationId?: string
  paymentId?: string
  price?: number
  paidPrice?: number
  installment?: number
  currency?: string
  paymentStatus?: string
  fraudStatus?: number
  authCode?: string
  hostReference?: string
  threeDSecureRedirectUrl?: string
}

/**
 * iyzico 3D Secure callback data
 */
export interface Iyzico3DSecureCallback {
  status: string
  paymentId?: string
  conversationId?: string
  mdStatus?: string
}

/**
 * iyzico refund request
 */
export interface IyzicoRefundRequest {
  paymentTransactionId: string
  price: string
  currency: string
  ip?: string
}

/**
 * iyzico refund response
 */
export interface IyzicoRefundResponse {
  status: string
  errorCode?: string
  errorMessage?: string
  paymentId?: string
  paymentTransactionId?: string
  price?: number
  currency?: string
}
