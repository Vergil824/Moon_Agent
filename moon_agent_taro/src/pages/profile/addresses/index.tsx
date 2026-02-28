/**
 * Address List Page
 * Migrated from moon-agent/app/profile/addresses/page.tsx for Taro
 *
 * Modes:
 * - Manage Mode (default): Click address -> edit; Click add -> create
 * - Select Mode (?mode=select): Click address -> select & return to callbackUrl
 */

import { useMemo, useCallback } from "react";
import { View, Text } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { Button } from "@nutui/nutui-react-taro";
import { Arrow, Add } from "@taroify/icons";
import { useAddress, type Address } from "@core/address";
import {
  AddressListItem,
  AddressEmptyState,
  AddressSkeleton,
} from "@core/components/address";

export default function AddressListPage() {
  const router = useRouter();

  // Parse URL params for mode handling
  const mode = router.params?.mode === "select" ? "select" : "manage";
  const callbackUrl = router.params?.callbackUrl || "";

  const { addresses, isLoading, error, refetch } = useAddress();

  // Computed: is empty
  const isEmpty = useMemo(
    () => !isLoading && addresses.length === 0,
    [isLoading, addresses.length]
  );

  // Page title based on mode
  const pageTitle = mode === "select" ? "选择收货地址" : "收货地址管理";

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (callbackUrl) {
      // Navigate to callback URL with selected address
      Taro.navigateTo({ url: callbackUrl });
    } else {
      Taro.navigateBack();
    }
  }, [callbackUrl]);

  // Handle add new address
  const handleAddAddress = useCallback(() => {
    const params = new URLSearchParams();
    if (mode === "select") {
      params.set("mode", "select");
    }
    if (callbackUrl) {
      params.set("callbackUrl", callbackUrl);
    }
    const queryString = params.toString();
    Taro.navigateTo({
      url: `/pages/profile/addresses/edit/index${queryString ? `?${queryString}` : ""}`,
    });
  }, [mode, callbackUrl]);

  // Handle main area click based on mode
  const handleMainClick = useCallback(
    (address: Address) => {
      if (mode === "select") {
        // Select mode: select this address and return
        // Pass the addressId back via the callback URL
        if (callbackUrl) {
          const url = new URL(callbackUrl, "http://localhost");
          url.searchParams.set("addressId", String(address.id));
          Taro.navigateTo({ url: `${url.pathname}${url.search}` });
        } else {
          Taro.navigateBack();
        }
      } else {
        // Manage mode: go to edit page
        Taro.navigateTo({
          url: `/pages/profile/addresses/edit/index?id=${address.id}`,
        });
      }
    },
    [mode, callbackUrl]
  );

  // Handle edit click (always go to edit page)
  const handleEditClick = useCallback(
    (address: Address) => {
      const params = new URLSearchParams();
      params.set("id", String(address.id));
      if (mode === "select") {
        params.set("mode", "select");
      }
      if (callbackUrl) {
        params.set("callbackUrl", callbackUrl);
      }
      Taro.navigateTo({
        url: `/pages/profile/addresses/edit/index?${params.toString()}`,
      });
    },
    [mode, callbackUrl]
  );

  return (
    <View className="flex flex-col min-h-screen bg-page-gradient">
      {/* Header */}
      <View className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <View
          className="w-10 h-10 flex items-center justify-center -ml-2"
          onClick={handleBack}
        >
          <Arrow direction="left" size={20} className="text-gray-600" />
        </View>
        <Text className="text-lg font-semibold text-moon-text flex-1">
          {pageTitle}
        </Text>
        {!isEmpty && (
          <Button
            fill="none"
            size="small"
            className="text-moon-purple!"
            onClick={handleAddAddress}
          >
            <View className="flex items-center gap-1">
              <Add size={14} />
              <Text>添加</Text>
            </View>
          </Button>
        )}
      </View>

      {/* Content */}
      <View className="flex-1 p-4">
        {isLoading ? (
          <AddressSkeleton />
        ) : error ? (
          <View className="flex flex-col items-center justify-center py-16 px-4">
            <Text className="text-moon-text-muted text-center mb-4 block">
              {error.message || "加载失败，请重试"}
            </Text>
            <Button type="default" size="small" onClick={refetch}>
              重试
            </Button>
          </View>
        ) : isEmpty ? (
          <AddressEmptyState onAddClick={handleAddAddress} />
        ) : (
          <View className="space-y-3">
            {addresses.map((address) => (
              <AddressListItem
                key={address.id}
                address={address}
                mode={mode}
                onMainClick={() => handleMainClick(address)}
                onEditClick={() => handleEditClick(address)}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
