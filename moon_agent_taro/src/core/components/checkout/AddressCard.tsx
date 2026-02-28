/**
 * AddressCard - Delivery address display card
 * Migrated from moon-agent/components/checkout/AddressCard.tsx for Taro
 *
 * Requirements:
 * - Display receiver name, masked phone, full address
 * - Tap to navigate to address selection/modification
 * - If no address, show prompt to add
 */

import { View, Text } from "@tarojs/components";
import { Location, ArrowRight, Plus } from "@taroify/icons";
import { type SettlementAddress, maskPhoneNumber } from "@core/order/orderApi";

type AddressCardProps = {
  address?: SettlementAddress | null;
  onPress: () => void;
};

export function AddressCard({ address, onPress }: AddressCardProps) {
  const hasAddress = !!address;

  return (
    <View
      className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 active:bg-gray-50"
      onClick={onPress}
    >
      {/* Location Icon */}
      <View className="shrink-0">
        <View className="w-8 h-8 rounded-full bg-[#FFF5F7] flex items-center justify-center">
          <Location size={16} className="text-moon-pink" />
        </View>
      </View>

      {/* Address Content */}
      {hasAddress ? (
        <View className="flex-1 min-w-0">
          <View className="flex items-center gap-2 flex-wrap">
            <Text className="font-semibold text-moon-text text-base">
              {address.name}
            </Text>
            <Text className="text-moon-text-muted text-sm">
              {maskPhoneNumber(address.mobile)}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-moon-text-muted line-clamp-2">
            {address.areaName} {address.detailAddress}
          </Text>
        </View>
      ) : (
        <View className="flex-1 flex items-center gap-2">
          <Plus size={16} className="text-moon-pink" />
          <Text className="text-moon-text font-medium">添加收货地址</Text>
        </View>
      )}

      {/* Chevron Icon */}
      <View className="shrink-0">
        <ArrowRight size={20} className="text-gray-400" />
      </View>
    </View>
  );
}

export default AddressCard;
