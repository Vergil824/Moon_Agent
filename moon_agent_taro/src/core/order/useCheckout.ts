/**
 * Settlement/Checkout Hooks for Taro
 * Migrated from moon-agent/lib/payment/useSettlement.ts
 *
 * Provides hooks for:
 * - Fetching settlement preview
 * - Creating orders
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useCart } from "@core/cart";
import {
  getSettlement,
  createOrder as createOrderApi,
  type AppTradeOrderSettlementRespVO,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type SettlementItem,
  type SettlementPrice,
  type SettlementAddress,
} from "./orderApi";

interface SettlementState {
  data: AppTradeOrderSettlementRespVO | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch settlement preview data
 */
export function useSettlement(addressId?: number) {
  const { validItems, isLoading: cartLoading } = useCart();

  const [state, setState] = useState<SettlementState>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Use ref to track if initial fetch has been done to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const lastFetchKeyRef = useRef<string>("");

  // Get selected items from cart - memoized to prevent unnecessary recalculations
  const selectedItems = useMemo(
    () => validItems.filter((item) => item.selected),
    [validItems]
  );
  const hasSelectedItems = selectedItems.length > 0;

  // Create a stable key based on selected item IDs and counts for dependency tracking
  // This prevents infinite loops caused by array reference changes
  const selectedItemsKey = useMemo(() => {
    if (!hasSelectedItems) return "";
    return selectedItems
      .map((item) => `${item.id}:${item.skuId}:${item.count}`)
      .sort()
      .join(",");
  }, [selectedItems, hasSelectedItems]);

  const fetchSettlement = useCallback(async () => {
    if (!hasSelectedItems || cartLoading) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Create fetch key to prevent duplicate requests
    const fetchKey = `${selectedItemsKey}-${addressId ?? ""}`;
    if (fetchKey === lastFetchKeyRef.current && hasFetchedRef.current) {
      // Skip if we've already fetched with the same parameters
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    lastFetchKeyRef.current = fetchKey;
    hasFetchedRef.current = true;

    try {
      const response = await getSettlement({
        items: selectedItems.map((item) => ({
          skuId: item.skuId,
          count: item.count,
          cartId: item.id,
        })),
        pointStatus: false,
        addressId,
      });

      if (response.code === 0 && response.data) {
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          isLoading: false,
          error: new Error(response.msg || "获取结算信息失败"),
        });
      }
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err : new Error("网络请求失败"),
      });
    }
  }, [selectedItemsKey, hasSelectedItems, cartLoading, addressId, selectedItems]);

  // Fetch settlement on mount and when dependencies change
  // Using selectedItemsKey as dependency instead of selectedItems to prevent infinite loops
  useEffect(() => {
    fetchSettlement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemsKey, addressId, cartLoading]);

  // Reset fetch state when key changes significantly
  useEffect(() => {
    if (!hasSelectedItems) {
      hasFetchedRef.current = false;
      lastFetchKeyRef.current = "";
    }
  }, [hasSelectedItems]);

  return {
    data: state.data,
    isLoading: state.isLoading || cartLoading,
    error: state.error,
    refetch: useCallback(() => {
      // Force refetch by resetting the fetch tracking
      hasFetchedRef.current = false;
      lastFetchKeyRef.current = "";
      fetchSettlement();
    }, [fetchSettlement]),
  };
}

/**
 * Hook for creating an order
 */
export function useCreateOrder() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (params: CreateOrderRequest): Promise<CreateOrderResponse> => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await createOrderApi(params);

        if (response.code === 0 && response.data) {
          return response.data;
        } else {
          const apiError = new Error(response.msg || "订单创建失败");
          setError(apiError);
          throw apiError;
        }
      } catch (err) {
        const networkError = err instanceof Error ? err : new Error("网络请求失败");
        setError(networkError);
        throw networkError;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createOrder: create,
    isCreatingOrder: isCreating,
    createOrderError: error,
  };
}

/**
 * Combined hook for checkout page
 */
export function useCheckout(addressId?: number) {
  const {
    data,
    isLoading: settlementLoading,
    error: settlementError,
    refetch,
  } = useSettlement(addressId);

  const {
    createOrder: createOrderFn,
    isCreatingOrder,
    createOrderError,
  } = useCreateOrder();

  return {
    // Data
    settlement: data,
    items: data?.items ?? [],
    address: data?.address,
    price: data?.price,

    // Loading states
    isLoading: settlementLoading,
    error: settlementError,
    isCreatingOrder,

    // Actions
    refetch,
    createOrder: createOrderFn,
    createOrderError,
  };
}

// Export types
export type {
  AppTradeOrderSettlementRespVO,
  CreateOrderRequest,
  CreateOrderResponse,
  SettlementItem,
  SettlementPrice,
  SettlementAddress,
};
