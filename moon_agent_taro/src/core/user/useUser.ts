/**
 * User Hooks for Taro
 * Migrated from moon-agent/lib/profile/useUser.ts
 *
 * Provides hooks for:
 * - Fetching user info
 * - Updating user profile
 * - Updating password
 * - Logout
 */

import { useState, useCallback, useEffect } from 'react';
import { useDidShow } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import {
  getUserInfo,
  updateUserInfo,
  updateUserPassword,
  type AppMemberUserInfoRespVO,
  type UpdateUserInfoRequest,
  type UpdatePasswordRequest,
} from './userApi';
import { authClient } from '@core/auth';

interface UserInfoState {
  data: AppMemberUserInfoRespVO | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage user info
 */
export function useUserInfo() {
  const [state, setState] = useState<UserInfoState>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getUserInfo();

      if (response.code === 0 && response.data) {
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: new Error(response.msg || '获取用户信息失败'),
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('网络请求失败'),
      }));
    }
  }, []);

  // Refetch when page becomes visible
  useDidShow(() => {
    fetchUserInfo();
  });

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchUserInfo,
  };
}

interface MutationState {
  isPending: boolean;
  error: Error | null;
}

/**
 * Hook to update user profile info
 */
export function useUpdateUserInfo() {
  const [state, setState] = useState<MutationState>({
    isPending: false,
    error: null,
  });

  const mutate = useCallback(
    async (
      data: UpdateUserInfoRequest,
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) => {
      setState({ isPending: true, error: null });

      try {
        const response = await updateUserInfo(data);

        if (response.code === 0) {
          Taro.showToast({ title: '修改成功', icon: 'success' });
          setState({ isPending: false, error: null });
          options?.onSuccess?.();
        } else {
          const error = new Error(response.msg || '修改失败');
          Taro.showToast({ title: error.message, icon: 'none' });
          setState({ isPending: false, error });
          options?.onError?.(error);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('网络请求失败');
        Taro.showToast({ title: error.message, icon: 'none' });
        setState({ isPending: false, error });
        options?.onError?.(error);
      }
    },
    []
  );

  return {
    mutate,
    isPending: state.isPending,
    error: state.error,
  };
}

/**
 * Hook to update user password
 */
export function useUpdatePassword() {
  const [state, setState] = useState<MutationState>({
    isPending: false,
    error: null,
  });

  const mutate = useCallback(
    async (
      data: UpdatePasswordRequest,
      options?: { onSuccess?: () => void; onError?: (error: Error) => void }
    ) => {
      setState({ isPending: true, error: null });

      try {
        const response = await updateUserPassword(data);

        if (response.code === 0) {
          Taro.showToast({ title: '密码修改成功', icon: 'success' });
          setState({ isPending: false, error: null });
          options?.onSuccess?.();
        } else {
          const error = new Error(response.msg || '密码修改失败');
          Taro.showToast({ title: error.message, icon: 'none' });
          setState({ isPending: false, error });
          options?.onError?.(error);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('网络请求失败');
        Taro.showToast({ title: error.message, icon: 'none' });
        setState({ isPending: false, error });
        options?.onError?.(error);
      }
    },
    []
  );

  return {
    mutate,
    isPending: state.isPending,
    error: state.error,
  };
}

/**
 * Hook for logout functionality
 */
export function useLogout() {
  const [state, setState] = useState<MutationState>({
    isPending: false,
    error: null,
  });

  const mutate = useCallback(async () => {
    setState({ isPending: true, error: null });

    try {
      // Clear tokens
      authClient.clearTokens();

      // Show success message
      Taro.showToast({ title: '已退出登录', icon: 'success' });

      setState({ isPending: false, error: null });

      // Navigate to welcome page
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/welcome/index' });
      }, 500);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('退出失败');
      Taro.showToast({ title: error.message, icon: 'none' });
      setState({ isPending: false, error });
    }
  }, []);

  return {
    mutate,
    isPending: state.isPending,
    error: state.error,
  };
}

// Export types
export type { AppMemberUserInfoRespVO, UpdateUserInfoRequest, UpdatePasswordRequest };
