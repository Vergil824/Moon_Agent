"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getOrderPage,
  type PageResult,
  type AppTradeOrderPageItem,
  type OrderPageRequest,
} from "@/lib/order/orderApi";
import { ApiError } from "@/lib/core/api";

/**
 * Order list hook
 * Story 5.5: AC 3 - Order list pagination
 */

export const ORDER_LIST_QUERY_KEY = ["order-list"] as const;

/**
 * Hook to fetch order list with pagination
 */
export function useOrderList(params: OrderPageRequest) {
  const { data: session, status } = useSession();

  return useQuery<PageResult<AppTradeOrderPageItem>, Error>({
    queryKey: [...ORDER_LIST_QUERY_KEY, params.pageNo, params.pageSize, params.status],
    queryFn: async () => {
      if (!session?.accessToken) {
        throw new Error("No access token available");
      }
      const response = await getOrderPage(params, session.accessToken);
      if (response.code !== 0) {
        throw new ApiError(response.code, response.msg);
      }
      return response.data;
    },
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 30 * 1000, // 30 seconds
  });
}

