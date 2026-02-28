/**
 * @core/order - Order module
 *
 * Provides order API and hooks for settlement and order management.
 */

// Export API functions and types
export {
  getSettlement,
  createOrder,
  getOrderPage,
  formatOrderPrice,
  getSettlementSkuDisplay,
  calculateTotalCount,
  maskPhoneNumber,
  OrderStatus,
  ORDER_STATUS_MAP,
  type SettlementItem,
  type SettlementAddress,
  type SettlementPrice,
  type SettlementSkuProperty,
  type AppTradeOrderSettlementRespVO,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type SettlementRequestItem,
  type SettlementRequest,
  type OrderItem,
  type AppTradeOrderPageItem,
  type PageResult,
  type OrderPageRequest,
  type ApiResponse,
} from "./orderApi";

// Export hooks
export {
  useSettlement,
  useCreateOrder,
  useCheckout,
} from "./useCheckout";

export {
  useOrderList,
} from "./useOrders";
