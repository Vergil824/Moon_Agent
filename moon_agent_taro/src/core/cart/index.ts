/**
 * @core/cart - Cart module
 *
 * Provides cart API and hooks for managing shopping cart.
 */

// Export API functions and types
export {
  getCartList,
  updateCartCount,
  updateCartSelected,
  deleteCartItems,
  addCartItem,
  groupCartItemsByStore,
  calculateSelectedTotal,
  countSelectedItems,
  areAllItemsSelected,
  getSkuPropertiesDisplay,
  getProductImageUrl,
  formatPrice as formatCartPrice, // Renamed to avoid conflict with utils/formatPrice
  type CartItem,
  type CartSku,
  type CartSpu,
  type CartStore,
  type CartPromotion,
  type SkuProperty,
  type AppCartListRespVO,
  type UpdateCartCountRequest,
  type UpdateCartSelectedRequest,
  type AddCartItemRequest,
  type ApiResponse,
} from './cartApi';

// Export hooks
export { useCart } from './useCart';

// Export cart rollback utilities
export {
  saveCartBackup,
  updateBackupOrderId,
  getCartBackup,
  clearCartBackup,
  restoreCartFromBackup,
  hasRestorableBackup,
  type CartBackupItem,
  type CartBackup,
} from './cartRollback';
