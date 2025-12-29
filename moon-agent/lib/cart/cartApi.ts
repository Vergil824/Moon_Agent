/**
 * Cart API Types and Functions
 * Story 4.3: Task 2 - API Integration & Data Flow Management
 *
 * API Endpoints (per Technical Notes):
 * - GET /app-api/trade/cart/list - Query cart list
 * - PUT /app-api/trade/cart/update-count - Update item quantity
 * - PUT /app-api/trade/cart/update-selected - Update selection state
 * - DELETE /app-api/trade/cart/delete - Delete cart items
 */

import { clientFetch, type ApiResponse } from "@/lib/core/api";

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ============================================================
// Type Definitions (based on AppCartListRespVO backend schema)
// ============================================================

/**
 * SKU Property (e.g., size, color)
 */
export type SkuProperty = {
  propertyId: number;
  propertyName: string;
  valueId: number;
  valueName: string;
};

/**
 * SKU (Stock Keeping Unit) information
 */
export type CartSku = {
  id: number;
  spuId: number;
  picUrl: string | null;
  price: number; // Price in cents (分)
  stock: number;
  properties: SkuProperty[];
};

/**
 * SPU (Standard Product Unit) information
 */
export type CartSpu = {
  id: number;
  name: string;
  picUrl: string;
  categoryId: number;
};

/**
 * Promotion activity information
 */
export type CartPromotion = {
  id: number;
  name: string;
  type: number;
  description?: string;
};

/**
 * Single cart item
 */
export type CartItem = {
  id: number;
  userId: number;
  spuId: number;
  skuId: number;
  count: number;
  selected: boolean;
  addTime: string;
  spu: CartSpu;
  sku: CartSku;
  promotions?: CartPromotion[];
};

/**
 * Store (shop) section in cart
 */
export type CartStore = {
  id: number;
  name: string;
  logo?: string;
  items: CartItem[];
};

/**
 * Cart list response structure
 * Backend returns validList and invalidList at the root level
 */
export type AppCartListRespVO = {
  validList: CartItem[];
  invalidList: CartItem[];
};

/**
 * Request for updating cart item count
 */
export type UpdateCartCountRequest = {
  id: number; // Cart item ID
  count: number; // New quantity
};

/**
 * Request for updating cart item selection
 */
export type UpdateCartSelectedRequest = {
  ids: number[]; // Cart item IDs
  selected: boolean; // Selection state
};

/**
 * Request for deleting cart items
 */
export type DeleteCartItemsRequest = {
  ids: number[]; // Cart item IDs to delete
};

/**
 * Request for adding cart item
 */
export type AddCartItemRequest = {
  skuId: number;
  count: number;
};

// ============================================================
// API Functions
// ============================================================

/**
 * Get cart list with valid and invalid items
 */
export async function getCartList(accessToken?: string): Promise<ApiResponse<AppCartListRespVO>> {
  return clientFetch<AppCartListRespVO>("/app-api/trade/cart/list", {
    method: "GET",
    accessToken
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartCount(
  params: UpdateCartCountRequest,
  accessToken?: string
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>("/app-api/trade/cart/update-count", {
    method: "PUT",
    body: params,
    accessToken
  });
}

/**
 * Update cart item selection state
 */
export async function updateCartSelected(
  params: UpdateCartSelectedRequest,
  accessToken?: string
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>("/app-api/trade/cart/update-selected", {
    method: "PUT",
    body: params,
    accessToken
  });
}

/**
 * Delete cart items
 */
export async function deleteCartItems(
  ids: number[],
  accessToken?: string
): Promise<ApiResponse<boolean>> {
  const idsParam = ids.join(",");
  return clientFetch<boolean>(`/app-api/trade/cart/delete?ids=${idsParam}`, {
    method: "DELETE",
    accessToken
  });
}

/**
 * Add item to cart and return created cartId
 */
export async function addCartItem(
  params: AddCartItemRequest,
  accessToken?: string
): Promise<ApiResponse<number>> {
  return clientFetch<number>("/app-api/trade/cart/add", {
    method: "POST",
    body: params,
    accessToken
  });
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Group cart items by store
 * The backend might return flat list; this groups them by store name
 */
export function groupCartItemsByStore(items: CartItem[]): CartStore[] {
  const storeMap = new Map<string, CartStore>();

  items.forEach((item) => {
    // Default store info; replace with backend store metadata when available
    const storeName = "满月Moon优选";
    const storeId = 1;

    if (!storeMap.has(storeName)) {
      storeMap.set(storeName, {
        id: storeId,
        name: storeName,
        items: [],
      });
    }

    storeMap.get(storeName)!.items.push(item);
  });

  return Array.from(storeMap.values());
}

/**
 * Calculate total price of selected items (in cents)
 */
export function calculateSelectedTotal(items: CartItem[]): number {
  return items
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.sku.price * item.count, 0);
}

/**
 * Count selected items
 */
export function countSelectedItems(items: CartItem[]): number {
  return items.filter((item) => item.selected).reduce((count, item) => count + item.count, 0);
}

/**
 * Check if all items are selected
 */
export function areAllItemsSelected(items: CartItem[]): boolean {
  if (items.length === 0) return false;
  return items.every((item) => item.selected);
}

/**
 * Get display properties string from SKU
 * Example output: "云朵白; M" or "星空黑; L"
 */
export function getSkuPropertiesDisplay(properties: SkuProperty[]): string {
  if (!properties || properties.length === 0) return "";
  return properties.map((p) => p.valueName).join("; ");
}

/**
 * Get product image URL - prioritize SKU image, fallback to SPU image
 */
export function getProductImageUrl(item: CartItem): string {
  return item.sku.picUrl || item.spu.picUrl;
}
