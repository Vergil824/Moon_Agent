import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Payment Channel Detection Utilities
// Story 4.5: Environment awareness & channel auto-selection
// ============================================================================

/**
 * Payment method types supported by the system
 */
export type PaymentMethod = 'alipay' | 'wechat';

/**
 * Payment channel codes for different environments
 * - alipay_wap: Alipay mobile web payment
 * - alipay_pc: Alipay PC web payment
 * - wx_pub: WeChat in-app payment (requires openid)
 * - wx_wap: WeChat H5 payment (non-WeChat mobile browser)
 * - wx_native: WeChat Native payment (PC, shows QR code)
 */
export type PaymentChannelCode =
  | 'alipay_wap'
  | 'alipay_pc'
  | 'wx_pub'
  | 'wx_wap'
  | 'wx_native';

/**
 * Detects if the current browser is on a mobile device
 * Checks for common mobile device identifiers in User Agent
 */
export function isMobile(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|android|mobile|phone/i.test(ua);
}

/**
 * Detects if the current browser is WeChat's in-app browser
 * WeChat browser includes "MicroMessenger" in the User Agent
 */
export function isWeChatBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/i.test(ua);
}

/**
 * Determines the appropriate payment channel code based on:
 * - Payment method (Alipay or WeChat)
 * - Device type (mobile or desktop)
 * - Browser environment (WeChat in-app or regular browser)
 *
 * @param paymentMethod - The selected payment method ('alipay' | 'wechat')
 * @returns The appropriate channel code for the payment API
 *
 * Channel mapping:
 * - Alipay:
 *   - Mobile browser → alipay_wap
 *   - Desktop browser → alipay_pc
 * - WeChat:
 *   - WeChat in-app browser → wx_pub (requires openid)
 *   - Mobile browser (non-WeChat) → wx_wap
 *   - Desktop browser → wx_native (shows QR code)
 */
export function getPaymentChannel(paymentMethod: PaymentMethod): PaymentChannelCode {
  const mobile = isMobile();
  const wechat = isWeChatBrowser();

  if (paymentMethod === 'alipay') {
    return mobile ? 'alipay_wap' : 'alipay_pc';
  }

  // WeChat payment
  if (wechat) {
    return 'wx_pub';
  }
  if (mobile) {
    return 'wx_wap';
  }
  return 'wx_native';
}

