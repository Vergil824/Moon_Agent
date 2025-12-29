/**
 * Address React Query Hooks
 * Story 5.9: Unified Address Management System
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  getAddressList,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
  type Address,
  type CreateAddressParams,
  type UpdateAddressParams,
} from "./addressApi";

export const ADDRESS_QUERY_KEY = ["addressList"] as const;
export const ADDRESS_DETAIL_QUERY_KEY = (id: number) => ["address", "detail", id] as const;

/**
 * Hook to fetch address list
 */
export function useAddressList() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useQuery({
    queryKey: ADDRESS_QUERY_KEY,
    queryFn: async () => {
      const response = await getAddressList(accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "获取地址列表失败");
      }
      return response.data || [];
    },
    staleTime: 30 * 1000,
    enabled: !!accessToken,
  });
}

/**
 * Hook to fetch address detail
 */
export function useAddressDetail(id: number | null) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useQuery({
    queryKey: ADDRESS_DETAIL_QUERY_KEY(id ?? 0),
    queryFn: async () => {
      if (!id) throw new Error("地址ID不能为空");
      const response = await getAddress(id, accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "获取地址详情失败");
      }
      return response.data;
    },
    enabled: !!accessToken && !!id && id > 0,
  });
}

/**
 * Hook for creating address
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: async (params: CreateAddressParams) => {
      // If this is the first address, auto-set as default
      const currentAddresses = queryClient.getQueryData<Address[]>(ADDRESS_QUERY_KEY);
      const isFirstAddress = !currentAddresses || currentAddresses.length === 0;
      
      const finalParams = {
        ...params,
        defaultStatus: isFirstAddress ? true : params.defaultStatus ?? false,
      };
      
      const response = await createAddress(finalParams, accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "创建地址失败");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
      toast.success("地址添加成功");
    },
    onError: (error: Error) => {
      toast.error(error.message || "添加地址失败，请重试");
    },
  });
}

/**
 * Hook for updating address
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: async (params: UpdateAddressParams) => {
      const response = await updateAddress(params, accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "更新地址失败");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADDRESS_DETAIL_QUERY_KEY(variables.id) });
      toast.success("地址更新成功");
    },
    onError: (error: Error) => {
      toast.error(error.message || "更新地址失败，请重试");
    },
  });
}

/**
 * Hook for deleting address
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteAddress(id, accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "删除地址失败");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
      toast.success("地址删除成功");
    },
    onError: (error: Error) => {
      toast.error(error.message || "删除地址失败，请重试");
    },
  });
}

/**
 * Hook for setting default address
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await setDefaultAddress(id, accessToken);
      if (response.code !== 0) {
        throw new Error(response.msg || "设置默认地址失败");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
      toast.success("已设为默认地址");
    },
    onError: (error: Error) => {
      toast.error(error.message || "设置默认地址失败，请重试");
    },
  });
}

/**
 * Combined hook for address operations
 */
export function useAddress() {
  const { data: addresses = [], isLoading, error, refetch } = useAddressList();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const defaultAddress = getDefaultAddress(addresses);

  return {
    // Data
    addresses,
    defaultAddress,
    isLoading,
    error,
    isEmpty: !isLoading && addresses.length === 0,
    refetch,

    // Mutations
    createAddress: createMutation.mutateAsync,
    updateAddress: updateMutation.mutateAsync,
    deleteAddress: deleteMutation.mutateAsync,
    setDefaultAddress: setDefaultMutation.mutateAsync,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      setDefaultMutation.isPending,
  };
}

