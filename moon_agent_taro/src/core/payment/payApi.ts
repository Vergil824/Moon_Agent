/**
 * Payment API Types and Functions
 * Migrated from moon-agent/lib/payment/payApi.ts for Taro
 *
 * API Endpoints (relative to TARO_APP_API_BASE):
 * - POST /pay/order/submit - Submit payment order
 * - GET /pay/order/get - Query payment order status
 *
 * Key difference from web version:
 * - WeChat Mini Program uses wx_lite channel code
 * - Payment invocation uses Taro.requestPayment instead of URL redirect
 */

import { get, post, type ApiResponse } from "@core/api";

// Re-export types for convenience
export type { ApiResponse };

// ============================================================
// Payment Method and Channel Types
// ============================================================

/**
 * Payment method types supported by the system
 */
export type PaymentMethod = "alipay" | "wechat";

/**
 * Payment channel codes for different environments
 * - alipay_wap: Alipay mobile web payment (H5)
 * - alipay_pc: Alipay PC web payment
 * - wx_pub: WeChat in-app payment (requires openid)
 * - wx_wap: WeChat H5 payment (non-WeChat mobile browser)
 * - wx_native: WeChat Native payment (PC, shows QR code)
 * - wx_lite: WeChat Mini Program payment (uses requestPayment API)
 */
export type PaymentChannelCode =
  | "alipay_wap"
  | "alipay_pc"
  | "wx_pub"
  | "wx_wap"
  | "wx_native"
  | "wx_lite";

// ============================================================
// Payment Order Status Enum
// ============================================================

/**
 * Payment order status values from backend
 * - 0: WAITING - Pending payment
 * - 10: SUCCESS - Payment completed
 * - 20: CLOSED - Payment cancelled/closed
 */
export enum PayOrderStatus {
  WAITING = 0,
  SUCCESS = 10,
  CLOSED = 20,
}

// ============================================================
// Type Definitions
// ============================================================

/**
 * Submit payment order request
 */
export type SubmitPayOrderRequest = {
  /** Pay order ID (from createOrder response) */
  id: number;
  /** Payment channel code based on environment */
  channelCode: PaymentChannelCode;
  /** Return URL after payment completion (optional for wx_lite) */
  returnUrl?: string;
  /** Display mode: "url" for redirect, "qr" for QR code, "app" for native app */
  displayMode: "url" | "qr" | "app";
  /** Extra channel parameters (e.g., openid for wx_pub) */
  channelExtras?: {
    openid?: string;
    [key: string]: string | undefined;
  };
};

/**
 * Submit payment order response
 * For wx_lite channel, displayContent contains JSON string of payment parameters
 */
export type SubmitPayOrderResponse = {
  /** Display mode: how to show the payment */
  displayMode: "url" | "qr" | "app" | "custom";
  /** Display content: URL for redirect, QR code content, or payment params JSON */
  displayContent: string;
};

/**
 * WeChat Mini Program payment parameters (from displayContent JSON)
 * These are passed to Taro.requestPayment
 */
export type WxLitePaymentParams = {
  /** Timestamp */
  timeStamp: string;
  /** Random string */
  nonceStr: string;
  /** Package string (prepay_id=...) */
  package: string;
  /** Sign type (usually RSA) */
  signType: "RSA" | "MD5";
  /** Payment signature */
  paySign: string;
};

/**
 * Payment order query response (CommonResultPayOrderRespVO)
 */
export type PayOrderRespVO = {
  /** Pay order ID */
  id: number;
  /** Payment status (0: waiting, 10: success, 20: closed) */
  status: PayOrderStatus;
  /** Payment amount in cents */
  price: number;
  /** Payment channel code */
  channelCode: string;
  /** Merchant order ID (trade order ID) */
  merchantOrderId: string;
  /** Order subject/title */
  subject: string;
  /** Payment success time (ISO string) */
  successTime?: string;
  /** Channel order ID */
  channelOrderNo?: string;
  /** Error code from channel */
  channelErrorCode?: string;
  /** Error message from channel */
  channelErrorMsg?: string;
  /** Order expiration time */
  expireTime?: string;
};

