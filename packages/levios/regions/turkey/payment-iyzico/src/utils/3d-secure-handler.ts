import { Iyzico3DSecureCallback } from "../types"

/**
 * 3D Secure MD Status codes
 */
export enum MDStatus {
  /**
   * 3D Secure verification successful
   */
  SUCCESS = "1",

  /**
   * Card holder or bank not enrolled in 3D Secure
   */
  NOT_ENROLLED = "2",

  /**
   * Bank or card system error
   */
  SYSTEM_ERROR = "3",

  /**
   * Bank or card system error
   */
  SYSTEM_ERROR_4 = "4",

  /**
   * Verification not possible
   */
  NOT_POSSIBLE = "5",

  /**
   * 3D Secure password/OTP incorrect
   */
  FAILED = "6",

  /**
   * System error
   */
  SYSTEM_ERROR_7 = "7",

  /**
   * Unknown card
   */
  UNKNOWN_CARD = "8",
}

/**
 * 3D Secure status result
 */
export interface ThreeDSecureResult {
  success: boolean
  message: string
  canRetry: boolean
  shouldReject: boolean
}

/**
 * Handle 3D Secure callback and determine result
 */
export function handle3DSecureCallback(
  callback: Iyzico3DSecureCallback
): ThreeDSecureResult {
  if (callback.status !== "success") {
    return {
      success: false,
      message: "3D Secure verification failed",
      canRetry: true,
      shouldReject: false,
    }
  }

  const mdStatus = callback.mdStatus

  switch (mdStatus) {
    case MDStatus.SUCCESS:
      return {
        success: true,
        message: "3D Secure verification successful",
        canRetry: false,
        shouldReject: false,
      }

    case MDStatus.NOT_ENROLLED:
      // Card not enrolled, can proceed without 3D
      return {
        success: true,
        message: "Card not enrolled in 3D Secure, proceeding",
        canRetry: false,
        shouldReject: false,
      }

    case MDStatus.FAILED:
      return {
        success: false,
        message: "3D Secure password/OTP verification failed",
        canRetry: true,
        shouldReject: false,
      }

    case MDStatus.SYSTEM_ERROR:
    case MDStatus.SYSTEM_ERROR_4:
    case MDStatus.SYSTEM_ERROR_7:
      return {
        success: false,
        message: "Bank system error, please try again",
        canRetry: true,
        shouldReject: false,
      }

    case MDStatus.NOT_POSSIBLE:
      return {
        success: false,
        message: "3D Secure verification not possible",
        canRetry: false,
        shouldReject: true,
      }

    case MDStatus.UNKNOWN_CARD:
      return {
        success: false,
        message: "Unknown card, please try a different card",
        canRetry: false,
        shouldReject: true,
      }

    default:
      return {
        success: false,
        message: "Unknown 3D Secure status",
        canRetry: true,
        shouldReject: false,
      }
  }
}

/**
 * Generate 3D Secure HTML form for redirect
 */
export function generate3DSecureForm(
  redirectUrl: string,
  paymentData: Record<string, string>
): string {
  const formFields = Object.entries(paymentData)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${key}" value="${value}" />`
    )
    .join("\n")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>3D Secure Verification</title>
    </head>
    <body onload="document.getElementById('threeds_form').submit()">
      <form id="threeds_form" method="POST" action="${redirectUrl}">
        ${formFields}
      </form>
      <p>Redirecting to bank for 3D Secure verification...</p>
    </body>
    </html>
  `
}

/**
 * Parse 3D Secure callback from request body
 */
export function parse3DSecureCallback(
  body: Record<string, unknown>
): Iyzico3DSecureCallback {
  return {
    status: body.status as string,
    paymentId: body.paymentId as string | undefined,
    conversationId: body.conversationId as string | undefined,
    mdStatus: body.mdStatus as string | undefined,
  }
}
