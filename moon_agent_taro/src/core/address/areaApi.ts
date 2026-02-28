/**
 * Area API Types and Functions
 * Migrated from moon-agent/lib/address/areaApi.ts for Taro
 *
 * API Endpoint:
 * - GET /system/area/tree - Get area tree
 */

import { get, type ApiResponse } from "@core/api";

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
  return get<AreaNode[]>("/system/area/tree", undefined, {
    showLoading: false,
    showError: false,
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
 * Get area path (array of IDs from province to district)
 */
export function getAreaPath(tree: AreaNode[], targetId: number): number[] {
  for (const province of tree) {
    if (province.id === targetId) {
      return [province.id];
    }
    if (province.children) {
      for (const city of province.children) {
        if (city.id === targetId) {
          return [province.id, city.id];
        }
        if (city.children) {
          for (const district of city.children) {
            if (district.id === targetId) {
              return [province.id, city.id, district.id];
            }
          }
        }
      }
    }
  }
  return [];
}

/**
 * Get full area name by ID (e.g., "广东省深圳市南山区")
 */
export function getFullAreaName(tree: AreaNode[], districtId: number): string {
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

/**
 * Convert area tree to Cascader options format
 */
export interface CascaderOption {
  value: string;
  text: string;
  children?: CascaderOption[];
}

export function convertToCascaderOptions(tree: AreaNode[]): CascaderOption[] {
  return tree.map((node) => ({
    value: String(node.id),
    text: node.name,
    children: node.children ? convertToCascaderOptions(node.children) : undefined,
  }));
}
