/**
 * Cart React Query Hooks
 * Story 4.3: Task 2.2 - React Query useQuery implementation
 *
 * Provides hooks for:
 * - Fetching cart list
 * - Updating item count
 * - Updating selection state
 * - Deleting items
 * - Computed values (total, selected count, etc.)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
  type UpdateCartSelectedRequest,
} from "./cartApi";

// Query key constants
export const CART_QUERY_KEY = ["cart", "list"] as const;

/**
 * Hook to fetch cart list
 */
export function useCartList() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const response = await getCartList(accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "Failed to fetch cart");
      }
      return response.data;
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    enabled: !!accessToken, // Only fetch when authenticated
  });
}

/**
 * Hook for computed cart values
 */
export function useCartComputed() {
  const { data, isLoading, error } = useCartList();

  const validItems = data?.validList ?? [];
  const invalidItems = data?.invalidList ?? [];
  const totalItems = validItems.reduce((sum, item) => sum + item.count, 0);
  const selectedTotal = calculateSelectedTotal(validItems);
  const selectedCount = countSelectedItems(validItems);
  const isAllSelected = areAllItemsSelected(validItems);
  const storeGroups = groupCartItemsByStore(validItems);

  return {
    validItems,
    invalidItems,
    totalItems,
    selectedTotal,
    selectedCount,
    isAllSelected,
    storeGroups,
    isLoading,
    error,
    isEmpty: !isLoading && validItems.length === 0 && invalidItems.length === 0,
  };
}

/**
 * Hook for updating cart item count
 */
export function useUpdateCartCount() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: (params: UpdateCartCountRequest) => updateCartCount(params, accessToken),
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(CART_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData(CART_QUERY_KEY, (old: typeof previousCart) => {
        if (!old) return old;
        return {
          ...old,
          validList: (old as { validList: CartItem[] }).validList.map((item: CartItem) =>
            item.id === params.id ? { ...item, count: params.count } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, params, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

/**
 * Hook for updating cart item selection
 */
export function useUpdateCartSelected() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: (params: UpdateCartSelectedRequest) => updateCartSelected(params, accessToken),
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData(CART_QUERY_KEY);

      // Optimistically update selection state
      queryClient.setQueryData(CART_QUERY_KEY, (old: typeof previousCart) => {
        if (!old) return old;
        const idsSet = new Set(params.ids);
        return {
          ...old,
          validList: (old as { validList: CartItem[] }).validList.map((item: CartItem) =>
            idsSet.has(item.id) ? { ...item, selected: params.selected } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, params, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

/**
 * Hook for deleting cart items
 */
export function useDeleteCartItems() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: (ids: number[]) => deleteCartItems(ids, accessToken),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData(CART_QUERY_KEY);

      // Optimistically remove items
      const idsSet = new Set(ids);
      queryClient.setQueryData(CART_QUERY_KEY, (old: typeof previousCart) => {
        if (!old) return old;
        return {
          ...old,
          validList: (old as { validList: CartItem[] }).validList.filter(
            (item: CartItem) => !idsSet.has(item.id)
          ),
          invalidList: (old as { invalidList: CartItem[] }).invalidList.filter(
            (item: CartItem) => !idsSet.has(item.id)
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, ids, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

/**
 * Hook for select all / deselect all functionality
 */
export function useSelectAll() {
  const { data } = useCartList();
  const updateSelected = useUpdateCartSelected();

  const selectAll = async (selected: boolean) => {
    const validItems = data?.validList ?? [];
    if (validItems.length === 0) return;

    const ids = validItems.map((item) => item.id);
    await updateSelected.mutateAsync({ ids, selected });
  };

  return {
    selectAll,
    isLoading: updateSelected.isPending,
  };
}

/**
 * Combined hook for all cart operations
 * Provides a single entry point for cart functionality
 */
export function useCart() {
  const computed = useCartComputed();
  const updateCount = useUpdateCartCount();
  const updateSelected = useUpdateCartSelected();
  const deleteItems = useDeleteCartItems();
  const { selectAll, isLoading: isSelectAllLoading } = useSelectAll();

  return {
    // Data
    ...computed,

    // Mutations
    updateItemCount: updateCount.mutate,
    updateItemCountAsync: updateCount.mutateAsync,
    isUpdatingCount: updateCount.isPending,

    toggleItemSelected: (id: number, selected: boolean) =>
      updateSelected.mutate({ ids: [id], selected }),
    toggleItemSelectedAsync: (id: number, selected: boolean) =>
      updateSelected.mutateAsync({ ids: [id], selected }),
    isUpdatingSelected: updateSelected.isPending,

    deleteItems: deleteItems.mutate,
    deleteItemsAsync: deleteItems.mutateAsync,
    isDeletingItems: deleteItems.isPending,

    selectAll,
    isSelectAllLoading,

    // Combined loading state
    isMutating:
      updateCount.isPending ||
      updateSelected.isPending ||
      deleteItems.isPending ||
      isSelectAllLoading,
  };
}

