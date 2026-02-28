/**
 * Payment API Types and Functions
 * Story 4.5: Payment submission, environment invocation, and status polling
 *
 * API Endpoints:
 * - POST /app-api/pay/order/submit - Submit payment order
 * - GET /app-api/pay/order/get - Query payment order status
 */

import { clientFetch, type ApiResponse } from "@/lib/core/api";
import type { PaymentChannelCode } from "@/lib/utils/utils";

// Re-export types for convenience
export type { ApiResponse };
export type { PaymentChannelCode };

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
  /** Return URL after payment completion */
  returnUrl: string;
  /** Display mode: "url" for redirect, "qr" for QR code */
  displayMode: "url" | "qr";
  /** Extra channel parameters (e.g., openid for wx_pub) */
  channelExtras?: {
    openid?: string;
    [key: string]: string | undefined;
  };
};

/**
 * Submit payment order response
 */
export type SubmitPayOrderResponse = {
  /** Display mode: how to show the payment */
  displayMode: "url" | "qr" | "app" | "custom";
  /** Display content: URL for redirect or QR code content */
  displayContent: string;
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
 * @param params Payment submission parameters
 * @param accessToken User auth token
 * @returns Payment response with redirect URL or QR content
 */
export async function submitPayOrder(
  params: SubmitPayOrderRequest,
  accessToken?: string
): Promise<ApiResponse<SubmitPayOrderResponse>> {
  return clientFetch<SubmitPayOrderResponse>("/app-api/pay/order/submit", {
    method: "POST",
    body: params,
    accessToken,
  });
}

/**
 * Get payment order status
 * Query payment order for status updates (used in polling)
 *
 * @param id Pay order ID
 * @param accessToken User auth token
 * @param sync Whether to sync with payment channel (default: true)
 * @returns Payment order details including status
 */
export async function getPayOrder(
  id: number,
  accessToken?: string,
  sync: boolean = true
): Promise<ApiResponse<PayOrderRespVO>> {
  const queryParams = sync ? `id=${id}&sync=true` : `id=${id}`;
  return clientFetch<PayOrderRespVO>(`/app-api/pay/order/get?${queryParams}`, {
    method: "GET",
    accessToken,
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

