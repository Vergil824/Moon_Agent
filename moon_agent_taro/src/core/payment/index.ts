/**
 * Payment module exports
 * Provides payment API functions and types for Taro
 */

export {
  // Types
  type PaymentMethod,
  type PaymentChannelCode,
  type SubmitPayOrderRequest,
  type SubmitPayOrderResponse,
  type WxLitePaymentParams,
  type PayOrderRespVO,
  type ApiResponse,
  // Enums
  PayOrderStatus,
  // API Functions
  submitPayOrder,
  getPayOrder,
  // Utility Functions
  isPaymentWaiting,
  isPaymentSuccess,
  isPaymentClosed,
  getPaymentStatusText,
  getPaymentChannelCode,
  parseWxLitePaymentParams,
  formatPaymentPrice,
} from "./payApi";
