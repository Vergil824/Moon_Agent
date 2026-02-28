/**
 * Cart Hooks for Taro
 * Migrated from moon-agent/lib/cart/useCart.ts
 *
 * Provides hooks for:
 * - Fetching cart list
 * - Updating item count
 * - Updating selection state
 * - Deleting items
 * - Computed values (total, selected count, etc.)
 */

import { useState, useCallback, useMemo } from 'react';
import { useDidShow } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import {
  getCartList,
  updateCartCount,
  updateCartSelected,
  deleteCartItems,
  calculateSelectedTotal,
  countSelectedItems,
  areAllItemsSelected,
  groupCartItemsByStore,
  type CartItem,
  type CartStore,
  type UpdateCartCountRequest,
  type AppCartListRespVO,
} from './cartApi';

interface CartState {
  data: AppCartListRespVO | null;
  isLoading: boolean;
  error: Error | null;
}

interface MutationState {
  isPending: boolean;
  error: Error | null;
}

/**
 * Hook for cart operations
 * Provides data fetching and mutations for cart management
 */
export function useCart() {
  // Cart data state
  const [state, setState] = useState<CartState>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Mutation states
  const [countMutation, setCountMutation] = useState<MutationState>({
    isPending: false,
    error: null,
  });
  const [selectedMutation, setSelectedMutation] = useState<MutationState>({
    isPending: false,
    error: null,
  });
  const [deleteMutation, setDeleteMutation] = useState<MutationState>({
    isPending: false,
    error: null,
  });
  const [selectAllMutation, setSelectAllMutation] = useState<MutationState>({
    isPending: false,
    error: null,
  });

  // Fetch cart list
  const fetchCart = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getCartList();

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
          error: new Error(response.msg || '获取购物车失败'),
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
    fetchCart();
  });

  // Update item count
  const updateItemCount = useCallback(
    async (params: UpdateCartCountRequest) => {
      setCountMutation({ isPending: true, error: null });

      // Optimistic update
      setState((prev) => {
        if (!prev.data) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            validList: prev.data.validList.map((item) =>
              item.id === params.id ? { ...item, count: params.count } : item
            ),
          },
        };
      });

      try {
        const response = await updateCartCount(params);

        if (response.code !== 0) {
          // Revert on error
          fetchCart();
          const error = new Error(response.msg || '更新数量失败');
          setCountMutation({ isPending: false, error });
          Taro.showToast({ title: error.message, icon: 'none' });
          return;
        }

        setCountMutation({ isPending: false, error: null });
      } catch (err) {
        // Revert on error
        fetchCart();
        const error = err instanceof Error ? err : new Error('网络请求失败');
        setCountMutation({ isPending: false, error });
        Taro.showToast({ title: error.message, icon: 'none' });
      }
    },
    [fetchCart]
  );

  // Toggle item selection
  const toggleItemSelected = useCallback(
    async (id: number, selected: boolean) => {
      setSelectedMutation({ isPending: true, error: null });

      // Optimistic update
      setState((prev) => {
        if (!prev.data) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            validList: prev.data.validList.map((item) =>
              item.id === id ? { ...item, selected } : item
            ),
          },
        };
      });

      try {
        const response = await updateCartSelected({ ids: [id], selected });

        if (response.code !== 0) {
          // Revert on error
          fetchCart();
          const error = new Error(response.msg || '更新选择状态失败');
          setSelectedMutation({ isPending: false, error });
          return;
        }

        setSelectedMutation({ isPending: false, error: null });
      } catch (err) {
        // Revert on error
        fetchCart();
        const error = err instanceof Error ? err : new Error('网络请求失败');
        setSelectedMutation({ isPending: false, error });
      }
    },
    [fetchCart]
  );

  // Select/deselect all items
  const selectAll = useCallback(
    async (selected: boolean) => {
      const validItems = state.data?.validList ?? [];
      if (validItems.length === 0) return;

      setSelectAllMutation({ isPending: true, error: null });

      // Optimistic update
      setState((prev) => {
        if (!prev.data) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            validList: prev.data.validList.map((item) => ({
              ...item,
              selected,
            })),
          },
        };
      });

      try {
        const ids = validItems.map((item) => item.id);
        const response = await updateCartSelected({ ids, selected });

        if (response.code !== 0) {
          // Revert on error
          fetchCart();
          const error = new Error(response.msg || '全选操作失败');
          setSelectAllMutation({ isPending: false, error });
          return;
        }

        setSelectAllMutation({ isPending: false, error: null });
      } catch (err) {
        // Revert on error
        fetchCart();
        const error = err instanceof Error ? err : new Error('网络请求失败');
        setSelectAllMutation({ isPending: false, error });
      }
    },
    [state.data?.validList, fetchCart]
  );

  // Delete items
  const deleteItems = useCallback(
    async (ids: number[]) => {
      setDeleteMutation({ isPending: true, error: null });

      // Optimistic update
      const idsSet = new Set(ids);
      setState((prev) => {
        if (!prev.data) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            validList: prev.data.validList.filter(
              (item) => !idsSet.has(item.id)
            ),
            invalidList: prev.data.invalidList.filter(
              (item) => !idsSet.has(item.id)
            ),
          },
        };
      });

      try {
        const response = await deleteCartItems(ids);

        if (response.code !== 0) {
          // Revert on error
          fetchCart();
          const error = new Error(response.msg || '删除失败');
          setDeleteMutation({ isPending: false, error });
          Taro.showToast({ title: error.message, icon: 'none' });
          return;
        }

        Taro.showToast({ title: '已删除', icon: 'success' });
        setDeleteMutation({ isPending: false, error: null });
      } catch (err) {
        // Revert on error
        fetchCart();
        const error = err instanceof Error ? err : new Error('网络请求失败');
        setDeleteMutation({ isPending: false, error });
        Taro.showToast({ title: error.message, icon: 'none' });
      }
    },
    [fetchCart]
  );

  // Computed values
  const validItems = useMemo(
    () => state.data?.validList ?? [],
    [state.data?.validList]
  );
  const invalidItems = useMemo(
    () => state.data?.invalidList ?? [],
    [state.data?.invalidList]
  );
  const totalItems = useMemo(
    () => validItems.reduce((sum, item) => sum + item.count, 0),
    [validItems]
  );
  const selectedTotal = useMemo(
    () => calculateSelectedTotal(validItems),
    [validItems]
  );
  const selectedCount = useMemo(
    () => countSelectedItems(validItems),
    [validItems]
  );
  const isAllSelected = useMemo(
    () => areAllItemsSelected(validItems),
    [validItems]
  );
  const storeGroups = useMemo<CartStore[]>(
    () => groupCartItemsByStore(validItems),
    [validItems]
  );
  const isEmpty = useMemo(
    () =>
      !state.isLoading && validItems.length === 0 && invalidItems.length === 0,
    [state.isLoading, validItems.length, invalidItems.length]
  );

  // Combined mutation state
  const isMutating = useMemo(
    () =>
      countMutation.isPending ||
      selectedMutation.isPending ||
      deleteMutation.isPending ||
      selectAllMutation.isPending,
    [
      countMutation.isPending,
      selectedMutation.isPending,
      deleteMutation.isPending,
      selectAllMutation.isPending,
    ]
  );

  return {
    // Data
    data: state.data,
    validItems,
    invalidItems,
    totalItems,
    selectedTotal,
    selectedCount,
    isAllSelected,
    storeGroups,
    isLoading: state.isLoading,
    error: state.error,
    isEmpty,

    // Actions
    refetch: fetchCart,
    updateItemCount,
    toggleItemSelected,
    selectAll,
    deleteItems,

    // Mutation states
    isUpdatingCount: countMutation.isPending,
    isUpdatingSelected: selectedMutation.isPending,
    isDeletingItems: deleteMutation.isPending,
    isSelectAllLoading: selectAllMutation.isPending,
    isMutating,
  };
}

// Export types
export type { CartItem, CartStore, AppCartListRespVO };
