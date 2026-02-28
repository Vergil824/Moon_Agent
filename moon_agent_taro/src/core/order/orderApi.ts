/**
 * Order API Types and Functions
 * Migrated from moon-agent/lib/order/orderApi.ts for Taro
 *
 * API Endpoints (relative to TARO_APP_API_BASE):
 * - GET /trade/order/settlement - Get settlement preview
 * - POST /trade/order/create - Create order
 * - GET /trade/order/page - Get order list with pagination
 */

import { get, post, type ApiResponse } from "@core/api";

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ============================================================
// Type Definitions (based on AppTradeOrderSettlementRespVO)
// ============================================================

/**
 * SKU Property (e.g., size, color)
 */
export type SettlementSkuProperty = {
  propertyId: number;
  propertyName: string;
  valueId: number;
  valueName: string;
};

/**
 * Settlement item (product in order)
 */
export type SettlementItem = {
  spuId: number;
  spuName: string;
  skuId: number;
  count: number;
  cartId: number;
  categoryId: number;
  price: number; // Price in cents (分)
  picUrl: string;
  stock: number;
  properties: SettlementSkuProperty[];
};

/**
 * Delivery address in settlement
 */
export type SettlementAddress = {
  id: number;
  name: string;
  mobile: string;
  areaId: number;
  areaName: string;
  detailAddress: string;
  defaultStatus: boolean;
};

/**
 * Price calculation details
 */
export type SettlementPrice = {
  totalPrice: number; // Total item price in cents
  discountPrice: number; // Discount amount in cents
  deliveryPrice: number; // Shipping fee in cents
  payPrice: number; // Final pay price in cents
  pointPrice?: number; // Points discount in cents
  couponPrice?: number; // Coupon discount in cents
  vipPrice?: number; // VIP discount in cents
};

/**
 * Settlement preview response
 */
export type AppTradeOrderSettlementRespVO = {
  items: SettlementItem[];
  address?: SettlementAddress;
  price: SettlementPrice;
  type: number; // Order type
  deliveryType: number; // Delivery type
  // Optional fields
  message?: string;
  couponId?: number;
  pointStatus?: boolean;
  usePoint?: number;
};

/**
 * Create order request
 */
export type CreateOrderRequest = {
  items: Array<{
    skuId: number;
    count: number;
    cartId?: number;
  }>;
  addressId: number;
  deliveryType?: number; // 1: express, 2: self-pickup
  remark?: string;
  couponId?: number;
  pointStatus?: boolean;
  combinationActivityId?: number;
  combinationHeadId?: number;
  seckillActivityId?: number;
  bargainRecordId?: number;
};

/**
 * Create order response
 */
export type CreateOrderResponse = {
  id: number; // Trade order ID
  payOrderId: number; // Pay order ID for payment
};

/**
 * Settlement item (for request)
 */
export type SettlementRequestItem = {
  skuId: number;
  count: number;
  cartId?: number;
};

/**
 * Settlement request parameters
 */
export type SettlementRequest = {
  items: SettlementRequestItem[];
  addressId?: number;
  deliveryType?: number;
  couponId?: number;
  pointStatus: boolean;
  combinationActivityId?: number;
  combinationHeadId?: number;
  seckillActivityId?: number;
  bargainRecordId?: number;
  pickUpStoreId?: number;
  receiverName?: string;
  receiverMobile?: string;
  pointActivityId?: number;
};

// ============================================================
// API Functions
// ============================================================

/**
 * Get settlement preview data
 * Fetches current cart items pricing and delivery info
 *
 * @param params Settlement request parameters (GET with query string)
 */
export async function getSettlement(
  params: SettlementRequest
): Promise<ApiResponse<AppTradeOrderSettlementRespVO>> {
  const queryParts: string[] = [];

  // Serialize items array in Spring-style array format
  if (params.items && params.items.length > 0) {
    params.items.forEach((item, index) => {
      const prefix = `items%5B${index}%5D`;
      if (item.skuId !== undefined) {
        queryParts.push(`${prefix}.skuId=${item.skuId}`);
      }
      if (item.count !== undefined) {
        queryParts.push(`${prefix}.count=${item.count}`);
      }
      if (item.cartId !== undefined) {
        queryParts.push(`${prefix}.cartId=${item.cartId}`);
      }
    });
  }

  // Add pointStatus (required)
  queryParts.push(`pointStatus=${params.pointStatus}`);

  // Add deliveryType (required, default to express)
  queryParts.push(`deliveryType=${params.deliveryType ?? 1}`);

  // Optional parameters
  if (params.addressId) {
    queryParts.push(`addressId=${params.addressId}`);
  }
  if (params.couponId) {
    queryParts.push(`couponId=${params.couponId}`);
  }
  if (params.pickUpStoreId) {
    queryParts.push(`pickUpStoreId=${params.pickUpStoreId}`);
  }
  if (params.receiverName) {
    queryParts.push(`receiverName=${encodeURIComponent(params.receiverName)}`);
  }
  if (params.receiverMobile) {
    queryParts.push(`receiverMobile=${params.receiverMobile}`);
  }

  const queryString = queryParts.join("&");
  const endpoint = `/trade/order/settlement?${queryString}`;

  return get<AppTradeOrderSettlementRespVO>(endpoint, undefined, {
    showLoading: false,
    showError: false,
  });
}

