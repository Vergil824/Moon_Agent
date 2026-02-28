/**
 * Order List Hooks for Taro
 * Migrated from moon-agent/lib/order/useOrders.ts
 *
 * Provides hooks for:
 * - Fetching order list with pagination
 */

import { useState, useCallback, useMemo } from "react";
import { useDidShow } from "@tarojs/taro";
import {
  getOrderPage,
  type PageResult,
  type AppTradeOrderPageItem,
  type OrderPageRequest,
} from "./orderApi";

interface OrderListState {
  data: PageResult<AppTradeOrderPageItem> | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseOrderListOptions {
  pageNo: number;
  pageSize: number;
  status?: number;
  /** Whether to auto-fetch on page show */
  autoFetch?: boolean;
}

/**
 * Hook to fetch order list with pagination
 *
 * Features:
 * - Paginated order list
 * - Auto-refetch on page show (can be disabled)
 * - Loading and error states
 */
export function useOrderList(options: UseOrderListOptions) {
  const { pageNo, pageSize, status, autoFetch = true } = options;

  const [state, setState] = useState<OrderListState>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Fetch order list
  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params: OrderPageRequest = {
        pageNo,
        pageSize,
        status,
      };

      const response = await getOrderPage(params);

      if (response.code === 0 && response.data) {
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: new Error(response.msg || "获取订单列表失败"),
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error("网络请求失败"),
      }));
    }
  }, [pageNo, pageSize, status]);

  // Refetch when page becomes visible
  useDidShow(() => {
    if (autoFetch) {
      fetchOrders();
    }
  });

  // Computed values
  const orders = useMemo(() => state.data?.list ?? [], [state.data]);
  const total = useMemo(() => state.data?.total ?? 0, [state.data]);
  const totalPages = useMemo(
    () => (state.data ? Math.ceil(state.data.total / pageSize) : 0),
    [state.data, pageSize]
  );
  const isEmpty = useMemo(
    () => !state.isLoading && orders.length === 0,
    [state.isLoading, orders.length]
  );

  return {
    // Data
    data: state.data,
    orders,
    total,
    totalPages,
    isEmpty,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    refetch: fetchOrders,
  };
}

// Export types
export type { AppTradeOrderPageItem, PageResult, OrderPageRequest };
