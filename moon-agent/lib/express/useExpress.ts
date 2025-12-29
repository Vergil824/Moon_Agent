/**
 * Express Company Hook
 * Story 4.4: Checkout Confirmation - Express Company Selection
 *
 * Provides React Query hook for fetching available express companies
 */

import { useQuery } from "@tanstack/react-query";
import { getExpressList, type ExpressCompany } from "./expressApi";
import { useSession } from "next-auth/react";

/**
 * Query key for express list
 */
export const expressKeys = {
  all: ["express"] as const,
  list: () => [...expressKeys.all, "list"] as const,
};

/**
 * Hook to get available express companies
 */
export function useExpressList() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useQuery({
    queryKey: expressKeys.list(),
    queryFn: async () => {
      const response = await getExpressList(accessToken || undefined);
      if (response.code !== 0 || !response.data) {
        throw new Error(response.msg || "获取快递公司列表失败");
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - express list rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Re-export type
export type { ExpressCompany };

