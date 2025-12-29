import { clientFetch, ApiResponse } from "@/lib/core/api";

/**
 * User API types and functions
 * Story 5.5: User profile and order management
 */

// User info response type from /app-api/member/user/get
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

// Update user info request payload
export interface UpdateUserInfoRequest {
  nickname?: string;
  avatar?: string;
}

// Update password request payload
export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Get current user info
 * @param accessToken - Bearer token for authentication
 */
export async function getUserInfo(
  accessToken: string
): Promise<ApiResponse<AppMemberUserInfoRespVO>> {
  return clientFetch<AppMemberUserInfoRespVO>("/app-api/member/user/get", {
    method: "GET",
    accessToken,
  });
}

/**
 * Update user profile info (nickname, avatar)
 * @param data - Fields to update
 * @param accessToken - Bearer token for authentication
 */
export async function updateUserInfo(
  data: UpdateUserInfoRequest,
  accessToken: string
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>("/app-api/member/user/update", {
    method: "PUT",
    body: data,
    accessToken,
  });
}

/**
 * Update user password
 * @param data - Old and new password
 * @param accessToken - Bearer token for authentication
 */
export async function updateUserPassword(
  data: UpdatePasswordRequest,
  accessToken: string
): Promise<ApiResponse<boolean>> {
  return clientFetch<boolean>("/app-api/member/user/update-password", {
    method: "PUT",
    body: data,
    accessToken,
  });
}