/**
 * Create order
 * Submit order and get payment order ID
 *
 * @param params Order creation parameters
 */
export async function createOrder(
  params: CreateOrderRequest
): Promise<ApiResponse<CreateOrderResponse>> {
  return post<CreateOrderResponse>("/trade/order/create", params, {
    showLoading: true,
    showError: true,
  });
}

// ============================================================
// Order List Types (Story 5.5)
// ============================================================

/**
 * Order status enum
 */
export enum OrderStatus {
  UNPAID = 0, // 待付款
  UNDELIVERED = 10, // 待发货
  DELIVERED = 20, // 待收货
  COMPLETED = 30, // 已完成
  CANCELLED = 40, // 已取消
}

/**
 * Order status display info
 */
export const ORDER_STATUS_MAP: Record<
  number,
  { label: string; color: string }
> = {
  [OrderStatus.UNPAID]: { label: "待付款", color: "text-[#f59e0b]" },
  [OrderStatus.UNDELIVERED]: { label: "待发货", color: "text-[#3b82f6]" },
  [OrderStatus.DELIVERED]: { label: "待收货", color: "text-[#10b981]" },
  [OrderStatus.COMPLETED]: { label: "已完成", color: "text-[#6b7280]" },
  [OrderStatus.CANCELLED]: { label: "已取消", color: "text-[#9ca3af]" },
};

/**
 * Order item in list
 */
export type OrderItem = {
  id: number;
  orderId: number;
  spuId: number;
  spuName: string;
  skuId: number;
  picUrl: string;
  count: number;
  price: number; // Price in cents
  properties: SettlementSkuProperty[];
};

/**
 * Order in page list
 */
export type AppTradeOrderPageItem = {
  id: number;
  no: string;
  status: number;
  payPrice: number; // Final paid price in cents
  createTime: string; // ISO date string
  items: OrderItem[];
  totalPrice?: number;
  deliveryPrice?: number;
  discountPrice?: number;
  payTime?: string;
  deliveryTime?: string;
  receiveTime?: string;
  finishTime?: string;
};

/**
 * Page result wrapper
 */
export type PageResult<T> = {
  list: T[];
  total: number;
};

/**
 * Order page request parameters
 */
export type OrderPageRequest = {
  pageNo: number;
  pageSize: number;
  status?: number; // Optional filter by status
};

/**
 * Get order list with pagination
 * @param params Page parameters
 */
export async function getOrderPage(
  params: OrderPageRequest
): Promise<ApiResponse<PageResult<AppTradeOrderPageItem>>> {
  const queryParts: string[] = [
    `pageNo=${params.pageNo}`,
    `pageSize=${params.pageSize}`,
  ];

  if (params.status !== undefined) {
    queryParts.push(`status=${params.status}`);
  }

  const queryString = queryParts.join("&");
  const endpoint = `/trade/order/page?${queryString}`;

  return get<PageResult<AppTradeOrderPageItem>>(endpoint, undefined, {
    showLoading: false,
    showError: false,
  });
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Format price from cents to yuan string
 * @param cents Price in cents
 * @returns Formatted string (e.g., "168.00")
 */
export function formatOrderPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Get SKU properties display string
 * @param properties SKU properties array
 * @returns Display string (e.g., "云朵白; M")
 */
export function getSettlementSkuDisplay(
  properties: SettlementSkuProperty[]
): string {
  if (!properties || properties.length === 0) return "";
  return properties.map((p) => p.valueName).join("; ");
}

/**
 * Calculate total item count
 * @param items Settlement items
 * @returns Total count
 */
export function calculateTotalCount(items: SettlementItem[]): number {
  return items.reduce((sum, item) => sum + item.count, 0);
}

/**
 * Mask phone number for display (e.g., 138****8888)
 * @param phone Phone number
 * @returns Masked phone number
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}
