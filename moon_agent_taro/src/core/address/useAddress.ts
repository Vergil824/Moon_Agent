/**
 * Address Hooks for Taro
 * Migrated from moon-agent/lib/address/useAddress.ts
 *
 * Provides hooks for:
 * - Fetching address list
 * - Getting default address
 */

import { useState, useCallback, useMemo } from "react";
import { useDidShow } from "@tarojs/taro";
import {
  getAddressList,
  getDefaultAddressFromList,
  type Address,
} from "./addressApi";

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage address data
 */
export function useAddress() {
  const [state, setState] = useState<AddressState>({
    addresses: [],
    isLoading: true,
    error: null,
  });

  // Fetch address list
  const fetchAddresses = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getAddressList();

      if (response.code === 0 && response.data) {
        setState({
          addresses: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: new Error(response.msg || "获取地址列表失败"),
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error("网络请求失败"),
      }));
    }
  }, []);

  // Refetch when page becomes visible
  useDidShow(() => {
    fetchAddresses();
  });

  // Computed: default address
  const defaultAddress = useMemo(
    () => getDefaultAddressFromList(state.addresses),
    [state.addresses]
  );

  return {
    // Data
    addresses: state.addresses,
    defaultAddress,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    refetch: fetchAddresses,
  };
}

// Export types
export type { Address };
