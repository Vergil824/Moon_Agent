/**
 * Address API Types and Functions
 * Migrated from moon-agent/lib/address/addressApi.ts for Taro
 *
 * API Endpoints (relative to TARO_APP_API_BASE):
 * - GET /member/address/list - Get address list
 * - GET /member/address/get?id={id} - Get address detail
 * - POST /member/address/create - Create address
 * - PUT /member/address/update - Update address
 * - DELETE /member/address/delete?id={id} - Delete address
 * - PUT /member/address/update-default?id={id} - Set default address
 */

import { get, post, put, del, type ApiResponse } from "@core/api";

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ============================================================
// Type Definitions
// ============================================================

/**
 * Address Entity
 */
export interface Address {
  id: number;
  name: string;
  mobile: string;
  areaId: number; // Area ID for the district
  areaName?: string; // Full area name (e.g., "广东省深圳市南山区")
  detailAddress: string; // Detailed address
  defaultStatus: boolean; // Whether this is the default address
  createTime?: string;
}

/**
 * Create Address Request
 */
export interface CreateAddressParams {
  name: string;
  mobile: string;
  areaId: number;
  detailAddress: string;
  defaultStatus?: boolean;
}

/**
 * Update Address Request
 */
export interface UpdateAddressParams extends CreateAddressParams {
  id: number;
}

// ============================================================
// API Functions
// ============================================================

/**
 * Get address list
 */
export async function getAddressList(): Promise<ApiResponse<Address[]>> {
  return get<Address[]>("/member/address/list", undefined, {
    showLoading: false,
    showError: false,
  });
}

/**
 * Get address detail
 */
export async function getAddress(id: number): Promise<ApiResponse<Address>> {
  return get<Address>(`/member/address/get?id=${id}`, undefined, {
    showLoading: false,
    showError: false,
  });
}

/**
 * Create address
 */
export async function createAddress(
  params: CreateAddressParams
): Promise<ApiResponse<number>> {
  return post<number>("/member/address/create", params, {
    showLoading: true,
    showError: true,
  });
}

/**
 * Update address
 */
export async function updateAddress(
  params: UpdateAddressParams
): Promise<ApiResponse<boolean>> {
  return put<boolean>("/member/address/update", params, {
    showLoading: true,
    showError: true,
  });
}

/**
 * Delete address
 */
export async function deleteAddress(id: number): Promise<ApiResponse<boolean>> {
  return del<boolean>(`/member/address/delete?id=${id}`, {
    showLoading: true,
    showError: true,
  });
}

/**
 * Set default address
 */
export async function setDefaultAddress(
  id: number
): Promise<ApiResponse<boolean>> {
  return put<boolean>(`/member/address/update-default?id=${id}`, undefined, {
    showLoading: true,
    showError: true,
  });
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Mask phone number for display (e.g., 13800138000 -> 138****8000)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

/**
 * Get default address from list
 */
export function getDefaultAddressFromList(
  addresses: Address[]
): Address | undefined {
  return addresses.find((addr) => addr.defaultStatus);
}

/**
 * Format full address for display
 */
export function formatFullAddress(address: Address): string {
  const areaName = address.areaName || "";
  return `${areaName}${address.detailAddress}`.trim();
}
