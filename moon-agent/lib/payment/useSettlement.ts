/**
 * Settlement React Query Hooks
 * Story 4.4: Task 2.2 - React Query useQuery implementation for settlement
 *
 * Provides hooks for:
 * - Fetching settlement preview
 * - Creating orders
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getSettlement,
  createOrder,
  type AppTradeOrderSettlementRespVO,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type SettlementRequest,
} from "@/lib/order/orderApi";
import { useCartList } from "@/lib/cart/useCart";

// Query key constants
export const SETTLEMENT_QUERY_KEY = ["settlement"] as const;

/**
 * Hook to fetch settlement preview data
 *
 * @param params Optional parameters for settlement query
 */
export function useSettlement(params?: Omit<SettlementRequest, "items">) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const { data: cartData, isLoading: cartLoading } = useCartList();

  // Get selected items from cart
  const selectedItems =
    cartData?.validList?.filter((item) => item.selected) ?? [];
  const hasSelectedItems = selectedItems.length > 0;

  return useQuery({
    queryKey: [...SETTLEMENT_QUERY_KEY, params, selectedItems.map((i) => i.id)],
    queryFn: async () => {
      // Build settlement request with cart items
      const settlementRequest: SettlementRequest = {
        items: selectedItems.map((item) => ({
          skuId: item.skuId,
          count: item.count,
          cartId: item.id,
        })),
        pointStatus: params?.pointStatus ?? false,
        ...params,
      };

      const response = await getSettlement(settlementRequest, accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "Failed to fetch settlement");
      }
      return response.data;
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    enabled: !!accessToken && hasSelectedItems && !cartLoading,
  });
}

/**
 * Hook for creating an order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation<CreateOrderResponse, Error, CreateOrderRequest>({
    mutationFn: async (params: CreateOrderRequest) => {
      const response = await createOrder(params, accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "Failed to create order");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cart query after successful order creation
      queryClient.invalidateQueries({ queryKey: ["cart", "list"] });
      // Invalidate settlement query
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_QUERY_KEY });
    },
  });
}

/**
 * Combined hook for settlement page
 */
export function useCheckout(addressId?: number) {
  const { data, isLoading, error, refetch } = useSettlement({
    addressId,
    pointStatus: false,
  });
  const createOrderMutation = useCreateOrder();

  return {
    // Data
    settlement: data,
    items: data?.items ?? [],
    address: data?.address,
    price: data?.price,

    // Loading states
    isLoading,
    error,
    isCreatingOrder: createOrderMutation.isPending,

    // Actions
    refetch,
    createOrder: createOrderMutation.mutateAsync,
    createOrderError: createOrderMutation.error,
  };
}