// ============================================================
// API Functions
// ============================================================

/**
 * Submit payment order
 * Initiates payment process based on selected channel
 *
 * For wx_lite channel, the response displayContent contains JSON string
 * that should be parsed and passed to Taro.requestPayment
 *
 * @param params Payment submission parameters
 * @returns Payment response with redirect URL, QR content, or payment params
 */
export async function submitPayOrder(
  params: SubmitPayOrderRequest
): Promise<ApiResponse<SubmitPayOrderResponse>> {
  return post<SubmitPayOrderResponse>("/pay/order/submit", params, {
    showLoading: true,
    showError: false,
  });
}

/**
 * Get payment order status
 * Query payment order for status updates (used in polling)
 *
 * @param id Pay order ID
 * @param sync Whether to sync with payment channel (default: true)
 * @returns Payment order details including status
 */
export async function getPayOrder(
  id: number,
  sync: boolean = true
): Promise<ApiResponse<PayOrderRespVO>> {
  const queryString = sync ? `id=${id}&sync=true` : `id=${id}`;
  return get<PayOrderRespVO>(`/pay/order/get?${queryString}`, undefined, {
    showLoading: false,
    showError: false,
  });
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Check if payment is in waiting status
 */
export function isPaymentWaiting(status: PayOrderStatus): boolean {
  return status === PayOrderStatus.WAITING;
}

/**
 * Check if payment is successful
 */
export function isPaymentSuccess(status: PayOrderStatus): boolean {
  return status === PayOrderStatus.SUCCESS;
}

/**
 * Check if payment is closed/cancelled
 */
export function isPaymentClosed(status: PayOrderStatus): boolean {
  return status === PayOrderStatus.CLOSED;
}

/**
 * Get human-readable status text
 */
export function getPaymentStatusText(status: PayOrderStatus): string {
  switch (status) {
    case PayOrderStatus.WAITING:
      return "待支付";
    case PayOrderStatus.SUCCESS:
      return "支付成功";
    case PayOrderStatus.CLOSED:
      return "已关闭";
    default:
      return "未知状态";
  }
}

/**
 * Get payment channel code for current environment
 * In WeChat Mini Program, always returns wx_lite for WeChat payment
 *
 * @param method Payment method
 * @returns Appropriate channel code for the environment
 */
export function getPaymentChannelCode(method: PaymentMethod): PaymentChannelCode {
  const isWeapp = process.env.TARO_ENV === "weapp";
  const isH5 = process.env.TARO_ENV === "h5";

  if (method === "alipay") {
    // Alipay: use WAP for mobile (weapp runs in mobile context, H5 is usually mobile)
    return "alipay_wap";
  }

  // WeChat payment
  if (isWeapp) {
    // WeChat Mini Program uses wx_lite channel
    return "wx_lite";
  }

  if (isH5) {
    // H5 in WeChat browser would need wx_pub (with openid)
    // H5 outside WeChat browser uses wx_wap
    // For now, default to wx_wap (wx_pub requires OAuth flow)
    return "wx_wap";
  }

  // Fallback to wx_native for other environments (like RN)
  return "wx_native";
}

/**
 * Parse WeChat Mini Program payment parameters from displayContent
 * @param displayContent JSON string from submitPayOrder response
 * @returns Parsed payment parameters for Taro.requestPayment
 */
export function parseWxLitePaymentParams(
  displayContent: string
): WxLitePaymentParams | null {
  try {
    const params = JSON.parse(displayContent);
    // Validate required fields
    if (
      params.timeStamp &&
      params.nonceStr &&
      params.package &&
      params.signType &&
      params.paySign
    ) {
      return {
        timeStamp: params.timeStamp,
        nonceStr: params.nonceStr,
        package: params.package,
        signType: params.signType,
        paySign: params.paySign,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format price from cents to yuan string
 * @param cents Price in cents
 * @returns Formatted string (e.g., "168.00")
 */
export function formatPaymentPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}
