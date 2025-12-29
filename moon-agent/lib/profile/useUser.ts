"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  getUserInfo,
  updateUserInfo,
  updateUserPassword,
  UpdateUserInfoRequest,
  UpdatePasswordRequest,
  AppMemberUserInfoRespVO,
} from "./userApi";
import { ApiError } from "@/lib/core/api";

/**
 * User hooks for profile management
 * Story 5.5: User profile and order management
 */

// Query key for user info
export const USER_INFO_QUERY_KEY = ["user-info"] as const;

/**
 * Hook to fetch current user info
 * Uses react-query for caching and automatic refetching
 */
export function useUserInfo() {
  const { data: session, status } = useSession();

  return useQuery<AppMemberUserInfoRespVO, Error>({
    queryKey: USER_INFO_QUERY_KEY,
    queryFn: async () => {
      if (!session?.accessToken) {
        throw new Error("No access token available");
      }
      const response = await getUserInfo(session.accessToken);
      if (response.code !== 0) {
        throw new ApiError(response.code, response.msg);
      }
      return response.data;
    },
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to update user profile info
 * Automatically invalidates user info cache on success
 */
export function useUpdateUserInfo() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserInfoRequest) => {
      if (!session?.accessToken) {
        throw new Error("No access token available");
      }
      const response = await updateUserInfo(data, session.accessToken);
      if (response.code !== 0) {
        throw new ApiError(response.code, response.msg);
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("修改成功");
      queryClient.invalidateQueries({ queryKey: USER_INFO_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || "修改失败，请稍后重试");
    },
  });
}

/**
 * Hook to update user password
 */
export function useUpdatePassword() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: UpdatePasswordRequest) => {
      if (!session?.accessToken) {
        throw new Error("No access token available");
      }
      const response = await updateUserPassword(data, session.accessToken);
      if (response.code !== 0) {
        throw new ApiError(response.code, response.msg);
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("密码修改成功");
    },
    onError: (error: Error) => {
      toast.error(error.message || "密码修改失败，请稍后重试");
    },
  });
}

