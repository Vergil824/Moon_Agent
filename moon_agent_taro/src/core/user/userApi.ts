/**
 * User API Types and Functions for Taro
 * Migrated from moon-agent/lib/profile/userApi.ts
 *
 * API Endpoints (relative to TARO_APP_API_BASE):
 * - GET /member/user/get - Get current user info
 * - PUT /member/user/update - Update user profile
 * - PUT /member/user/update-password - Update password
 */

import { get, put, type ApiResponse } from '@core/api';

// Re-export ApiResponse for convenience
export type { ApiResponse };

/**
 * User info response type from /member/user/get
 */
export interface AppMemberUserInfoRespVO {
  id: number;
  nickname: string;
  avatar: string;
  mobile: string;
  sex: number; // 0: unknown, 1: male, 2: female
  birthday: string | null;
  areaId: number | null;
  areaName: string | null;
  mark: string | null;
  point: number;
  experience: number;
  levelId: number | null;
  levelName: string | null;
  groupId: number | null;
  groupName: string | null;
}

/**
 * Update user info request payload
 */
export interface UpdateUserInfoRequest {
  nickname?: string;
  avatar?: string;
}

/**
 * Update password request payload
 */
export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Get current user info
 */
export async function getUserInfo(): Promise<
  ApiResponse<AppMemberUserInfoRespVO>
> {
  return get<AppMemberUserInfoRespVO>('/member/user/get', undefined, {
    showLoading: false,
    showError: false,
  });
}

/**
 * Update user profile info (nickname, avatar)
 * @param data - Fields to update
 */
export async function updateUserInfo(
  data: UpdateUserInfoRequest
): Promise<ApiResponse<boolean>> {
  return put<boolean>('/member/user/update', data, {
    showLoading: true,
    showError: true,
  });
}

/**
 * Update user password
 * @param data - Old and new password
 */
export async function updateUserPassword(
  data: UpdatePasswordRequest
): Promise<ApiResponse<boolean>> {
  return put<boolean>('/member/user/update-password', data, {
    showLoading: true,
    showError: true,
  });
}

/**
 * Mask phone number for display (e.g., 138****8888)
 * @param phone Phone number
 * @returns Masked phone number
 */
export function maskUserPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
