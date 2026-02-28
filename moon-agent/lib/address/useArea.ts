/**
 * Area React Query Hooks
 * Story 5.9: Province/City/District selector
 */

import { useQuery } from "@tanstack/react-query";
import { getAreaTree, type AreaNode } from "./areaApi";

export const AREA_TREE_QUERY_KEY = ["area", "tree"] as const;

/**
 * Hook to fetch area tree
 */
export function useAreaTree() {
  return useQuery({
    queryKey: AREA_TREE_QUERY_KEY,
    queryFn: async () => {
      const response = await getAreaTree();
      if (response.code !== 0) {
        throw new Error(response.msg || "获取地区数据失败");
      }
      return response.data || [];
    },
    staleTime: Infinity, // Area data rarely changes
    gcTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });
}

export type { AreaNode };

