/**
 * Area API Types and Functions
 * Story 5.9: Province/City/District selector
 *
 * API Endpoint:
 * - GET /app-api/system/area/tree - Get area tree
 */

import { clientFetch, type ApiResponse } from "@/lib/core/api";

export type { ApiResponse };

/**
 * Area Node (Province/City/District)
 */
export interface AreaNode {
  id: number;
  name: string;
  children?: AreaNode[];
}

/**
 * Get area tree (provinces with nested cities and districts)
 * This API doesn't require authentication
 */
export async function getAreaTree(): Promise<ApiResponse<AreaNode[]>> {
  return clientFetch<AreaNode[]>("/app-api/system/area/tree", {
    method: "GET",
    skipAuth: true,
  });
}

/**
 * Find area by ID in tree
 */
export function findAreaById(tree: AreaNode[], id: number): AreaNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findAreaById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get full area name by ID (e.g., "广东省深圳市南山区")
 */
export function getFullAreaName(
  tree: AreaNode[],
  districtId: number
): string {
  // Find path from province to district
  for (const province of tree) {
    if (province.id === districtId) {
      return province.name;
    }
    if (province.children) {
      for (const city of province.children) {
        if (city.id === districtId) {
          return `${province.name}${city.name}`;
        }
        if (city.children) {
          for (const district of city.children) {
            if (district.id === districtId) {
              return `${province.name}${city.name}${district.name}`;
            }
          }
        }
      }
    }
  }
  return "";
}

