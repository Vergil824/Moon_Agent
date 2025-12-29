/**
 * Address API Types and Functions
 * Story 5.9: Unified Address Management System
 *
 * API Endpoints:
 * - GET /app-api/member/address/list
 * - GET /app-api/member/address/get?id={id}
 * - POST /app-api/member/address/create
 * - PUT /app-api/member/address/update
 * - DELETE /app-api/member/address/delete?id={id}
 * - PUT /app-api/member/address/update-default?id={id}
 */

import { clientFetch, type ApiResponse } from "@/lib/core/api";

// Re-export ApiResponse for convenience
export type { ApiResponse };

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
  // Parsed fields for display
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

/**
 * Get address list
 */
export async function getAddressList(accessToken?: string): Promise<ApiResponse<Address[]>> {
  return clientFetch<Address[]>("/app-api/member/address/list", {
    method: "GET",
    accessToken
  });
}

/**
 * Get address detail
 */
export async function getAddress(id: number, accessToken?: string): Promise<ApiResponse<Address>> {
  return clientFetch<Address>(`/app-api/member/address/get?id=${id}`, {
    method: "GET",
    accessToken
  });
}

/**
 * Create address
 */
export async function createAddress(
  params: CreateAddressParams,
  accessToken?: string
): Promise<ApiResponse<number>> {
  return clientFetch<number>("/app-api/member/address/create", {
    method: "POST",
    body: params,
    accessToken
  });
}

/**
 * Update address
 */
export async function updateAddress(
  params: UpdateAddressParams,
  accessToken?: string
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>("/app-api/member/address/update", {
    method: "PUT",
    body: params,
    accessToken
  });
}

/**
 * Delete address
 */
export async function deleteAddress(
  id: number,
  accessToken?: string
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>(`/app-api/member/address/delete?id=${id}`, {
    method: "DELETE",
    accessToken
  });
}

/**
 * Set default address
 */
export async function setDefaultAddress(
  id: number,
  accessToken?: string
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>(`/app-api/member/address/update-default?id=${id}`, {
    method: "PUT",
    accessToken
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
export function getDefaultAddress(addresses: Address[]): Address | undefined {
  return addresses.find(addr => addr.defaultStatus);
}

/**
 * Format full address for display
 */
export function formatFullAddress(address: Address): string {
  const areaName = address.areaName || "";
  return `${areaName}${address.detailAddress}`.trim();
}

